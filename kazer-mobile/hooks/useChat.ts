/**
 * useChat — streaming conversation state.
 *
 * Owns the message list plus the in-flight assistant draft (content, tool runs,
 * sources, citations, reasoning). The stream is cancelled on unmount and on
 * `stop()`, so navigating away mid-answer never leaks a timer or a setState.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CitationRef,
  Conversation,
  Message,
  Mode,
  ModelId,
  Source,
  StreamChunk,
  ToolRun,
} from '@kazer/core';

import { kazer } from '../src/services';

export type StreamStatus =
  | 'idle'
  | 'thinking'
  | 'streaming'
  | 'done'
  | 'interrupted'
  | 'error';

export interface ChatDraft {
  content: string;
  reasoning: string;
  toolRuns: ToolRun[];
  sources: Source[];
  citations: CitationRef[];
  status: StreamStatus;
  /** Current step shown next to "KAZER está pensando". */
  step: string | null;
  error: string | null;
}

const EMPTY_DRAFT: ChatDraft = {
  content: '',
  reasoning: '',
  toolRuns: [],
  sources: [],
  citations: [],
  status: 'idle',
  step: null,
  error: null,
};

export interface SendOptions {
  mode: Mode;
  model: ModelId;
  skillId?: string | null;
}

export interface UseChatResult {
  messages: Message[];
  draft: ChatDraft;
  conversation: Conversation | null;
  isStreaming: boolean;
  loading: boolean;
  send: (content: string, options: SendOptions) => Promise<void>;
  stop: () => void;
  retry: (options: SendOptions) => Promise<void>;
}

let messageSeq = 0;

function nextLocalId(prefix: string): string {
  messageSeq += 1;
  return `${prefix}_local_${messageSeq}`;
}

export function useChat(conversationId: string | null): UseChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<ChatDraft>(EMPTY_DRAFT);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(conversationId));

  const iteratorRef = useRef<AsyncIterator<StreamChunk> | null>(null);
  const cancelledRef = useRef(false);
  const lastRequestRef = useRef<{ content: string; options: SendOptions } | null>(null);

  // Load the thread whenever the conversation changes.
  useEffect(() => {
    let active = true;
    setLoading(Boolean(conversationId));

    if (!conversationId) {
      setMessages([]);
      setConversation(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    void (async () => {
      const [loadedMessages, loadedConversation] = await Promise.all([
        kazer.chat.getMessages(conversationId),
        kazer.chat.getConversation(conversationId),
      ]);
      if (!active) return;
      setMessages(loadedMessages);
      setConversation(loadedConversation);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [conversationId]);

  // Tear the stream down when the screen goes away.
  useEffect(
    () => () => {
      cancelledRef.current = true;
      const iterator = iteratorRef.current;
      iteratorRef.current = null;
      if (iterator?.return) {
        void iterator.return(undefined).catch(() => undefined);
      }
    },
    [],
  );

  const patchDraft = useCallback((patch: Partial<ChatDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const run = useCallback(
    async (content: string, options: SendOptions) => {
      cancelledRef.current = false;
      lastRequestRef.current = { content, options };

      const userMessage: Message = {
        id: nextLocalId('msg'),
        conversationId: conversationId ?? 'pending',
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        mode: options.mode,
        model: null,
      };

      setMessages((current) => [...current, userMessage]);
      setDraft({ ...EMPTY_DRAFT, status: 'thinking', step: 'Interpretando o pedido' });

      const stream = kazer.chat.send({
        conversationId,
        content,
        mode: options.mode,
        model: options.model,
        skillId: options.skillId ?? null,
      });

      const iterator = stream[Symbol.asyncIterator]();
      iteratorRef.current = iterator;

      let answer = '';
      let reasoning = '';
      const toolRuns: ToolRun[] = [];
      const sources: Source[] = [];
      const citations: CitationRef[] = [];
      let followUps: string[] | undefined;
      let failure: string | null = null;

      try {
        for (;;) {
          const result = await iterator.next();
          if (cancelledRef.current) break;
          if (result.done) break;

          const chunk = result.value;

          switch (chunk.type) {
            case 'token':
              answer += chunk.text ?? '';
              patchDraft({
                content: answer,
                status: 'streaming',
                step: 'Escrevendo a resposta',
              });
              break;
            case 'reasoning':
              reasoning += chunk.text ?? '';
              patchDraft({ reasoning, status: 'thinking', step: 'Raciocinando' });
              break;
            case 'tool':
              if (chunk.toolRun) {
                toolRuns.push(chunk.toolRun);
                patchDraft({
                  toolRuns: [...toolRuns],
                  status: 'thinking',
                  step: chunk.toolRun.label,
                });
              }
              break;
            case 'source':
              if (chunk.source) {
                sources.push(chunk.source);
                patchDraft({ sources: [...sources] });
              }
              break;
            case 'citation':
              if (chunk.citation) {
                citations.push(chunk.citation);
                patchDraft({ citations: [...citations] });
              }
              break;
            case 'done':
              followUps = chunk.followUps;
              break;
            case 'error':
              failure = chunk.error ?? 'Falha desconhecida.';
              break;
          }
        }
      } catch (error) {
        failure = error instanceof Error ? error.message : 'Falha ao gerar a resposta.';
      } finally {
        iteratorRef.current = null;
      }

      if (cancelledRef.current) {
        // Partial answer stays on screen, flagged as interrupted.
        setDraft((current) => ({
          ...current,
          status: 'interrupted',
          step: null,
        }));
        return;
      }

      if (failure) {
        patchDraft({ status: 'error', error: failure, step: null });
        return;
      }

      const assistantMessage: Message = {
        id: nextLocalId('msg'),
        conversationId: conversationId ?? 'pending',
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
        mode: options.mode,
        model: options.model,
        reasoning: reasoning || null,
        citations: citations.length ? citations : undefined,
        toolRuns: toolRuns.length ? toolRuns : undefined,
        followUps,
      };

      setMessages((current) => [...current, assistantMessage]);
      setDraft(EMPTY_DRAFT);
    },
    [conversationId, patchDraft],
  );

  const send = useCallback(
    async (content: string, options: SendOptions) => {
      const trimmed = content.trim();
      if (trimmed.length === 0) return;
      await run(trimmed, options);
    },
    [run],
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    const iterator = iteratorRef.current;
    iteratorRef.current = null;
    if (iterator?.return) {
      void iterator.return(undefined).catch(() => undefined);
    }
  }, []);

  const retry = useCallback(
    async (options: SendOptions) => {
      const last = lastRequestRef.current;
      if (!last) return;
      // Drop the failed turn and run it again.
      setMessages((current) => {
        let assistantIndex = -1;
        for (let index = current.length - 1; index >= 0; index -= 1) {
          if (current[index]?.role === 'assistant') {
            assistantIndex = index;
            break;
          }
        }
        if (assistantIndex === -1) return current;
        return current.slice(0, assistantIndex);
      });
      setDraft(EMPTY_DRAFT);
      await run(last.content, options);
    },
    [run],
  );

  const isStreaming =
    draft.status === 'thinking' || draft.status === 'streaming' || draft.status === 'interrupted';

  return useMemo(
    () => ({
      messages,
      draft,
      conversation,
      isStreaming,
      loading,
      send,
      stop,
      retry,
    }),
    [messages, draft, conversation, isStreaming, loading, send, stop, retry],
  );
}
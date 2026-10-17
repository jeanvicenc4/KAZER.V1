'use client';

import * as React from 'react';
import {
  createMockChatAdapter,
  createMockResearchAdapter,
  type ChatAdapter,
  type ResearchAdapter,
  type StreamChunk,
} from '@kazer/core';
import type { Message, Mode, ModelId } from '@kazer/core';

/**
 * useChat — streaming chat over the adapter.
 * The adapter is injected so the real Vercel AI SDK implementation can be
 * swapped in without touching this hook or any component.
 */

export interface UseChatOptions {
  adapter?: ChatAdapter;
  conversationId?: string | null;
  mode?: Mode;
  model?: ModelId;
  onComplete?: (message: Message) => void;
  /** Pre-existing messages to hydrate the thread with. */
  initialMessages?: Message[];
}

export interface UseChatResult {
  messages: Message[];
  streaming: boolean;
  error: string | null;
  send: (content: string, overrides?: Partial<UseChatOptions>) => Promise<void>;
  regenerate: (messageId: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
  hydrate: (messages: Message[]) => void;
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const adapterRef = React.useRef<ChatAdapter>(
    options.adapter ?? createMockChatAdapter(),
  );
  const [messages, setMessages] = React.useState<Message[]>(
    options.initialMessages ?? [],
  );
  const [streaming, setStreaming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef(false);
  const mountedRef = React.useRef(true);

  const hydrate = React.useCallback((next: Message[]) => {
    setMessages(next);
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current = true;
    };
  }, []);

  const send = React.useCallback(
    async (content: string, overrides: Partial<UseChatOptions> = {}) => {
      const mode = overrides.mode ?? options.mode ?? 'chat';
      const model = overrides.model ?? options.model ?? 'kazer-4';
      const conversationId =
        overrides.conversationId ?? options.conversationId ?? null;

      setError(null);
      setStreaming(true);
      abortRef.current = false;

      const userMessage: Message = {
        id: `msg_u_${Date.now()}`,
        conversationId: conversationId ?? 'pending',
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
        mode,
        model: null,
      };
      setMessages((prev) => [...prev, userMessage]);

      const assistantId = `msg_a_${Date.now()}`;
      const partial: Message = {
        id: assistantId,
        conversationId: conversationId ?? 'pending',
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        mode,
        model,
        citations: [],
        toolRuns: [],
        streaming: true,
      };

      setMessages((prev) => [...prev, partial]);

      const patch = (fn: (message: Message) => Message) => {
        if (!mountedRef.current) return;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? fn(m) : m)),
        );
      };

      try {
        const stream = adapterRef.current.send({
          conversationId,
          content,
          mode,
          model,
        });

        for await (const chunk of stream as AsyncIterable<StreamChunk>) {
          if (abortRef.current) break;

          switch (chunk.type) {
            case 'token':
              patch((m) => ({ ...m, content: m.content + (chunk.text ?? '') }));
              break;
            case 'reasoning':
              patch((m) => ({
                ...m,
                reasoning: (m.reasoning ?? '') + (chunk.text ?? ''),
              }));
              break;
            case 'tool':
              if (chunk.toolRun) {
                patch((m) => ({
                  ...m,
                  toolRuns: [...(m.toolRuns ?? []), chunk.toolRun as never],
                }));
              }
              break;
            case 'source':
              break;
            case 'citation':
              if (chunk.citation) {
                patch((m) => ({
                  ...m,
                  citations: [...(m.citations ?? []), chunk.citation as never],
                }));
              }
              break;
            case 'done':
              patch((m) => ({
                ...m,
                streaming: false,
                followUps: chunk.followUps,
              }));
              break;
            case 'error':
              setError(chunk.error ?? 'Erro desconhecido.');
              patch((m) => ({ ...m, streaming: false, interrupted: true }));
              break;
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível concluir.';
        setError(message);
        patch((m) => ({ ...m, streaming: false, interrupted: true }));
      } finally {
        if (mountedRef.current) setStreaming(false);
      }
    },
    [options.conversationId, options.mode, options.model],
  );

  const regenerate = React.useCallback(
    async (messageId: string) => {
      setError(null);
      setStreaming(true);
      abortRef.current = false;

      const index = messages.findIndex((m) => m.id === messageId);
      if (index === -1) return;

      setMessages((prev) => prev.slice(0, index));

      try {
        const stream = adapterRef.current.regenerate(messageId);
        let text = '';
        for await (const chunk of stream as AsyncIterable<StreamChunk>) {
          if (abortRef.current) break;
          if (chunk.type === 'token') text += chunk.text ?? '';
          if (chunk.type === 'done') break;
        }
        if (mountedRef.current && text) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_a_regen_${Date.now()}`,
              conversationId: 'pending',
              role: 'assistant',
              content: text,
              createdAt: new Date().toISOString(),
              mode: 'chat',
              model: 'kazer-4',
            },
          ]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Não foi possível regenerar.',
        );
      } finally {
        if (mountedRef.current) setStreaming(false);
      }
    },
    [messages],
  );

  const stop = React.useCallback(() => {
    abortRef.current = true;
    setStreaming(false);
    setMessages((prev) =>
      prev.map((m) =>
        m.streaming ? { ...m, streaming: false, interrupted: true } : m,
      ),
    );
  }, []);

  const reset = React.useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  return { messages, streaming, error, send, regenerate, stop, reset, hydrate };
}

/** useResearch — the Research mode wrapper around the same streaming core. */
export function useResearch(adapter?: ResearchAdapter) {
  const adapterRef = React.useRef<ResearchAdapter>(
    adapter ?? createMockResearchAdapter(),
  );
  const [state, setState] = React.useState<{
    running: boolean;
    answer: string;
    sources: import('@kazer/core').Source[];
    queries: string[];
    error: string | null;
  }>({ running: false, answer: '', sources: [], queries: [], error: null });

  const run = React.useCallback(async (question: string) => {
    setState({ running: true, answer: '', sources: [], queries: [], error: null });

    let answer = '';
    const sources: import('@kazer/core').Source[] = [];

    try {
      for await (const chunk of adapterRef.current.run(question, 'research')) {
        if (chunk.type === 'token') {
          answer += chunk.text ?? '';
          setState((prev) => ({ ...prev, answer }));
        } else if (chunk.type === 'source' && chunk.source) {
          sources.push(chunk.source);
          setState((prev) => ({ ...prev, sources: [...sources] }));
        }
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Falha na pesquisa.',
      }));
    } finally {
      setState((prev) => ({ ...prev, running: false }));
    }
  }, []);

  return { ...state, run };
}

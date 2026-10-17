'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe, Search } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { useWorkspace } from '@/components/workspace/workspace-context';
import { Composer } from '@/components/chat/composer';
import { AssistantMessage, UserMessage } from '@/components/chat/message';
import { useChat } from '@/hooks/use-chat';
import { models } from '@kazer/core';

/**
 * /kazer/research — Research mode.
 * Forced to the research mode: the panel opens on Fontes and the header
 * shows how many results were read versus how many were cited.
 */

const SUGGESTIONS = [
  'Qual o melhor modelo de IA para análise de documentos em português?',
  'Como está o mercado de IA generativa no Brasil em 2026?',
  'Comparar preços de API de LLM para uso em produção',
];

export default function ResearchPage() {
  const router = useRouter();
  const workspace = useWorkspace();
  const [activeCitation, setActiveCitation] = React.useState<number | null>(null);
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    workspace.setMode('research');
  }, [workspace]);

  const chat = useChat({
    adapter: workspace.chatAdapter,
    mode: 'research',
    model: 'kazer-4-reasoning',
  });

  const citedCount = chat.messages
    .flatMap((m) => m.citations ?? [])
    .reduce((max, m) => Math.max(max, m.index), 0);

  return (
    <WorkspaceShell
      conversations={workspace.conversations}
      sources={workspace.sources}
      artifacts={workspace.artifacts}
      toolRuns={chat.messages.flatMap((m) => m.toolRuns ?? [])}
      activeCitation={activeCitation}
      onCitationSelect={setActiveCitation}
      onNewMission={() => router.push('/kazer')}
      onSelectConversation={(c) => router.push(`/kazer/chat/${c.id}`)}
      onToggleSaveSource={workspace.toggleSaveSource}
      mode="research"
    >
      <div className="mx-auto w-full max-w-[720px] px-5 py-7">
        {!chat.messages.length ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--kazer-line)] bg-[var(--kazer-surface)] text-[var(--kazer-cyan)]">
              <Globe size={18} />
            </span>
            <h1 className="mt-4 text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
              Research
            </h1>
            <p className="mt-2 max-w-[50ch] text-[15px] leading-[24px] text-[var(--kazer-text-2)]">
              O KAZER gera de 3 a 5 buscas, lê as páginas, pesa as fontes e
              responde com citação onde a afirmação acontece.
            </p>

            <div className="mt-7 space-y-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => chat.send(suggestion)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] px-3.5 py-3 text-left text-[14px] text-[var(--kazer-text-2)] transition-all duration-150 hover:border-[var(--kazer-line-gold)] hover:bg-[var(--kazer-gold-wash)] hover:text-[var(--kazer-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
                >
                  <Search size={14} className="shrink-0 text-[var(--kazer-text-3)]" />
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {/* Read / cited summary */}
            <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] px-3.5 py-2.5">
              <span className="text-[13px] text-[var(--kazer-text-2)]">
                <span className="font-mono tabular-nums text-[var(--kazer-text)]">
                  12
                </span>{' '}
                resultados lidos
              </span>
              <span aria-hidden className="h-3 w-px bg-[var(--kazer-line)]" />
              <span className="text-[13px] text-[var(--kazer-text-2)]">
                <span className="font-mono tabular-nums text-[var(--kazer-gold-text)]">
                  {citedCount || 5}
                </span>{' '}
                citados
              </span>
              <span aria-hidden className="h-3 w-px bg-[var(--kazer-line)]" />
              <span className="text-[13px] text-[var(--kazer-text-3)]">
                4 consultas em paralelo
              </span>
            </div>

            <div className="space-y-7">
              {chat.messages.map((message) =>
                message.role === 'user' ? (
                  <UserMessage key={message.id} message={message} />
                ) : (
                  <AssistantMessage
                    key={message.id}
                    message={message}
                    sources={workspace.sources}
                    activeCitation={activeCitation}
                    onCitationClick={setActiveCitation}
                    streaming={message.streaming}
                    onRegenerate={() => chat.regenerate(message.id)}
                  />
                ),
              )}
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-0 bg-gradient-to-t from-[var(--kazer-base)] via-[var(--kazer-base)] to-transparent px-5 pb-4 pt-2">
        <div className="mx-auto w-full max-w-[720px]">
          <Composer
            mode="research"
            onModeChange={(mode) => {
              workspace.setMode(mode);
              if (mode !== 'research') router.push('/kazer');
            }}
            models={models}
            model="kazer-4-reasoning"
            onModelChange={(id) => workspace.setModel(id as never)}
            onSubmit={(value) => {
              setQuery(value);
              chat.send(value, { mode: 'research' });
            }}
            streaming={chat.streaming}
            onStop={chat.stop}
          />
        </div>
      </div>
    </WorkspaceShell>
  );
}

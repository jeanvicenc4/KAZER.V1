'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Compass, Code2, FileText, TrendingUp } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { useWorkspace } from '@/components/workspace/workspace-context';
import { Composer } from '@/components/chat/composer';
import { models } from '@kazer/core';
import { cn } from '@/lib/utils';

/**
 * /kazer — the main workspace.
 * Empty state: the mark, a short capability line, 4 mission templates and
 * the Skills. The composer is always present so the next question is one
 * keystroke away.
 */

const MISSIONS = [
  {
    icon: Compass,
    label: 'Pesquisar',
    title: 'Pesquise e cite',
    description:
      'O KAZER busca em paralelo, lê as fontes e responde com citação em cada afirmação.',
    prompt:
      'Compare as principais opções de IA para suporte ao cliente no Brasil em 2026, com preço, latência e o que cada uma entrega melhor.',
    mode: 'research' as const,
  },
  {
    icon: FileText,
    label: 'Documento',
    title: 'Crie um documento',
    description:
      'Relatório, proposta ou contrato. O KAZER entrega em Markdown, PDF ou DOCX.',
    prompt:
      'Escreva um relatório de 2 páginas sobre o estado da adoption de IA em empresas médias brasileiras, com dados e fontes.',
    mode: 'mission' as const,
  },
  {
    icon: Code2,
    label: 'Código',
    title: 'Revise um código',
    description:
      'Análise, refatoração com testes propostos e plano de migração passo a passo.',
    prompt:
      'Tenho um módulo de autenticação com duplicação de lógica entre três serviços. Analise o acoplamento e proponha um plano de extração.',
    mode: 'chat' as const,
  },
  {
    icon: TrendingUp,
    label: 'Estratégia',
    title: 'Planeje o lançamento',
    description:
      'Posicionamento, ICP, canais de aquisição e métricas que valem a pena olhar.',
    prompt:
      'Monte uma estratégia de lançamento para um produto SaaS B2B deprecado. Quem é o ICP, quais canais usar nos primeiros 90 dias.',
    mode: 'mission' as const,
  },
];

export default function KazerPage() {
  const router = useRouter();
  const workspace = useWorkspace();
  const [composerValue, setComposerValue] = React.useState('');

  const startMission = async (prompt: string, mode: 'chat' | 'research' | 'mission') => {
    workspace.setMode(mode);
    const conversation = await workspace.createConversation(
      prompt.slice(0, 52),
      mode,
    );
    router.push(`/kazer/chat/${conversation.id}?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <WorkspaceShell
      conversations={workspace.conversations}
      sources={workspace.sources}
      artifacts={workspace.artifacts}
      onNewMission={() => router.push('/kazer')}
      onSelectConversation={(c) => router.push(`/kazer/chat/${c.id}`)}
      onRenameConversation={(c) => {
        const title = window.prompt('Novo nome da conversa', c.title);
        if (title?.trim()) workspace.renameConversation(c.id, title.trim());
      }}
      onPinConversation={(c) => workspace.togglePin(c.id)}
      onArchiveConversation={(c) => workspace.toggleArchive(c.id)}
      onDeleteConversation={(c) => workspace.deleteConversation(c.id)}
      onToggleSaveSource={workspace.toggleSaveSource}
      mode={workspace.mode}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <h1 className="text-[28px] font-medium leading-[34px] tracking-[-0.02em] text-[var(--kazer-text)]">
            O que o KAZER pode fazer por você?
          </h1>
          <p className="mt-2 max-w-[52ch] text-[15px] leading-[24px] text-[var(--kazer-text-2)]">
            Escolha uma missão ou pergunte qualquer coisa. As respostas vêm com
            fonte, e o resultado vira arquivo.
          </p>

          <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {MISSIONS.map((mission, index) => (
              <motion.button
                key={mission.title}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.06 * index,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => startMission(mission.prompt, mission.mode)}
                className={cn(
                  'group flex flex-col items-start rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-4 text-left',
                  'transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--kazer-line-gold)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] text-[var(--kazer-gold)] transition-colors group-hover:border-[var(--kazer-line-gold)]">
                  <mission.icon size={15} />
                </span>
                <h2 className="mt-3 text-[15px] font-medium leading-[20px] text-[var(--kazer-text)]">
                  {mission.title}
                </h2>
                <p className="mt-1.5 text-[13px] leading-[19px] text-[var(--kazer-text-2)]">
                  {mission.description}
                </p>
                <span className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
                  {mission.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Recent activity */}
          <div className="mt-10 border-t border-[var(--kazer-line)] pt-6">
            <h2 className="text-[13px] font-medium uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
              Continuar de onde parou
            </h2>
            <ul className="mt-3 space-y-1">
              {workspace.conversations.slice(0, 4).map((conversation) => (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => router.push(`/kazer/chat/${conversation.id}`)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-[var(--kazer-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] text-[var(--kazer-text)]">
                        {conversation.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-[var(--kazer-text-3)]">
                        {conversation.preview}
                      </span>
                    </span>
                    {conversation.sourceCount ? (
                      <span className="shrink-0 font-mono text-[11px] text-[var(--kazer-text-3)]">
                        {conversation.sourceCount} fontes
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Composer */}
        <div className="sticky bottom-0 mt-8 bg-gradient-to-t from-[var(--kazer-base)] via-[var(--kazer-base)] to-transparent pb-4 pt-6">
          <Composer
            mode={workspace.mode}
            onModeChange={workspace.setMode}
            models={models}
            model={workspace.model}
            onModelChange={(id) => workspace.setModel(id as never)}
            onSubmit={(value) => startMission(value, workspace.mode)}
          />
        </div>
      </div>
    </WorkspaceShell>
  );
}

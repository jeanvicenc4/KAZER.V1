'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, FileText, PanelRight, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceSidebar } from '@/components/workspace/sidebar';
import { RightPanel, type PanelTab } from '@/components/workspace/right-panel';
import { PaywallModal, PAYWALL_COPY } from '@/components/billing/paywall-modal';
import { usePlan } from '@/hooks/use-kazer';
import {
  TERMINAL_EXECUTION_TOOL,
  type Artifact,
  type Conversation,
  type Mode,
  type ModelId,
  type Source,
  type ToolRun,
} from '@kazer/core';

/**
 * WorkspaceShell — the three-column "Agent OS" layout.
 *
 *   sidebar (264px)  |  chat (fluid, 720px reading column)  |  panel (340px)
 *
 * Below 1280px the right panel collapses into a bottom sheet triggered by
 * chips in the chat header — it never simply disappears.
 */

export interface WorkspaceShellProps {
  children: React.ReactNode;
  conversations: Conversation[];
  sources?: Source[];
  artifacts?: Artifact[];
  toolRuns?: ToolRun[];
  terminalReady?: boolean;
  activeCitation?: number | null;
  onCitationSelect?: (index: number) => void;
  onNewMission?: () => void;
  onSelectConversation?: (conversation: Conversation) => void;
  onToggleSaveSource?: (source: Source) => void;
  onPreviewArtifact?: (artifact: Artifact) => void;
  onDownloadArtifact?: (artifact: Artifact) => void;
  onRenameConversation?: (conversation: Conversation) => void;
  onPinConversation?: (conversation: Conversation) => void;
  onArchiveConversation?: (conversation: Conversation) => void;
  onDeleteConversation?: (conversation: Conversation) => void;
  mode?: Mode;
}

export function WorkspaceShell({
  children,
  conversations,
  sources = [],
  artifacts = [],
  toolRuns = [],
  terminalReady = false,
  activeCitation,
  onCitationSelect,
  onNewMission,
  onSelectConversation,
  onToggleSaveSource,
  onPreviewArtifact,
  onDownloadArtifact,
  onRenameConversation,
  onPinConversation,
  onArchiveConversation,
  onDeleteConversation,
  mode = 'chat',
}: WorkspaceShellProps) {
  const [mobileSidebar, setMobileSidebar] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [panelTab, setPanelTab] = React.useState<PanelTab>('sources');
  const { plan, setDemoPlan } = usePlan();
  const router = useRouter();
  const pathname = usePathname();
  const terminalRunCount = toolRuns.filter(
    (run) => run.name === TERMINAL_EXECUTION_TOOL,
  ).length;

  const openSheet = (tab: PanelTab) => {
    setPanelTab(tab);
    setSheetOpen(true);
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--kazer-base)]">
      {/* Sidebar — desktop */}
      <div className="hidden w-[264px] shrink-0 lg:block">
        <WorkspaceSidebar
          conversations={conversations}
          onSelect={(c) => {
            onSelectConversation?.(c);
            router.push(`/kazer/chat/${c.id}`);
          }}
          onNewMission={() => onNewMission?.()}
          onRename={onRenameConversation}
          onPin={onPinConversation}
          onArchive={onArchiveConversation}
          onDelete={onDeleteConversation}
        />
      </div>

      {/* Sidebar — mobile drawer */}
      <AnimatePresence>
        {mobileSidebar ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebar(false)}
              className="fixed inset-0 z-[200] bg-[oklch(0_0_0/60%)] backdrop-blur-[4px] lg:hidden"
              aria-hidden
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-[210] w-[86vw] max-w-[300px] lg:hidden"
              role="dialog"
              aria-label="Histórico de conversas"
            >
              <WorkspaceSidebar
                conversations={conversations}
                onSelect={(c) => {
                  onSelectConversation?.(c);
                  setMobileSidebar(false);
                  router.push(`/kazer/chat/${c.id}`);
                }}
                onNewMission={() => {
                  setMobileSidebar(false);
                  onNewMission?.();
                }}
                onRename={onRenameConversation}
                onPin={onPinConversation}
                onArchive={onArchiveConversation}
                onDelete={onDeleteConversation}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--kazer-line)] px-3 lg:px-4">
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            aria-label="Abrir histórico"
            className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--kazer-text-2)] transition-colors hover:bg-[var(--kazer-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)] lg:hidden"
          >
            <PanelRight size={16} className="rotate-180" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[14px] font-medium text-[var(--kazer-text)]">
              {pathname === '/kazer'
                ? 'Nova missão'
                : pathname.includes('/research')
                  ? 'Research'
                  : 'Conversa'}
            </h1>
          </div>

          {/* Panel chips — below 1280px the panel becomes a bottom sheet */}
          <div className="flex items-center gap-1 xl:hidden">
            <PanelChip
              icon={BookOpen}
              label="Fontes"
              count={sources.length}
              onClick={() => openSheet('sources')}
            />
            <PanelChip
              icon={FileText}
              label="Artefatos"
              count={artifacts.length}
              onClick={() => openSheet('artifacts')}
            />
            <PanelChip
              icon={Terminal}
              label="Execução"
              count={terminalRunCount}
              onClick={() => openSheet('execution')}
            />
          </div>
        </header>

        <main className="kazer-scroll flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Right panel — desktop */}
      <div className="hidden w-[340px] shrink-0 xl:block">
        <RightPanel
          sources={sources}
          artifacts={artifacts}
          toolRuns={toolRuns}
          terminalReady={terminalReady}
          activeCitation={activeCitation}
          onCitationSelect={onCitationSelect}
          onToggleSave={onToggleSaveSource}
          onPreviewArtifact={onPreviewArtifact}
          onDownloadArtifact={onDownloadArtifact}
        />
      </div>

      {/* Right panel — mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[300] bg-[oklch(0_0_0/60%)] backdrop-blur-[4px] xl:hidden"
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-label="Painel de trabalho"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 z-[310] max-h-[78vh] overflow-hidden rounded-t-[20px] border-t border-[var(--kazer-line-strong)] bg-[var(--kazer-surface)] xl:hidden"
            >
              <div className="flex justify-center pt-2.5 pb-1">
                <span
                  aria-hidden
                  className="h-1 w-9 rounded-full bg-[var(--kazer-line-active)]"
                />
              </div>
              <RightPanel
                className="h-[calc(78vh-24px)] border-l-0"
                sources={sources}
                artifacts={artifacts}
                toolRuns={toolRuns}
                terminalReady={terminalReady}
                activeCitation={activeCitation}
                onCitationSelect={onCitationSelect}
                onToggleSave={onToggleSaveSource}
                onPreviewArtifact={onPreviewArtifact}
                onDownloadArtifact={onDownloadArtifact}
                onClose={() => setSheetOpen(false)}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PanelChip({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-surface)] px-2.5 text-[13px] text-[var(--kazer-text-2)]',
        'transition-colors hover:border-[var(--kazer-line-active)] hover:text-[var(--kazer-text)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
      )}
    >
      <Icon size={13} />
      <span className="hidden sm:inline">{label}</span>
      {count ? (
        <span className="font-mono text-[10px] text-[var(--kazer-text-3)]">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export { PAYWALL_COPY };

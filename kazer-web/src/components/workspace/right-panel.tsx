'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Search,
  Terminal,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceCard } from '@/components/sources/source-card';
import { ArtifactRow } from '@/components/artifacts/artifact-card';
import { ToolRunRow } from '@/components/chat/tool-run-row';
import type { Artifact, Source, ToolRun } from '@kazer/core';

/**
 * RightPanel — three tabs: Fontes · Artefatos · Execução.
 * On < 1280px this becomes a bottom sheet (see WorkspaceShell).
 */

export type PanelTab = 'sources' | 'artifacts' | 'execution';

const TABS: { id: PanelTab; label: string; icon: React.ElementType }[] = [
  { id: 'sources', label: 'Fontes', icon: BookOpen },
  { id: 'artifacts', label: 'Artefatos', icon: FileText },
  { id: 'execution', label: 'Execução', icon: Terminal },
];

export function RightPanel({
  sources,
  artifacts,
  toolRuns,
  activeCitation,
  onCitationSelect,
  onToggleSave,
  onPreviewArtifact,
  onDownloadArtifact,
  onClose,
  className,
}: {
  sources: Source[];
  artifacts: Artifact[];
  toolRuns: ToolRun[];
  activeCitation?: number | null;
  onCitationSelect?: (index: number) => void;
  onToggleSave?: (source: Source) => void;
  onPreviewArtifact?: (artifact: Artifact) => void;
  onDownloadArtifact?: (artifact: Artifact) => void;
  onClose?: () => void;
  className?: string;
}) {
  const [tab, setTab] = React.useState<PanelTab>('sources');
  const [query, setQuery] = React.useState('');

  const filteredSources = React.useMemo(() => {
    if (!query.trim()) return sources;
    const q = query.toLowerCase();
    return sources.filter(
      (s) =>
        s.title.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q),
    );
  }, [sources, query]);

  return (
    <aside
      aria-label="Painel de trabalho"
      className={cn(
        'flex h-full flex-col border-l border-[var(--kazer-line)] bg-[var(--kazer-surface)]',
        className,
      )}
    >
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Painéis do KAZER"
        className="flex h-14 shrink-0 items-center gap-1 border-b border-[var(--kazer-line)] px-2"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === tab;
          const count =
            t.id === 'sources'
              ? sources.length
              : t.id === 'artifacts'
                ? artifacts.length
                : toolRuns.length;

          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              className={cn(
                'relative flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                isActive
                  ? 'text-[var(--kazer-text)]'
                  : 'text-[var(--kazer-text-3)] hover:text-[var(--kazer-text-2)]',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="right-panel-tab"
                  transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                  className="absolute inset-x-1 bottom-0 h-px bg-[var(--kazer-gold)]"
                />
              ) : null}
              <Icon size={13} />
              <span className="hidden sm:inline">{t.label}</span>
              {count ? (
                <span className="font-mono text-[10px] text-[var(--kazer-text-3)]">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--kazer-text-3)] transition-colors hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
          className="kazer-scroll flex-1 overflow-y-auto p-3"
        >
          {tab === 'sources' ? (
            <SourcesTab
              sources={filteredSources}
              total={sources.length}
              query={query}
              onQueryChange={setQuery}
              activeCitation={activeCitation}
              onSelect={onCitationSelect}
              onToggleSave={onToggleSave}
            />
          ) : null}

          {tab === 'artifacts' ? (
            <ArtifactsTab
              artifacts={artifacts}
              onPreview={onPreviewArtifact}
              onDownload={onDownloadArtifact}
            />
          ) : null}

          {tab === 'execution' ? (
            <ExecutionTab toolRuns={toolRuns} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

function SourcesTab({
  sources,
  total,
  query,
  onQueryChange,
  activeCitation,
  onSelect,
  onToggleSave,
}: {
  sources: Source[];
  total: number;
  query: string;
  onQueryChange: (value: string) => void;
  activeCitation?: number | null;
  onSelect?: (index: number) => void;
  onToggleSave?: (source: Source) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search
          size={12}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--kazer-text-3)]"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filtrar por título ou domínio"
          aria-label="Filtrar fontes"
          className={cn(
            'h-8 w-full rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] pl-7 pr-2 text-[13px] text-[var(--kazer-text)]',
            'placeholder:text-[var(--kazer-text-3)]',
            'focus:border-[var(--kazer-line-gold)] focus:outline-none',
          )}
        />
      </div>

      {sources.length ? (
        <>
          {sources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.22,
                delay: Math.min(index, 6) * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <SourceCard
                source={source}
                active={activeCitation === source.index}
                onSelect={() => onSelect?.(source.index)}
                onToggleSave={() => onToggleSave?.(source)}
              />
            </motion.div>
          ))}

          <p className="px-1 pt-1 text-[12px] text-[var(--kazer-text-3)]">
            {sources.length} de {total} fontes
          </p>
        </>
      ) : (
        <EmptyPanel
          icon={BookOpen}
          title={query ? 'Nenhuma fonte encontrada' : 'Nenhuma fonte ainda'}
          description={
            query
              ? 'Ajuste o filtro para ver outras fontes.'
              : 'As fontes consultadas pelo KAZER aparecem aqui, com o trecho usado.'
          }
        />
      )}
    </div>
  );
}

function ArtifactsTab({
  artifacts,
  onPreview,
  onDownload,
}: {
  artifacts: Artifact[];
  onPreview?: (a: Artifact) => void;
  onDownload?: (a: Artifact) => void;
}) {
  if (!artifacts.length) {
    return (
      <EmptyPanel
        icon={FileText}
        title="Nenhum artefato ainda"
        description="Quando o KAZER entregar um documento, planilha ou código, ele aparece aqui."
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {artifacts.map((artifact, index) => (
        <motion.div
          key={artifact.id}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.22,
            delay: Math.min(index, 6) * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ArtifactRow
            artifact={artifact}
            onClick={() => onPreview?.(artifact)}
            onDownload={() => onDownload?.(artifact)}
          />
        </motion.div>
      ))}
    </div>
  );
}

function ExecutionTab({ toolRuns }: { toolRuns: ToolRun[] }) {
  if (!toolRuns.length) {
    return (
      <EmptyPanel
        icon={Terminal}
        title="Nenhuma execução registrada"
        description="Cada ferramenta que o KAZER aciona aparece aqui, com status e duração."
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {toolRuns.map((run, index) => (
        <motion.div
          key={run.id}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.22,
            delay: Math.min(index, 6) * 0.04,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <ToolRunRow run={run} />
        </motion.div>
      ))}
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--kazer-line)] bg-[var(--kazer-inset)] text-[var(--kazer-text-3)]">
        <Icon size={16} />
      </span>
      <p className="mt-3 text-[14px] font-medium text-[var(--kazer-text-2)]">
        {title}
      </p>
      <p className="mt-1 max-w-[220px] text-[13px] leading-[18px] text-[var(--kazer-text-3)]">
        {description}
      </p>
    </div>
  );
}

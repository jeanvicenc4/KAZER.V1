'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { useWorkspace } from '@/components/workspace/workspace-context';
import { useArtifacts, usePlan } from '@/hooks/use-kazer';
import { ArtifactCard, ArtifactTypeIcon } from '@/components/artifacts/artifact-card';
import { PaywallModal, PAYWALL_COPY } from '@/components/billing/paywall-modal';
import { Button } from '@/components/ui/button';
import { cn, formatBytes } from '@/lib/utils';
import type { Artifact, ArtifactType } from '@kazer/core';

const TYPE_FILTERS: { id: ArtifactType | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'document', label: 'Documentos' },
  { id: 'report', label: 'Relatórios' },
  { id: 'spreadsheet', label: 'Planilhas' },
  { id: 'code', label: 'Código' },
  { id: 'landing', label: 'Landing pages' },
  { id: 'image', label: 'Imagens' },
];

export default function ArtifactsPage() {
  const router = useRouter();
  const workspace = useWorkspace();
  const { artifacts, loading, download } = useArtifacts();
  const { plan, canUse, subscribe } = usePlan();
  const [filter, setFilter] = React.useState<ArtifactType | 'all'>('all');
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<Artifact | null>(null);

  const filtered =
    filter === 'all' ? artifacts : artifacts.filter((a) => a.type === filter);

  const totalSize = artifacts.reduce((sum, a) => sum + a.sizeBytes, 0);

  const handleDownload = async (artifact: Artifact) => {
    const allowed = artifact.locked ? await canUse('artifacts') : true;
    if (!allowed) {
      setPaywallOpen(true);
      return;
    }
    await download(artifact);
  };

  return (
    <WorkspaceShell
      conversations={workspace.conversations}
      sources={workspace.sources}
      artifacts={artifacts}
      onNewMission={() => router.push('/kazer')}
      onSelectConversation={(c) => router.push(`/kazer/chat/${c.id}`)}
      onToggleSaveSource={workspace.toggleSaveSource}
      onPreviewArtifact={setPreview}
      onDownloadArtifact={handleDownload}
    >
      <div className="mx-auto w-full max-w-[1000px] px-5 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
              Artefatos
            </h1>
            <p className="mt-1.5 max-w-[52ch] text-[15px] leading-[23px] text-[var(--kazer-text-2)]">
              Tudo que o KAZER entregou. Versionado e vinculado à conversa de
              origem.
            </p>
          </div>
          <p className="font-mono text-[12px] text-[var(--kazer-text-3)]">
            {artifacts.length} arquivos · {formatBytes(totalSize)}
          </p>
        </header>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                filter === f.id
                  ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)]'
                  : 'border-[var(--kazer-line)] text-[var(--kazer-text-2)] hover:border-[var(--kazer-line-active)] hover:text-[var(--kazer-text)]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="kazer-skeleton h-[132px] rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)]"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {filtered.map((artifact, index) => (
              <motion.div
                key={artifact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: Math.min(index, 8) * 0.035,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ArtifactCard
                  artifact={artifact}
                  onPreview={setPreview}
                  onDownload={handleDownload}
                  onShare={setPreview}
                  onUnlock={async (a) => {
                    const allowed = await canUse('artifacts');
                    if (allowed) {
                      await handleDownload(a);
                    } else {
                      setPaywallOpen(true);
                    }
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--kazer-line)] bg-[var(--kazer-surface)] text-[var(--kazer-text-3)]">
              <Download size={17} />
            </span>
            <p className="mt-3.5 text-[15px] text-[var(--kazer-text-2)]">
              Nenhum artefato com esse filtro.
            </p>
            <p className="mt-1 max-w-[34ch] text-[13px] leading-[19px] text-[var(--kazer-text-3)]">
              Peça ao KAZER um documento, uma planilha ou uma landing page e ele
              aparece aqui.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={() => router.push('/kazer')}
            >
              Nova missão
            </Button>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview ? (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[oklch(0_0_0/72%)] backdrop-blur-[8px]"
            onClick={() => setPreview(null)}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Pré-visualização de ${preview.name}`}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[560px] overflow-hidden rounded-[20px] border border-[var(--kazer-line-strong)] bg-[var(--kazer-surface)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center gap-2.5 border-b border-[var(--kazer-line)] px-4 py-3">
              <ArtifactTypeIcon type={preview.type} size={16} />
              <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--kazer-text)]">
                {preview.name}
              </span>
              <span className="font-mono text-[11px] text-[var(--kazer-text-3)]">
                v{preview.version}
              </span>
            </div>

            <div className="p-4">
              <div className="rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-inset)] p-4">
                <p className="text-[14px] leading-[22px] text-[var(--kazer-text-2)]">
                  {preview.preview}
                </p>
                <p className="mt-3 font-mono text-[11px] text-[var(--kazer-text-3)]">
                  {preview.mimeType} · {formatBytes(preview.sizeBytes)}
                </p>
              </div>
              <p className="mt-3 text-[12px] text-[var(--kazer-text-3)]">
                Pré-visualização de demonstração. O arquivo real é gerado pelo
                backend.
              </p>
            </div>

            <div className="flex gap-2 border-t border-[var(--kazer-line)] px-4 py-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownload(preview)}
              >
                <Download size={13} />
                Baixar
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 size={13} />
                Compartilhar
              </Button>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        reason={PAYWALL_COPY.gateMessage}
        onSubscribe={async () => {
          await subscribe('max');
          setPaywallOpen(false);
        }}
      />
    </WorkspaceShell>
  );
}

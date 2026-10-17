'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Download,
  FileArchive,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  Share2,
} from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import type { Artifact, ArtifactType } from '@kazer/core';

/**
 * ArtifactCard — a deliverable, versioned and linked to its conversation.
 * A locked artifact is still visible (the user must see it exists) but
 * carries a subtle overlay and a lock badge. Never hide it.
 */

const TYPE_META: Record<
  ArtifactType,
  { icon: React.ElementType; label: string; accent: string }
> = {
  document: { icon: FileText, label: 'Documento', accent: 'var(--kazer-violet)' },
  pdf: { icon: FileArchive, label: 'PDF', accent: 'var(--kazer-red)' },
  docx: { icon: FileText, label: 'DOCX', accent: 'var(--kazer-violet)' },
  spreadsheet: { icon: FileSpreadsheet, label: 'Planilha', accent: 'var(--kazer-green)' },
  csv: { icon: FileSpreadsheet, label: 'CSV', accent: 'var(--kazer-green)' },
  xlsx: { icon: FileSpreadsheet, label: 'XLSX', accent: 'var(--kazer-green)' },
  code: { icon: FileCode2, label: 'Código', accent: 'var(--kazer-cyan)' },
  landing: { icon: Globe, label: 'Landing page', accent: 'var(--kazer-gold)' },
  report: { icon: FileText, label: 'Relatório', accent: 'var(--kazer-gold)' },
  image: { icon: ImageIcon, label: 'Imagem', accent: 'var(--kazer-cyan)' },
};

export function ArtifactTypeIcon({ type, size = 16 }: { type: ArtifactType; size?: number }) {
  const meta = TYPE_META[type] ?? TYPE_META.document;
  const Icon = meta.icon;
  return <Icon size={size} style={{ color: meta.accent }} aria-hidden />;
}

export function ArtifactCard({
  artifact,
  onPreview,
  onDownload,
  onShare,
  onUnlock,
  className,
}: {
  artifact: Artifact;
  onPreview?: (artifact: Artifact) => void;
  onDownload?: (artifact: Artifact) => void;
  onShare?: (artifact: Artifact) => void;
  onUnlock?: (artifact: Artifact) => void;
  className?: string;
}) {
  const meta = TYPE_META[artifact.type] ?? TYPE_META.document;

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] transition-colors duration-150',
        'hover:border-[var(--kazer-line-active)]',
        className,
      )}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Preview thumb */}
        <div
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)]"
          aria-hidden
        >
          <ArtifactTypeIcon type={artifact.type} size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            <h4 className="min-w-0 flex-1 truncate text-[14px] font-medium leading-[19px] text-[var(--kazer-text)]">
              {artifact.name}
            </h4>
            <span
              className="shrink-0 rounded-[4px] border border-[var(--kazer-line)] px-1.5 py-px font-mono text-[10px] text-[var(--kazer-text-3)]"
              title={`Versão ${artifact.version}`}
            >
              v{artifact.version}
            </span>
          </div>

          <p className="mt-0.5 text-[12px] text-[var(--kazer-text-3)]">
            {meta.label} · {formatBytes(artifact.sizeBytes)}
          </p>

          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[18px] text-[var(--kazer-text-2)]">
            {artifact.preview}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 border-t border-[var(--kazer-line)] px-2 py-1.5">
        <ArtifactAction
          icon={FileText}
          label={`Pré-visualizar ${artifact.name}`}
          onClick={() => onPreview?.(artifact)}
        />
        <ArtifactAction
          icon={Download}
          label={`Baixar ${artifact.name}`}
          onClick={() => onDownload?.(artifact)}
        />
        <ArtifactAction
          icon={Share2}
          label={`Compartilhar ${artifact.name}`}
          onClick={() => onShare?.(artifact)}
        />
        {artifact.locked && onUnlock ? (
          <button
            type="button"
            onClick={() => onUnlock(artifact)}
            className="ml-auto flex h-7 items-center gap-1.5 rounded-[6px] border border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] px-2 text-[12px] text-[var(--kazer-gold-text)] transition-colors hover:bg-[color-mix(in_oklch,var(--kazer-gold)_20%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
          >
            <Lock size={11} />
            Desbloquear
          </button>
        ) : null}
      </div>

      {artifact.locked ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,oklch(0.82_0.135_82/8%),transparent_70%)]"
        />
      ) : null}
    </motion.article>
  );
}

function ArtifactAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[var(--kazer-text-3)] transition-colors hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
    >
      <Icon size={13} />
    </button>
  );
}

/** Compact variant used inside the right-hand panel. */
export function ArtifactRow({
  artifact,
  onClick,
  onDownload,
  className,
}: {
  artifact: Artifact;
  onClick?: () => void;
  onDownload?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-[var(--kazer-elevated)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[var(--kazer-line)] bg-[var(--kazer-inset)]">
          <ArtifactTypeIcon type={artifact.type} size={13} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-[var(--kazer-text)]">
            {artifact.name}
          </span>
          <span className="block font-mono text-[11px] text-[var(--kazer-text-3)]">
            v{artifact.version} · {formatBytes(artifact.sizeBytes)}
          </span>
        </span>
      </button>

      {artifact.locked ? (
        <Lock size={12} className="shrink-0 text-[var(--kazer-gold)]" aria-label="Bloqueado" />
      ) : null}

      <button
        type="button"
        onClick={onDownload}
        aria-label={`Baixar ${artifact.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--kazer-text-3)] opacity-0 transition-opacity hover:bg-[var(--kazer-overlay)] hover:text-[var(--kazer-text-2)] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)] group-hover:opacity-100"
      >
        <Download size={13} />
      </button>
    </div>
  );
}

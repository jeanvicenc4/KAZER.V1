'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, ExternalLink, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Source } from '@kazer/core';

/**
 * CitationChip — the inline numbered citation.
 *
 * Trust is typographic (Perplexity lesson): the number sits at the point of
 * the claim, never at the bottom of the answer. Clicking highlights the
 * matching source card in the right panel.
 */

export interface CitationChipProps {
  index: number;
  source?: Source;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CitationChip({
  index,
  source,
  active = false,
  onClick,
  className,
}: CitationChipProps) {
  const label = source
    ? `Fonte ${index}: ${source.title} — ${source.domain}`
    : `Fonte ${index}`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={source?.title}
      className={cn(
        'mx-0.5 inline-flex h-[18px] min-w-[18px] translate-y-[-1px] items-center justify-center rounded-[6px] border px-[5px] font-mono text-[11px] leading-none transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        active
          ? 'border-transparent bg-[var(--kazer-gold)] text-[var(--kazer-text-inverse)]'
          : 'border-[color-mix(in_oklch,var(--kazer-gold)_30%,transparent)] bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)] hover:border-[var(--kazer-gold)] hover:bg-[color-mix(in_oklch,var(--kazer-gold)_20%,transparent)]',
        className,
      )}
    >
      {index}
    </button>
  );
}

/**
 * SourceCard — the source as a first-class citizen.
 * favicon · domain · title · snippet · open / save / cite
 */
export function SourceCard({
  source,
  active = false,
  onSelect,
  onToggleSave,
  onCite,
  className,
}: {
  source: Source;
  active?: boolean;
  onSelect?: () => void;
  onToggleSave?: () => void;
  onCite?: () => void;
  className?: string;
}) {
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      className={cn(
        'group cursor-pointer rounded-lg border bg-[var(--kazer-surface)] p-3 transition-colors duration-150',
        active
          ? 'border-[var(--kazer-gold)] bg-[var(--kazer-gold-wash)]'
          : 'border-[var(--kazer-line)] hover:border-[var(--kazer-line-active)] hover:bg-[var(--kazer-elevated)]',
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          aria-hidden
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--kazer-line-strong)] bg-[var(--kazer-inset)] text-[9px] font-semibold text-[var(--kazer-text-3)]"
        >
          {source.domain.replace(/^www\./, '').charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[12px] text-[var(--kazer-text-3)]">
              {source.domain}
            </span>
            {source.cited ? (
              <span className="rounded-[4px] border border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] px-1 font-mono text-[10px] text-[var(--kazer-gold-text)]">
                citado
              </span>
            ) : null}
          </div>

          <h4 className="mt-0.5 line-clamp-2 text-[14px] font-medium leading-[19px] text-[var(--kazer-text)]">
            {source.title}
          </h4>

          <p className="mt-1 line-clamp-3 text-[13px] leading-[18px] text-[var(--kazer-text-2)]">
            {source.snippet}
          </p>

          <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
            <SourceAction
              icon={ExternalLink}
              label={`Abrir ${source.title} em nova aba`}
              onClick={() => window.open(source.url, '_blank', 'noopener')}
            />
            <SourceAction
              icon={Bookmark}
              label={source.saved ? 'Remover dos salvos' : 'Salvar fonte'}
              active={source.saved}
              onClick={onToggleSave}
            />
            <SourceAction
              icon={Quote}
              label={`Citar fonte ${source.index}`}
              onClick={onCite}
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function SourceAction({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        active
          ? 'bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)]'
          : 'text-[var(--kazer-text-3)] hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)]',
      )}
    >
      <Icon size={13} />
    </button>
  );
}

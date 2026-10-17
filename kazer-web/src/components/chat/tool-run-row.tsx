'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolRun } from '@kazer/core';

/**
 * ToolRunRow — one tool execution inside the Mission Trace.
 * name · status · duration, expandable to show the raw output.
 */

export function ToolRunRow({
  run,
  defaultOpen = false,
  className,
}: {
  run: ToolRun;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const expandable = Boolean(run.output);

  return (
    <div className={cn('rounded-md', className)}>
      <button
        type="button"
        onClick={() => expandable && setOpen((v) => !v)}
        aria-expanded={expandable ? open : undefined}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors',
          expandable &&
            'hover:bg-[var(--kazer-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        )}
      >
        <StatusIcon status={run.status} />

        <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--kazer-text-2)]">
          {run.label}
        </span>

        {run.detail ? (
          <span className="hidden shrink-0 truncate font-mono text-[12px] text-[var(--kazer-text-3)] sm:inline">
            {run.detail}
          </span>
        ) : null}

        {run.durationMs !== null ? (
          <span className="shrink-0 font-mono text-[12px] tabular-nums text-[var(--kazer-text-3)]">
            {run.durationMs < 1000
              ? `${run.durationMs}ms`
              : `${(run.durationMs / 1000).toFixed(1)}s`}
          </span>
        ) : null}

        {expandable ? (
          <ChevronRight
            size={13}
            className={cn(
              'shrink-0 text-[var(--kazer-text-3)] transition-transform duration-150',
              open && 'rotate-90',
            )}
          />
        ) : null}
      </button>

      <AnimatePresence initial={false}>
        {open && run.output ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            <pre className="kazer-scroll mt-1 overflow-x-auto rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] px-3 py-2 font-mono text-[12px] leading-[18px] text-[var(--kazer-text-2)]">
              {run.output}
            </pre>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function StatusIcon({ status }: { status: ToolRun['status'] }) {
  if (status === 'done') {
    return (
      <CircleCheck
        size={13}
        className="shrink-0 text-[var(--kazer-green)]"
        aria-label="Concluído"
      />
    );
  }
  if (status === 'error') {
    return (
      <CircleX
        size={13}
        className="shrink-0 text-[var(--kazer-red)]"
        aria-label="Falhou"
      />
    );
  }
  if (status === 'running') {
    return (
      <Loader2
        size={13}
        className="shrink-0 animate-spin text-[var(--kazer-cyan)]"
        aria-label="Executando"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="h-[7px] w-[7px] shrink-0 rounded-full border border-[var(--kazer-line-active)]"
    />
  );
}

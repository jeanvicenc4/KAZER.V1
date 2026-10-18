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
  const expandable = Boolean(run.output || run.terminal);

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
        {open && (run.output || run.terminal) ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="overflow-hidden"
          >
            {run.terminal ? (
              <div className="mt-1 space-y-2 rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] p-2.5">
                <div>
                  <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
                    Comando · {run.terminal.workingDirectory}
                  </p>
                  <pre className="kazer-scroll max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-[18px] text-[var(--kazer-gold-text)]">
                    $ {run.terminal.command}
                  </pre>
                </div>
                {run.terminal.stdout ? (
                  <TerminalOutput label="Saída" value={run.terminal.stdout} />
                ) : null}
                {run.terminal.stderr ? (
                  <TerminalOutput
                    label="Erro padrão"
                    value={run.terminal.stderr}
                    error
                  />
                ) : null}
                <p className="font-mono text-[11px] text-[var(--kazer-text-3)]">
                  Código de saída: {run.terminal.exitCode ?? 'indisponível'}
                  {' · '}Missão: {run.terminal.missionId}
                </p>
              </div>
            ) : (
              <pre className="kazer-scroll mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] px-3 py-2 font-mono text-[12px] leading-[18px] text-[var(--kazer-text-2)]">
                {run.output}
              </pre>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TerminalOutput({
  label,
  value,
  error = false,
}: {
  label: string;
  value: string;
  error?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
        {label}
      </p>
      <pre
        className={cn(
          'kazer-scroll max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-[18px]',
          error ? 'text-[var(--kazer-red)]' : 'text-[var(--kazer-text-2)]',
        )}
      >
        {value}
      </pre>
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
  if (
    status === 'error' ||
    status === 'cancelled' ||
    status === 'timeout' ||
    status === 'unavailable' ||
    status === 'denied'
  ) {
    const label =
      status === 'cancelled'
        ? 'Interrompido'
        : status === 'timeout'
          ? 'Tempo esgotado'
          : status === 'unavailable'
            ? 'Executor indisponível'
            : status === 'denied'
              ? 'Sem permissão'
              : 'Falhou';
    return (
      <CircleX
        size={13}
        className="shrink-0 text-[var(--kazer-red)]"
        aria-label={label}
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

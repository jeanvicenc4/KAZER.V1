'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MissionStep, ToolRunStatus } from '@kazer/core';

/**
 * MissionTrace — the KAZER signature element.
 *
 * A vertical rail that lights up step by step as the agent works:
 * intent → parallel searches → sources read → synthesis → artifact.
 *
 * Rules (design system §1):
 * - nodes: pending (hollow, dim) · active (pulsing, semantic color) · done (filled)
 * - the connecting line is a vertical gradient toward the active color
 * - an active step may carry a mono sub-line with the real detail
 * - never a generic spinner
 */

const ACCENT: Record<MissionStep['kind'], string> = {
  intent: 'var(--kazer-gold)',
  search: 'var(--kazer-cyan)',
  read: 'var(--kazer-cyan)',
  synthesis: 'var(--kazer-violet)',
  artifact: 'var(--kazer-gold)',
};

export interface MissionTraceProps {
  steps: MissionStep[];
  className?: string;
  compact?: boolean;
  /**
   * Rail-only mode: renders just the nodes and the connecting line, without
   * labels. Used inside the chat, where the tool-run rows to the right carry
   * the labels. A full trace in the rail would overlap the answer.
   */
  railOnly?: boolean;
}

export function MissionTrace({
  steps,
  className,
  compact = false,
  railOnly = false,
}: MissionTraceProps) {
  if (!steps.length) return null;

  return (
    <ol
      role="list"
      aria-label="Progresso da missão"
      className={cn('relative flex flex-col', className)}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const accent = ACCENT[step.kind];

        return (
          <li
            key={step.id}
            role="listitem"
            aria-current={step.status === 'active' ? 'step' : undefined}
            className={cn('relative flex gap-3', !isLast && 'pb-3')}
          >
            {/* Rail + node */}
            <div className="relative flex w-3 shrink-0 justify-center">
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute top-3 bottom-0 left-1/2 w-px -translate-x-1/2"
                  style={{
                    background:
                      step.status === 'done'
                        ? 'linear-gradient(to bottom, var(--kazer-line-active), var(--kazer-line))'
                        : 'var(--kazer-line)',
                  }}
                />
              ) : null}

              <span
                aria-hidden
                className={cn(
                  'relative z-10 mt-[5px] flex h-3 w-3 items-center justify-center rounded-full border transition-colors duration-200',
                  step.status === 'done' && 'border-transparent',
                  step.status === 'active' && 'kazer-trace-pulse',
                )}
                style={{
                  background:
                    step.status === 'done'
                      ? accent
                      : step.status === 'active'
                        ? 'var(--kazer-base)'
                        : 'transparent',
                  borderColor:
                    step.status === 'pending'
                      ? 'var(--kazer-line-active)'
                      : accent,
                }}
              >
                {step.status === 'done' ? (
                  <Check
                    size={7}
                    strokeWidth={4}
                    className="text-[var(--kazer-base)]"
                  />
                ) : null}
                {step.status === 'active' ? (
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: accent }}
                  />
                ) : null}
              </span>
            </div>

            {/* Label */}
            {railOnly ? null : (
              <div className="min-w-0 flex-1 pb-0.5">
                <p
                  className={cn(
                    'text-[13px] leading-[18px] transition-colors duration-200',
                    step.status === 'pending' && 'text-[var(--kazer-text-3)]',
                    step.status === 'active' && 'text-[var(--kazer-text)]',
                    step.status === 'done' && 'text-[var(--kazer-text-2)]',
                  )}
                >
                  {step.label}
                </p>

                {step.detail && step.status !== 'pending' && !compact ? (
                  <p
                    className="mt-0.5 font-mono text-[12px] leading-[18px] text-[var(--kazer-text-3)]"
                  >
                    {step.detail}
                  </p>
                ) : null}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Build a Mission Trace from a tool-run list.
 * Falls back to a sensible canonical order when the runs don't map cleanly.
 */
export function stepsFromToolRuns(
  toolRuns: {
    id: string;
    name: string;
    label: string;
    status: ToolRunStatus;
    detail?: string | null;
  }[],
): MissionStep[] {
  const steps: MissionStep[] = [];

  for (const run of toolRuns) {
    const kind: MissionStep['kind'] = run.name.includes('classify')
      ? 'intent'
      : run.name.includes('search') || run.name.includes('generate_queries')
        ? 'search'
        : run.name.includes('read') || run.name.includes('fetch')
          ? 'read'
          : run.name.includes('synth')
            ? 'synthesis'
            : run.name.includes('artifact') || run.name.includes('create')
              ? 'artifact'
              : 'read';

    steps.push({
      id: run.id,
      label: run.label,
      detail: run.detail ?? null,
      status:
        run.status === 'done'
          ? 'done'
          : run.status === 'running'
            ? 'active'
            : 'pending',
      kind,
    });
  }

  return steps;
}

/** The live indicator shown while the agent is still working. */
export function ThinkingIndicator({
  label = 'KAZER está pensando',
  step,
}: {
  label?: string;
  step?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2.5 py-1"
    >
      <div className="flex h-3 w-14 flex-col justify-center gap-[3px]" aria-hidden>
        <span
          className="kazer-breathe h-[2px] w-full rounded-full bg-[var(--kazer-cyan)]"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="kazer-breathe h-[2px] w-full rounded-full bg-[var(--kazer-cyan)]"
          style={{ animationDelay: '120ms' }}
        />
        <span
          className="kazer-breathe h-[2px] w-full rounded-full bg-[var(--kazer-cyan)]"
          style={{ animationDelay: '240ms' }}
        />
      </div>
      <span className="text-[13px] text-[var(--kazer-text-2)]">{label}</span>
      {step ? (
        <span className="truncate text-[13px] text-[var(--kazer-text-3)]">
          {step}
        </span>
      ) : null}
    </div>
  );
}

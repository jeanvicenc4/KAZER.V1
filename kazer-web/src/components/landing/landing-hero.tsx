'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MissionTrace } from '@/components/chat/mission-trace';
import { CitationChip } from '@/components/sources/source-card';
import type { MissionStep } from '@kazer/core';

/**
 * LandingHero — a live Mission Trace, not a static mockup.
 * The visitor sees the agent actually working before scrolling to pricing.
 */

const SEQUENCE: { step: MissionStep; delay: number }[] = [
  {
    step: {
      id: 's1',
      label: 'Intenção entendida',
      detail: 'comparar pricing de LLMs no Brasil em 2026',
      status: 'done',
      kind: 'intent',
    },
    delay: 300,
  },
  {
    step: {
      id: 's2',
      label: '4 buscas em paralelo',
      detail: 'pricing brasil · custo em produção · cache',
      status: 'done',
      kind: 'search',
    },
    delay: 1500,
  },
  {
    step: {
      id: 's3',
      label: '7 fontes lidas',
      detail: '23 brutos → 9 únicos',
      status: 'done',
      kind: 'read',
    },
    delay: 2800,
  },
  {
    step: {
      id: 's4',
      label: 'Sintetizando resposta',
      detail: '5 citações inline',
      status: 'done',
      kind: 'synthesis',
    },
    delay: 4100,
  },
  {
    step: {
      id: 's5',
      label: 'Artefato criado',
      detail: 'pricing-llms-2026.xlsx',
      status: 'active',
      kind: 'artifact',
    },
    delay: 5400,
  },
];

const ANSWER = `Os provedores que entregam o melhor custo-benefício em produção mudam de posição conforme o volume. Acima de ~50 milhões de tokens por mês, o desconto regional e o cache de prefixo viram o fator dominante`;

export function LandingHero() {
  const reduced = useReducedMotion();
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduced) {
      setStepIndex(SEQUENCE.length);
      return;
    }
    const timers = SEQUENCE.map((item, index) =>
      setTimeout(() => setStepIndex(index + 1), item.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  const steps = SEQUENCE.map((item, index) => ({
    ...item.step,
    status:
      index < stepIndex
        ? ('done' as const)
        : index === stepIndex
          ? ('active' as const)
          : ('pending' as const),
  }));

  const revealed = Math.round((stepIndex / SEQUENCE.length) * ANSWER.length);

  return (
    <div className="relative">
      {/* Ask bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-9 w-full max-w-[620px]"
      >
        <div className="flex items-center gap-3 rounded-[14px] border border-[var(--kazer-line-strong)] bg-[var(--kazer-surface)] px-4 py-3.5 shadow-[var(--shadow-md)] transition-colors focus-within:border-[var(--kazer-line-gold)]">
          <span className="min-w-0 flex-1 truncate text-[15px] text-[var(--kazer-text-2)]">
            Compare o preço real por milhão de tokens no Brasil em 2026
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--kazer-gold)] text-[var(--kazer-text-inverse)]">
            <ChevronRight size={15} strokeWidth={2.5} />
          </span>
        </div>
      </motion.div>

      {/* Live demo panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-6 w-full max-w-[620px] overflow-hidden rounded-[14px] border border-[var(--kazer-line)] bg-[var(--kazer-surface)]"
      >
        <div className="flex items-center gap-2 border-b border-[var(--kazer-line)] px-4 py-2.5">
          <span
            aria-hidden
            className="kazer-trace-pulse h-1.5 w-1.5 rounded-full bg-[var(--kazer-cyan)]"
          />
          <span className="font-mono text-[12px] text-[var(--kazer-text-3)]">
            kazer · research
          </span>
          <span className="ml-auto font-mono text-[12px] text-[var(--kazer-text-3)]">
            ao vivo
          </span>
        </div>

        <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
          {/* Trace rail */}
          <div className="border-b border-[var(--kazer-line)] p-4 sm:border-b-0 sm:border-r">
            <MissionTrace steps={steps} />
          </div>

          {/* Answer */}
          <div className="p-4">
            <p className="text-[14px] leading-[22px] text-[var(--kazer-text)]">
              {ANSWER.slice(0, revealed)}
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[15px] w-[2px] translate-y-[2px] bg-[var(--kazer-gold)]"
              />
            </p>

            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3].map((index) => (
                <CitationChip
                  key={index}
                  index={index}
                  active={stepIndex >= 4}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** Feature block — deliberately not three identical cards. */
export function FeatureRow({
  index,
  title,
  description,
  accent = 'gold',
}: {
  index: string;
  title: string;
  description: string;
  accent?: 'gold' | 'violet' | 'cyan';
}) {
  const accentVar =
    accent === 'violet'
      ? 'var(--kazer-violet)'
      : accent === 'cyan'
        ? 'var(--kazer-cyan)'
        : 'var(--kazer-gold)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-5 border-t border-[var(--kazer-line)] py-8"
    >
      <span
        className="mt-0.5 shrink-0 font-mono text-[13px] tabular-nums"
        style={{ color: accentVar }}
      >
        {index}
      </span>
      <div className="min-w-0">
        <h3 className="text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-[var(--kazer-text)]">
          {title}
        </h3>
        <p className="mt-2 max-w-[52ch] text-[15px] leading-[24px] text-[var(--kazer-text-2)]">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/** Checklist used in the pricing comparison. */
export function CheckList({
  items,
  muted = false,
}: {
  items: string[];
  muted?: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <Check
            size={14}
            strokeWidth={2.5}
            className={cn(
              'mt-1 shrink-0',
              muted ? 'text-[var(--kazer-text-3)]' : 'text-[var(--kazer-gold)]',
            )}
            aria-hidden
          />
          <span
            className={cn(
              'text-[14px] leading-[20px]',
              muted
                ? 'text-[var(--kazer-text-3)]'
                : 'text-[var(--kazer-text-2)]',
            )}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

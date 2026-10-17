'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { KazerMark } from '@/components/brand/kazer-mark';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * PaywallModal — the MAX upsell.
 * Never a generic error: it explains what is locked, what the price is, and
 * always offers a discreet way out.
 */

export const PAYWALL_COPY = {
  title: 'Desbloqueie o KAZER MAX',
  subtitle: 'Execução de tarefas, agentes e criação de artefatos.',
  price: 'R$ 59,99',
  period: '/mês',
  cta: 'Ativar KAZER MAX',
  dismiss: 'Continuar no plano atual',
  gateMessage: 'Execução de tarefas está disponível no KAZER MAX — R$ 59,99/mês',
} as const;

const BENEFITS = [
  'Execução de tarefas e missões completas',
  'Agentes autônomos com tool calling',
  'Artefatos em PDF, DOCX, XLSX, CSV e código',
  'Execução em segundo plano com notificação',
  'Fila prioritária e Skills ilimitadas',
];

export function PaywallModal({
  open,
  onClose,
  onSubscribe,
  reason,
  className,
}: {
  open: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
  reason?: string;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[oklch(0_0_0/72%)] backdrop-blur-[8px]"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
            aria-describedby="paywall-subtitle"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full max-w-[460px] overflow-hidden rounded-[20px] border border-[var(--kazer-line-gold)] bg-[var(--kazer-surface)] shadow-[var(--shadow-gold)]',
              className,
            )}
          >
            {/* Metallic crown */}
            <div
              aria-hidden
              className="h-px w-full"
              style={{ background: 'var(--kazer-metal)' }}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-md text-[var(--kazer-text-3)] transition-colors hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
            >
              <X size={15} />
            </button>

            <div className="px-7 pb-7 pt-8">
              <div className="flex flex-col items-center text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full p-[3px]"
                  style={{ background: 'var(--kazer-metal)' }}
                >
                  <span className="flex h-full w-full items-center justify-center rounded-full bg-[var(--kazer-surface)]">
                    <KazerMark size={26} />
                  </span>
                </span>

                <h2
                  id="paywall-title"
                  className="mt-4 text-[24px] font-medium leading-[30px] tracking-[-0.015em] text-[var(--kazer-text)]"
                >
                  {PAYWALL_COPY.title}
                </h2>
                <p
                  id="paywall-subtitle"
                  className="mt-1.5 text-[15px] leading-[22px] text-[var(--kazer-text-2)]"
                >
                  {PAYWALL_COPY.subtitle}
                </p>

                {reason ? (
                  <p className="mt-3 rounded-md border border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] px-3 py-2 text-[13px] leading-[18px] text-[var(--kazer-gold-text)]">
                    {reason}
                  </p>
                ) : null}

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-[36px] font-medium leading-none tracking-[-0.02em] text-[var(--kazer-text)]">
                    {PAYWALL_COPY.price}
                  </span>
                  <span className="text-[15px] text-[var(--kazer-text-3)]">
                    {PAYWALL_COPY.period}
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0 text-[var(--kazer-gold)]"
                      aria-hidden
                    />
                    <span className="text-[14px] leading-[20px] text-[var(--kazer-text-2)]">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant="primary"
                size="lg"
                className="mt-7 w-full"
                onClick={onSubscribe}
              >
                {PAYWALL_COPY.cta}
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full rounded-md py-2 text-[13px] text-[var(--kazer-text-3)] transition-colors hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
              >
                {PAYWALL_COPY.dismiss}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

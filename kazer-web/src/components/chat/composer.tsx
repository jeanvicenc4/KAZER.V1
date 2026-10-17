'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  ChevronDown,
  Paperclip,
  Square,
  Globe,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Mode, ModelOption } from '@kazer/core';

/**
 * Composer — the ask bar.
 * Left: mode switch (Chat / Research / Missão)
 * Right: model picker, attach, send
 */

const MODES: { id: Mode; label: string; icon: React.ElementType; ring: string }[] = [
  {
    id: 'chat',
    label: 'Chat',
    icon: Sparkles,
    ring: 'var(--kazer-gold)',
  },
  {
    id: 'research',
    label: 'Research',
    icon: Globe,
    ring: 'var(--kazer-cyan)',
  },
  {
    id: 'mission',
    label: 'Missão',
    icon: Square,
    ring: 'var(--kazer-violet)',
  },
];

const PLACEHOLDER: Record<Mode, string> = {
  chat: 'Pergunte qualquer coisa ao KAZER…',
  research: 'O que o KAZER deve pesquisar?',
  mission: 'Descreva a missão e o resultado esperado…',
};

export interface ComposerProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  models: ModelOption[];
  model: string;
  onModelChange: (id: string) => void;
  onSubmit: (value: string) => void;
  streaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Composer({
  mode,
  onModeChange,
  models,
  model,
  onModelChange,
  onSubmit,
  streaming = false,
  onStop,
  disabled = false,
  className,
}: ComposerProps) {
  const [value, setValue] = React.useState('');
  const [modelOpen, setModelOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const selected = models.find((m) => m.id === model) ?? models[0];

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || streaming || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'rounded-[14px] border bg-[var(--kazer-inset)] transition-colors duration-200',
          'focus-within:border-[var(--kazer-line-gold)]',
          disabled && 'opacity-60',
        )}
        style={{
          boxShadow: disabled ? undefined : 'var(--shadow-sm)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          rows={1}
          aria-label="Mensagem para o KAZER"
          placeholder={PLACEHOLDER[mode]}
          className={cn(
            'kazer-scroll max-h-[200px] w-full resize-none bg-transparent px-4 pb-1 pt-3.5 text-[15px] leading-[24px] text-[var(--kazer-text)]',
            'placeholder:text-[var(--kazer-text-3)]',
            'focus:outline-none',
            'scrollbar-gutter:stable',
          )}
        />

        <div className="flex flex-wrap items-center gap-1.5 px-2.5 pb-2.5 pt-1">
          {/* Mode switch — full row on mobile so the controls never overflow */}
          <div
            role="tablist"
            aria-label="Modo de trabalho"
            className="order-1 flex w-full items-center gap-0.5 rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-0.5 sm:w-auto"
          >
            {MODES.map((m) => {
              const Icon = m.icon;
              const isActive = m.id === mode;
              return (
                <button
                  key={m.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => onModeChange(m.id)}
                  className={cn(
                    'relative flex h-8 items-center gap-1.5 rounded-[6px] px-2.5 text-[13px] transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                    isActive
                      ? 'text-[var(--kazer-text)]'
                      : 'text-[var(--kazer-text-3)] hover:text-[var(--kazer-text-2)]',
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="composer-mode"
                      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                      className="absolute inset-0 rounded-[6px] border"
                      style={{
                        borderColor: m.ring,
                        background: `color-mix(in oklch, ${m.ring} 12%, transparent)`,
                      }}
                    />
                  ) : null}
                  <Icon
                    size={12}
                    className="relative z-10"
                    style={isActive ? { color: m.ring } : undefined}
                  />
                  <span className="relative z-10">{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="order-3 flex-1" />

          {/* Model picker */}
          <div className="relative order-2 sm:order-3">
            <button
              type="button"
              onClick={() => setModelOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={modelOpen}
              aria-label={`Modelo: ${selected?.name}. Trocar modelo`}
              className={cn(
                'flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-surface)] px-2.5 text-[13px] text-[var(--kazer-text-2)]',
                'transition-colors hover:border-[var(--kazer-line-active)] hover:text-[var(--kazer-text)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
              )}
            >
              {selected?.short ?? 'KAZER 4'}
              <ChevronDown size={12} className="shrink-0" />
            </button>

            <AnimatePresence>
              {modelOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setModelOpen(false)}
                    aria-hidden
                  />
                  <motion.div
                    role="listbox"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-0 z-50 mb-2 w-[280px] overflow-hidden rounded-lg border border-[var(--kazer-line-strong)] bg-[var(--kazer-elevated)] shadow-[var(--shadow-lg)]"
                  >
                    {models.map((m) => (
                      <button
                        key={m.id}
                        role="option"
                        aria-selected={m.id === model}
                        type="button"
                        onClick={() => {
                          onModelChange(m.id);
                          setModelOpen(false);
                        }}
                        className={cn(
                          'flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--kazer-overlay)]',
                          m.id === model && 'bg-[var(--kazer-gold-wash)]',
                        )}
                      >
                        <span className="flex w-full items-center justify-between">
                          <span className="text-[14px] font-medium text-[var(--kazer-text)]">
                            {m.name}
                          </span>
                          {m.minPlan !== 'free' ? (
                            <span className="rounded-[4px] border border-[var(--kazer-line-gold)] px-1.5 py-px text-[10px] uppercase tracking-[0.08em] text-[var(--kazer-gold-text)]">
                              {m.minPlan}
                            </span>
                          ) : null}
                        </span>
                        <span className="text-[12px] leading-[17px] text-[var(--kazer-text-3)]">
                          {m.description}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label="Anexar arquivo"
            className={cn(
              'order-2 flex h-8 w-8 items-center justify-center rounded-md text-[var(--kazer-text-3)] transition-colors sm:order-4',
              'hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text-2)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
            )}
          >
            <Paperclip size={14} />
          </button>

          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Interromper resposta"
              className={cn(
                'order-2 flex h-8 w-8 items-center justify-center rounded-md bg-[var(--kazer-surface)] text-[var(--kazer-text-2)] transition-colors sm:order-4',
                'hover:bg-[var(--kazer-elevated)] hover:text-[var(--kazer-text)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
              )}
            >
              <Square size={12} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim() || disabled}
              aria-label="Enviar mensagem"
              className={cn(
                'order-2 flex h-8 w-8 items-center justify-center rounded-md bg-[var(--kazer-gold)] text-[var(--kazer-text-inverse)] transition-all duration-150 sm:order-4',
                'hover:bg-[var(--kazer-gold-text)] active:scale-[0.94]',
                'disabled:pointer-events-none disabled:opacity-40',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
              )}
            >
              <ArrowUp size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 px-1 text-center text-[12px] text-[var(--kazer-text-3)]">
        O KAZER pode errar. Confira as fontes antes de decidir.
      </p>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Compass, Code2, FileText, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { KazerMark } from '@/components/brand/kazer-mark';
import { models, demoSkills } from '@kazer/core';

/**
 * Onboarding — 4 steps: idioma · tema · modelo padrão · primeiro agente.
 * Skippable at every step; a demo account shouldn't be trapped in a wizard.
 */

type Step = 'idioma' | 'tema' | 'modelo' | 'agente';

const STEPS: Step[] = ['idioma', 'tema', 'modelo', 'agente'];

const SKILL_ICONS: Record<string, React.ElementType> = {
  compass: Compass,
  file: FileText,
  code: Code2,
  trending: TrendingUp,
  shield: Shield,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [locale, setLocale] = React.useState<'pt-BR' | 'en-US' | 'es-ES'>('pt-BR');
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('dark');
  const [model, setModel] = React.useState('kazer-4');
  const [skill, setSkill] = React.useState('kazer-research');

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const finish = () => {
    try {
      window.localStorage.setItem(
        'kazer-onboarding',
        JSON.stringify({ locale, theme, model, skill }),
      );
    } catch {
      /* storage may be unavailable — the demo still continues */
    }
    router.push('/kazer');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--kazer-base)]">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-[var(--kazer-line)] px-5">
        <KazerMark size={24} />
        <button
          type="button"
          onClick={finish}
          className="rounded-md px-2 py-1 text-[13px] text-[var(--kazer-text-3)] transition-colors hover:text-[var(--kazer-text-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
        >
          Pular
        </button>
      </header>

      {/* Progress */}
      <div className="flex items-center justify-center gap-1.5 px-5 pt-6">
        {STEPS.map((s, index) => (
          <span
            key={s}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              index === stepIndex
                ? 'w-8 bg-[var(--kazer-gold)]'
                : index < stepIndex
                  ? 'w-4 bg-[var(--kazer-line-active)]'
                  : 'w-4 bg-[var(--kazer-line)]',
            )}
          />
        ))}
      </div>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[620px]"
          >
            {step === 'idioma' ? (
              <StepFrame
                title="Qual seu idioma?"
                description="O KAZER responde e pesquisa em português, inglês ou espanhol."
              >
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {(
                    [
                      ['pt-BR', 'Português (Brasil)'],
                      ['en-US', 'English (US)'],
                      ['es-ES', 'Español'],
                    ] as const
                  ).map(([value, label]) => (
                    <OptionCard
                      key={value}
                      selected={locale === value}
                      onClick={() => setLocale(value)}
                    >
                      {label}
                    </OptionCard>
                  ))}
                </div>
              </StepFrame>
            ) : null}

            {step === 'tema' ? (
              <StepFrame
                title="Escolha o tema"
                description="O KAZER é escuro por padrão. O tema claro mantém o mesmo contraste e a mesma identidade."
              >
                <div className="grid gap-2.5 sm:grid-cols-3">
                  <OptionCard selected={theme === 'dark'} onClick={() => setTheme('dark')}>
                    <ThemeSwatch variant="dark" />
                    Escuro
                  </OptionCard>
                  <OptionCard selected={theme === 'light'} onClick={() => setTheme('light')}>
                    <ThemeSwatch variant="light" />
                    Claro
                  </OptionCard>
                  <OptionCard selected={theme === 'system'} onClick={() => setTheme('system')}>
                    <ThemeSwatch variant="system" />
                    Sistema
                  </OptionCard>
                </div>
              </StepFrame>
            ) : null}

            {step === 'modelo' ? (
              <StepFrame
                title="Modelo padrão"
                description="Você pode trocar isso a qualquer momento nas configurações."
              >
                <div className="space-y-2.5">
                  {models
                    .filter((m) => m.minPlan === 'free' || m.minPlan === 'pro')
                    .map((m) => (
                      <OptionCard
                        key={m.id}
                        selected={model === m.id}
                        onClick={() => setModel(m.id)}
                        row
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-medium text-[var(--kazer-text)]">
                              {m.name}
                            </span>
                            {m.reasoning ? (
                              <span className="rounded-[4px] border border-[var(--kazer-line-gold)] px-1.5 py-px text-[10px] uppercase tracking-[0.08em] text-[var(--kazer-gold-text)]">
                                raciocínio
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-[13px] leading-[18px] text-[var(--kazer-text-3)]">
                            {m.description}
                          </p>
                        </div>
                      </OptionCard>
                    ))}
                </div>
              </StepFrame>
            ) : null}

            {step === 'agente' ? (
              <StepFrame
                title="Escolha seu primeiro agente"
                description="Cada Skill é um agente com permissões próprias. Você pode ativar mais depois."
              >
                <div className="space-y-2.5">
                  {demoSkills.map((s) => {
                    const Icon = SKILL_ICONS[s.icon] ?? Compass;
                    return (
                      <OptionCard
                        key={s.id}
                        selected={skill === s.slug}
                        onClick={() => setSkill(s.slug)}
                        row
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-inset)] text-[var(--kazer-gold)]">
                          <Icon size={16} />
                        </span>
                        <div className="flex-1">
                          <span className="text-[15px] font-medium text-[var(--kazer-text)]">
                            {s.name}
                          </span>
                          <p className="mt-0.5 line-clamp-1 text-[13px] leading-[18px] text-[var(--kazer-text-3)]">
                            {s.description}
                          </p>
                        </div>
                      </OptionCard>
                    );
                  })}
                </div>
              </StepFrame>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-[var(--kazer-line)] px-5 py-4">
        <Button
          variant="ghost"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
        >
          Voltar
        </Button>
        <Button variant="primary" onClick={() => (isLast ? finish() : setStepIndex((i) => i + 1))}>
          {isLast ? 'Entrar no KAZER' : 'Continuar'}
        </Button>
      </footer>
    </div>
  );
}

function StepFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
        {title}
      </h1>
      <p className="mt-2 max-w-[48ch] text-[15px] leading-[22px] text-[var(--kazer-text-2)]">
        {description}
      </p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  children,
  row = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  row?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-all duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        row ? 'items-center' : 'flex-col items-start',
        selected
          ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)]'
          : 'border-[var(--kazer-line)] bg-[var(--kazer-surface)] hover:border-[var(--kazer-line-active)]',
      )}
    >
      {children}
      {selected ? (
        <span
          aria-hidden
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--kazer-gold)] text-[var(--kazer-text-inverse)]"
        >
          <Check size={12} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}

function ThemeSwatch({ variant }: { variant: 'dark' | 'light' | 'system' }) {
  return (
    <span
      aria-hidden
      className="mb-2 block h-12 w-full overflow-hidden rounded-md border border-[var(--kazer-line)]"
      style={{
        background:
          variant === 'light'
            ? 'linear-gradient(135deg, oklch(0.985 0.003 85), oklch(0.9 0.005 85))'
            : variant === 'system'
              ? 'linear-gradient(105deg, oklch(0.145 0.012 285) 0 50%, oklch(0.985 0.003 85) 50% 100%)'
              : 'linear-gradient(135deg, oklch(0.115 0.01 285), oklch(0.225 0.016 280))',
      }}
    >
      <span className="block h-1.5 w-8 rounded-full bg-[var(--kazer-gold)]" />
    </span>
  );
}

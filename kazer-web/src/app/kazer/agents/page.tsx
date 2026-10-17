'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Code2,
  Compass,
  FileText,
  Plus,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { useWorkspace } from '@/components/workspace/workspace-context';
import { usePlan, useSkills } from '@/hooks/use-kazer';
import { Button } from '@/components/ui/button';
import { PaywallModal, PAYWALL_COPY } from '@/components/billing/paywall-modal';
import { cn } from '@/lib/utils';

const SKILL_ICONS: Record<string, React.ElementType> = {
  compass: Compass,
  file: FileText,
  code: Code2,
  trending: TrendingUp,
  shield: Shield,
};

const PERMISSION_LABELS: Record<string, string> = {
  'web.read': 'Ler a web',
  'files.write': 'Escrever arquivos',
  'shell.exec': 'Executar comandos',
  'code.run': 'Rodar código',
  'net.fetch': 'Buscar na rede',
};

export default function AgentsPage() {
  const router = useRouter();
  const workspace = useWorkspace();
  const { skills, loading, toggle } = useSkills();
  const { plan, canUse, subscribe } = usePlan();
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const [tag, setTag] = React.useState<string | null>(null);

  const tags = React.useMemo(
    () => Array.from(new Set(skills.flatMap((s) => s.tags))),
    [skills],
  );

  const filtered = tag ? skills.filter((s) => s.tags.includes(tag)) : skills;

  const handleToggle = async (id: string, active: boolean) => {
    const isMaxFeature = id === 'skl_security' || id === 'skl_growth';
    if (isMaxFeature && !(await canUse('unlimitedSkills'))) {
      setPaywallOpen(true);
      return;
    }
    await toggle(id, active);
  };

  return (
    <WorkspaceShell
      conversations={workspace.conversations}
      sources={workspace.sources}
      artifacts={workspace.artifacts}
      onNewMission={() => router.push('/kazer')}
      onSelectConversation={(c) => router.push(`/kazer/chat/${c.id}`)}
      onToggleSaveSource={workspace.toggleSaveSource}
    >
      <div className="mx-auto w-full max-w-[1000px] px-5 py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
              Skills
            </h1>
            <p className="mt-1.5 max-w-[52ch] text-[15px] leading-[23px] text-[var(--kazer-text-2)]">
              Cada Skill é um agente com propósito e permissões próprias. Você
              vê exatamente o que ela acessa antes de ativar.
            </p>
          </div>
          <Button variant="secondary" size="sm">
            <Plus size={14} />
            Criar Skill
          </Button>
        </header>

        {/* Tag filter */}
        <div className="mt-6 flex flex-wrap gap-1.5">
          <FilterChip active={tag === null} onClick={() => setTag(null)}>
            Todas
          </FilterChip>
          {tags.map((t) => (
            <FilterChip key={t} active={tag === t} onClick={() => setTag(t)}>
              {t}
            </FilterChip>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="kazer-skeleton h-[184px] rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)]"
              />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((skill, index) => {
              const Icon = SKILL_ICONS[skill.icon] ?? Compass;
              const accentVar =
                skill.accent === 'violet'
                  ? 'var(--kazer-violet)'
                  : skill.accent === 'cyan'
                    ? 'var(--kazer-cyan)'
                    : 'var(--kazer-gold)';

              return (
                <motion.article
                  key={skill.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.32,
                    delay: Math.min(index, 6) * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-4 transition-colors hover:border-[var(--kazer-line-active)]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-inset)]"
                      style={{ color: accentVar }}
                    >
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[15px] font-medium leading-[20px] text-[var(--kazer-text)]">
                        {skill.name}
                      </h2>
                      <p className="mt-0.5 font-mono text-[11px] text-[var(--kazer-text-3)]">
                        v{skill.version}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-[13px] leading-[19px] text-[var(--kazer-text-2)]">
                    {skill.description}
                  </p>

                  {/* Permissions */}
                  <div className="mt-3.5">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
                      Permissões
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {skill.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-[4px] border border-[var(--kazer-line)] bg-[var(--kazer-inset)] px-1.5 py-px text-[11px] text-[var(--kazer-text-3)]"
                        >
                          {PERMISSION_LABELS[permission] ?? permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--kazer-line)] pt-3">
                    <span className="font-mono text-[11px] text-[var(--kazer-text-3)]">
                      {skill.runs} execuções
                    </span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={skill.active}
                      aria-label={`${skill.active ? 'Desativar' : 'Ativar'} ${skill.name}`}
                      onClick={() => handleToggle(skill.id, !skill.active)}
                      className={cn(
                        'relative h-5 w-9 rounded-full transition-colors duration-200',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                        skill.active
                          ? 'bg-[var(--kazer-gold)]'
                          : 'bg-[var(--kazer-overlay)]',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-[var(--kazer-base)] transition-transform duration-200',
                          skill.active ? 'translate-x-[18px]' : 'translate-x-0.5',
                        )}
                      />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center">
            <p className="text-[15px] text-[var(--kazer-text-2)]">
              Nenhuma Skill com essa tag.
            </p>
            <button
              type="button"
              onClick={() => setTag(null)}
              className="mt-2 text-[14px] text-[var(--kazer-gold-text)] hover:text-[var(--kazer-gold)]"
            >
              Ver todas
            </button>
          </div>
        )}

        <p className="mt-8 text-[12px] text-[var(--kazer-text-3)]">
          Plano atual: {plan === 'max' ? 'KAZER MAX' : plan === 'pro' ? 'Pro' : 'Free'} ·
          dados de demonstração.
        </p>
      </div>

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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
        active
          ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)]'
          : 'border-[var(--kazer-line)] text-[var(--kazer-text-2)] hover:border-[var(--kazer-line-active)] hover:text-[var(--kazer-text)]',
      )}
    >
      {children}
    </button>
  );
}

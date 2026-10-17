'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  Key,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Sun,
  User,
  Zap,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';
import { useWorkspace } from '@/components/workspace/workspace-context';
import { useProfile, usePlan } from '@/hooks/use-kazer';
import { useTheme, type ThemePreference } from '@/components/theme/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { models, planDefinitions } from '@kazer/core';

const TABS = [
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'modelos', label: 'Modelos', icon: Zap },
  { id: 'chaves', label: 'Chaves de API', icon: Key },
  { id: 'tema', label: 'Tema', icon: Palette },
  { id: 'assinatura', label: 'Assinatura', icon: Bell },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function SettingsPage() {
  const router = useRouter();
  const workspace = useWorkspace();
  const { profile, update } = useProfile();
  const { plan, setDemoPlan } = usePlan();
  const { preference, setPreference } = useTheme();
  const [tab, setTab] = React.useState<TabId>('perfil');
  const [name, setName] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');
  const [apiKeySaved, setApiKeySaved] = React.useState(false);

  React.useEffect(() => {
    if (profile) setName(profile.fullName);
  }, [profile]);

  const currentPlan = planDefinitions.find((p) => p.id === plan);

  const saveProfile = async () => {
    await update({ fullName: name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
      <div className="mx-auto w-full max-w-[860px] px-5 py-8">
        <h1 className="text-[26px] font-medium leading-[32px] tracking-[-0.015em] text-[var(--kazer-text)]">
          Configurações
        </h1>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Seções de configuração"
          className="kazer-scroll mt-6 flex gap-1 overflow-x-auto border-b border-[var(--kazer-line)]"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  'relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-[14px] transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--kazer-gold)]',
                  active
                    ? 'text-[var(--kazer-text)]'
                    : 'text-[var(--kazer-text-3)] hover:text-[var(--kazer-text-2)]',
                )}
              >
                <Icon size={14} />
                {t.label}
                {active ? (
                  <motion.span
                    layoutId="settings-tab"
                    transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
                    className="absolute inset-x-0 -bottom-px h-px bg-[var(--kazer-gold)]"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="py-7">
          {tab === 'perfil' ? (
            <section className="max-w-[440px]">
              <h2 className="text-[17px] font-medium text-[var(--kazer-text)]">
                Seu perfil
              </h2>
              <p className="mt-1.5 text-[14px] leading-[21px] text-[var(--kazer-text-2)]">
                Esses dados aparecem nas conversas compartilhadas.
              </p>

              <div className="mt-6 space-y-4">
                <Input
                  label="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="E-mail"
                  value={profile?.email ?? ''}
                  disabled
                  hint="O e-mail de acesso é gerenciado pela autenticação."
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button variant="primary" onClick={saveProfile}>
                  Salvar
                </Button>
                {saved ? (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-[13px] text-[var(--kazer-green)]"
                  >
                    <Check size={13} />
                    Salvo
                  </motion.span>
                ) : null}
              </div>

              <div className="mt-12 border-t border-[var(--kazer-line)] pt-6">
                <h3 className="text-[15px] font-medium text-[var(--kazer-text)]">
                  Sessão
                </h3>
                <p className="mt-1 text-[13px] leading-[19px] text-[var(--kazer-text-2)]">
                  Você está conectado como {profile?.email}.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push('/login')}
                >
                  <LogOut size={13} />
                  Sair da conta
                </Button>
              </div>
            </section>
          ) : null}

          {tab === 'modelos' ? (
            <section className="max-w-[560px]">
              <h2 className="text-[17px] font-medium text-[var(--kazer-text)]">
                Modelo padrão
              </h2>
              <p className="mt-1.5 text-[14px] leading-[21px] text-[var(--kazer-text-2)]">
                Modelo usado quando você abre uma nova missão.
              </p>

              <div className="mt-5 space-y-2">
                {models.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => workspace.setModel(m.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                      workspace.model === m.id
                        ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)]'
                        : 'border-[var(--kazer-line)] hover:border-[var(--kazer-line-active)]',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-medium text-[var(--kazer-text)]">
                          {m.name}
                        </span>
                        {m.minPlan !== 'free' ? (
                          <span className="rounded-[4px] border border-[var(--kazer-line-gold)] px-1.5 py-px text-[10px] uppercase tracking-[0.08em] text-[var(--kazer-gold-text)]">
                            {m.minPlan}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[13px] leading-[18px] text-[var(--kazer-text-3)]">
                        {m.description}
                      </p>
                    </div>
                    {workspace.model === m.id ? (
                      <Check size={15} className="shrink-0 text-[var(--kazer-gold)]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {tab === 'chaves' ? (
            <section className="max-w-[560px]">
              <h2 className="text-[17px] font-medium text-[var(--kazer-text)]">
                Chaves de API
              </h2>
              <p className="mt-1.5 text-[14px] leading-[21px] text-[var(--kazer-text-2)]">
                Use sua própria chave para rodar o KAZER com um provedor
                externo. A chave fica criptografada e nunca é exibida depois
                de salva.
              </p>

              <div className="mt-6 space-y-4">
                <Input
                  label="Provedor"
                  value="OpenAI"
                  disabled
                  hint="Em breve: Anthropic, Google Gemini, Ollama e Kimi."
                />
                <Input
                  label="Chave da API"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  variant="primary"
                  disabled={!apiKey.trim()}
                  onClick={() => {
                    setApiKeySaved(true);
                    setApiKey('');
                    setTimeout(() => setApiKeySaved(false), 2400);
                  }}
                >
                  Salvar chave
                </Button>
                {apiKeySaved ? (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-[13px] text-[var(--kazer-green)]"
                  >
                    <Check size={13} />
                    Chave salva
                  </motion.span>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === 'tema' ? (
            <section className="max-w-[440px]">
              <h2 className="text-[17px] font-medium text-[var(--kazer-text)]">
                Aparência
              </h2>
              <p className="mt-1.5 text-[14px] leading-[21px] text-[var(--kazer-text-2)]">
                A identidade do KAZER é a mesma nos dois temas — só a
                luminância muda.
              </p>

              <div className="mt-5 space-y-2">
                {(
                  [
                    ['dark', 'Escuro', Moon],
                    ['light', 'Claro', Sun],
                    ['system', 'Sistema', Monitor],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPreference(value as ThemePreference)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                      preference === value
                        ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)]'
                        : 'border-[var(--kazer-line)] hover:border-[var(--kazer-line-active)]',
                    )}
                  >
                    <Icon size={15} className="shrink-0 text-[var(--kazer-text-2)]" />
                    <span className="text-[15px] font-medium text-[var(--kazer-text)]">
                      {label}
                    </span>
                    {preference === value ? (
                      <Check
                        size={15}
                        className="ml-auto shrink-0 text-[var(--kazer-gold)]"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {tab === 'assinatura' ? (
            <section className="max-w-[520px]">
              <h2 className="text-[17px] font-medium text-[var(--kazer-text)]">
                Assinatura
              </h2>

              <div className="mt-5 rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[17px] font-medium text-[var(--kazer-text)]">
                      {currentPlan?.name}
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--kazer-text-3)]">
                      {currentPlan?.priceBRL
                        ? `${currentPlan.priceLabel}/mês`
                        : 'Gratuito'}
                    </p>
                  </div>
                  {currentPlan?.featured ? (
                    <span className="rounded-full bg-[var(--kazer-gold-wash)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--kazer-gold-text)]">
                      MAX
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 border-t border-[var(--kazer-line)] pt-4">
                  <p className="text-[13px] text-[var(--kazer-text-2)]">
                    Uso hoje:{' '}
                    <span className="font-mono tabular-nums text-[var(--kazer-text)]">
                      18 / {currentPlan?.limits.dailyMessages} mensagens
                    </span>
                  </p>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--kazer-inset)]"
                    role="progressbar"
                    aria-valuenow={18}
                    aria-valuemin={0}
                    aria-valuemax={currentPlan?.limits.dailyMessages}
                    aria-label="Uso diário de mensagens"
                  >
                    <div
                      className="h-full rounded-full bg-[var(--kazer-gold)]"
                      style={{
                        width: `${Math.min(
                          100,
                          (18 / (currentPlan?.limits.dailyMessages ?? 40)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button variant="primary" size="sm" asChild>
                    <a href="/kazer/pricing">Ver planos</a>
                  </Button>
                  {plan !== 'free' ? (
                    <Button variant="secondary" size="sm">
                      Cancelar assinatura
                    </Button>
                  ) : null}
                </div>
              </div>

              {/* Notifications */}
              <div className="mt-8 border-t border-[var(--kazer-line)] pt-6">
                <h3 className="text-[15px] font-medium text-[var(--kazer-text)]">
                  Notificações
                </h3>
                <p className="mt-1 text-[13px] leading-[19px] text-[var(--kazer-text-2)]">
                  Avise-me quando uma tarefa longa terminar.
                </p>
                <label className="mt-4 flex items-center justify-between rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-3.5">
                  <span className="flex items-center gap-2.5 text-[14px] text-[var(--kazer-text)]">
                    <Bell size={14} className="text-[var(--kazer-text-3)]" />
                    Push ao concluir missões
                  </span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded-[4px] border-[var(--kazer-line-strong)] accent-[var(--kazer-gold)]"
                  />
                </label>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </WorkspaceShell>
  );
}

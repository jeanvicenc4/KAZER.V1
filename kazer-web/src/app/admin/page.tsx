'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Search, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoSkills } from '@kazer/core';

const METRICS = [
  {
    icon: Users,
    label: 'Usuários ativos',
    value: '1.284',
    delta: '+8,4%',
    positive: true,
  },
  {
    icon: Wallet,
    label: 'MRR',
    value: 'R$ 68.420',
    delta: '+12,1%',
    positive: true,
  },
  {
    icon: Activity,
    label: 'Execuções hoje',
    value: '9.412',
    delta: '+3,2%',
    positive: true,
  },
  {
    icon: AlertTriangle,
    label: 'Falhas de tool',
    value: '1,8%',
    delta: '-0,4%',
    positive: true,
  },
];

const USERS = [
  {
    name: 'Ana Carvalho',
    email: 'ana.carvalho@kazer.app',
    plan: 'pro' as const,
    messages: 214,
    lastSeen: '2 min',
    status: 'active',
  },
  {
    name: 'Bruno Teixeira',
    email: 'bruno.teixeira@empresa.com',
    plan: 'max' as const,
    messages: 1842,
    lastSeen: '8 min',
    status: 'active',
  },
  {
    name: 'Carla Menezes',
    email: 'carla.menezes@studio.io',
    plan: 'free' as const,
    messages: 12,
    lastSeen: '3 h',
    status: 'active',
  },
  {
    name: 'Diego Almeida',
    email: 'diego.almeida@corp.com',
    plan: 'pro' as const,
    messages: 388,
    lastSeen: '1 dia',
    status: 'idle',
  },
  {
    name: 'Elisa Fontes',
    email: 'elisa.fontes@agency.tv',
    plan: 'max' as const,
    messages: 2210,
    lastSeen: '1 dia',
    status: 'active',
  },
  {
    name: 'Felipe Rocha',
    email: 'felipe.rocha@startup.io',
    plan: 'free' as const,
    messages: 3,
    lastSeen: '4 dias',
    status: 'churned',
  },
];

const PLAN_STYLES = {
  free: 'border-[var(--kazer-line)] text-[var(--kazer-text-3)]',
  pro: 'border-[var(--kazer-line-active)] text-[var(--kazer-text-2)]',
  max: 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)]',
};

export default function AdminPage() {
  const [query, setQuery] = React.useState('');
  const [planFilter, setPlanFilter] = React.useState<'all' | 'free' | 'pro' | 'max'>('all');

  const filtered = USERS.filter((user) => {
    if (planFilter !== 'all' && user.plan !== planFilter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-dvh bg-[var(--kazer-base)]">
      <header className="border-b border-[var(--kazer-line)]">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-5">
          <h1 className="text-[16px] font-medium text-[var(--kazer-text)]">
            Admin
          </h1>
          <span className="rounded-[4px] border border-[var(--kazer-line)] px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--kazer-text-3)]">
            dados de demonstração
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8">
        {/* Metrics */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: index * 0.05 }}
              className="rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-4"
            >
              <div className="flex items-center gap-2">
                <metric.icon size={14} className="text-[var(--kazer-text-3)]" />
                <span className="text-[13px] text-[var(--kazer-text-2)]">
                  {metric.label}
                </span>
              </div>
              <p className="mt-2.5 text-[24px] font-medium leading-none tracking-[-0.015em] text-[var(--kazer-text)]">
                {metric.value}
              </p>
              <p
                className={cn(
                  'mt-1.5 font-mono text-[12px] tabular-nums',
                  metric.positive
                    ? 'text-[var(--kazer-green)]'
                    : 'text-[var(--kazer-red)]',
                )}
              >
                {metric.delta}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Users */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-medium text-[var(--kazer-text)]">
              Usuários
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--kazer-text-3)]"
                  aria-hidden
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar usuário"
                  aria-label="Buscar usuário"
                  className="h-8 w-[200px] rounded-md border border-[var(--kazer-line)] bg-[var(--kazer-inset)] pl-8 pr-2 text-[13px] text-[var(--kazer-text)] placeholder:text-[var(--kazer-text-3)] focus:border-[var(--kazer-line-gold)] focus:outline-none"
                />
              </div>

              {(['all', 'free', 'pro', 'max'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlanFilter(p)}
                  aria-pressed={planFilter === p}
                  className={cn(
                    'h-8 rounded-md border px-2.5 text-[13px] transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]',
                    planFilter === p
                      ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)]'
                      : 'border-[var(--kazer-line)] text-[var(--kazer-text-2)] hover:border-[var(--kazer-line-active)]',
                  )}
                >
                  {p === 'all' ? 'Todos' : p === 'max' ? 'MAX' : p}
                </button>
              ))}
            </div>
          </div>

          <div className="kazer-scroll mt-4 overflow-x-auto rounded-[14px] border border-[var(--kazer-line)]">
            <table className="w-full min-w-[640px] border-collapse text-[14px]">
              <thead>
                <tr className="bg-[var(--kazer-surface)]">
                  {['Usuário', 'Plano', 'Mensagens', 'Última atividade', 'Status'].map(
                    (header) => (
                      <th
                        key={header}
                        className="border-b border-[var(--kazer-line)] px-4 py-3 text-left text-[13px] font-medium text-[var(--kazer-text-2)]"
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.email}
                    className="transition-colors hover:bg-[var(--kazer-elevated)]"
                  >
                    <td className="border-b border-[var(--kazer-line)] px-4 py-2.5">
                      <span className="block text-[var(--kazer-text)]">{user.name}</span>
                      <span className="block font-mono text-[12px] text-[var(--kazer-text-3)]">
                        {user.email}
                      </span>
                    </td>
                    <td className="border-b border-[var(--kazer-line)] px-4 py-2.5">
                      <span
                        className={cn(
                          'rounded-[4px] border px-1.5 py-px text-[11px] uppercase tracking-[0.06em]',
                          PLAN_STYLES[user.plan],
                        )}
                      >
                        {user.plan === 'max' ? 'MAX' : user.plan}
                      </span>
                    </td>
                    <td className="border-b border-[var(--kazer-line)] px-4 py-2.5 font-mono tabular-nums text-[var(--kazer-text-2)]">
                      {user.messages.toLocaleString('pt-BR')}
                    </td>
                    <td className="border-b border-[var(--kazer-line)] px-4 py-2.5 text-[var(--kazer-text-3)]">
                      {user.lastSeen}
                    </td>
                    <td className="border-b border-[var(--kazer-line)] px-4 py-2.5">
                      <span
                        className={cn(
                          'flex items-center gap-1.5 text-[13px]',
                          user.status === 'active'
                            ? 'text-[var(--kazer-green)]'
                            : user.status === 'idle'
                              ? 'text-[var(--kazer-amber)]'
                              : 'text-[var(--kazer-text-3)]',
                        )}
                      >
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full bg-current"
                        />
                        {user.status === 'active'
                          ? 'Ativo'
                          : user.status === 'idle'
                            ? 'Inativo'
                            : 'Cancelou'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filtered.length ? (
            <p className="mt-6 text-center text-[14px] text-[var(--kazer-text-3)]">
              Nenhum usuário encontrado.
            </p>
          ) : null}
        </section>

        {/* Skill usage */}
        <section className="mt-10">
          <h2 className="text-[18px] font-medium text-[var(--kazer-text)]">
            Uso por Skill
          </h2>
          <div className="mt-4 space-y-3">
            {demoSkills.map((skill) => {
              const max = Math.max(...demoSkills.map((s) => s.runs));
              return (
                <div key={skill.id}>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[var(--kazer-text-2)]">{skill.name}</span>
                    <span className="font-mono tabular-nums text-[var(--kazer-text-3)]">
                      {skill.runs.toLocaleString('pt-BR')} execuções
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--kazer-inset)]">
                    <div
                      className="h-full rounded-full bg-[var(--kazer-gold)]"
                      style={{ width: `${(skill.runs / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

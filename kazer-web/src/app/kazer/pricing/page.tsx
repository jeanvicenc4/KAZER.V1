'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Minus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CheckList } from '@/components/landing/landing-hero';
import { PaywallModal } from '@/components/billing/paywall-modal';
import { usePlan } from '@/hooks/use-kazer';
import { cn } from '@/lib/utils';
import { planDefinitions } from '@kazer/core';

const COMPARISON: {
  label: string;
  values: { free: string; pro: string; max: string };
}[] = [
  { label: 'Mensagens por dia', values: { free: '40', pro: '500', max: '5.000' } },
  { label: 'Pesquisas por dia', values: { free: '10', pro: '120', max: '1.000' } },
  { label: 'Fontes por resposta', values: { free: '5', pro: '22', max: '60' } },
  { label: 'Buscas em paralelo', values: { free: '2', pro: '6', max: '12' } },
  { label: 'Skills ativas', values: { free: '1', pro: '5', max: 'Ilimitadas' } },
  { label: 'Histórico', values: { free: '30 dias', pro: '1 ano', max: '10 anos' } },
  { label: 'Armazenamento', values: { free: '100 MB', pro: '2 GB', max: '50 GB' } },
  { label: 'Exportação de conversas', values: { free: '—', pro: 'Sim', max: 'Sim' } },
  { label: 'Execução de tarefas', values: { free: '—', pro: '—', max: 'Sim' } },
  { label: 'Agentes autônomos', values: { free: '—', pro: '—', max: 'Sim' } },
  { label: 'Criação de artefatos', values: { free: '—', pro: '—', max: 'Sim' } },
  { label: 'Execução em segundo plano', values: { free: '—', pro: '—', max: 'Sim' } },
  { label: 'Notificação de conclusão', values: { free: '—', pro: '—', max: 'Sim' } },
  { label: 'Fila', values: { free: 'Padrão', pro: 'Normal', max: 'Prioritária' } },
];

const FAQ = [
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. O cancelamento é imediato e você mantém o acesso até o fim do período já pago. Não há fidelidade nem multa.',
  },
  {
    q: 'Quais são os limites de uso?',
    a: 'Mensagens, pesquisas, fontes por resposta e Skills ativas são contados por dia ou por workspace e aparecem em Configurações › Assinatura. Ao atingir o limite, o KAZER avisa antes de bloquear.',
  },
  {
    q: 'Como funciona o reembolso?',
    a: 'Reembolso integral em até 7 dias após a primeira cobrança, desde que o uso do plano não ultrapasse 20% dos recursos do mês. Pedidos acima disso são analisados caso a caso.',
  },
  {
    q: 'O que muda entre web e app?',
    a: 'Nada de essencial. A mesma conta, o mesmo histórico, as mesmas fontes, os mesmos artefatos e as mesmas Skills. O app adiciona push e modo offline.',
  },
  {
    q: 'A cobrança é em reais?',
    a: 'Sim. Todos os planos são cobrados em BRL, pela Stripe na web e pela RevenueCat no app.',
  },
  {
    q: 'Posso mudar de plano no meio do mês?',
    a: 'Sim. O upgrade é aplicado imediatamente, com cobrança proporcional. O downgrade entra no próximo ciclo.',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { plan, setDemoPlan } = usePlan();
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const [openFaq, setOpenFaq] = React.useState<string | null>(FAQ[0].q);

  const choose = async (target: 'free' | 'pro' | 'max') => {
    if (target === 'max') {
      setPaywallOpen(true);
      return;
    }
    await setDemoPlan(target);
    router.push('/kazer');
  };

  return (
    <div className="min-h-dvh bg-[var(--kazer-base)]">
      {/* Nav */}
      <header className="border-b border-[var(--kazer-line)]">
        <nav
          aria-label="Principal"
          className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5"
        >
          <Link
            href="/kazer"
            className="rounded-[6px] text-[14px] text-[var(--kazer-text-2)] transition-colors hover:text-[var(--kazer-text)]"
          >
            Voltar ao KAZER
          </Link>
          <div className="ml-auto">
            <span className="font-mono text-[12px] text-[var(--kazer-text-3)]">
              demonstração · plano atual: {plan.toUpperCase()}
            </span>
          </div>
        </nav>
      </header>

      {/* Header */}
      <section className="px-5 pt-16 text-center">
        <h1 className="text-[36px] font-medium leading-[42px] tracking-[-0.02em] text-[var(--kazer-text)] sm:text-[44px] sm:leading-[50px]">
          Planos
        </h1>
        <p className="mx-auto mt-4 max-w-[52ch] text-[16px] leading-[24px] text-[var(--kazer-text-2)]">
          Comece de graça. Suba quando precisar que o KAZER execute de verdade.
        </p>
      </section>

      {/* Cards */}
      <section className="mx-auto mt-12 max-w-[1200px] px-5">
        <div className="grid gap-4 lg:grid-cols-3">
          {planDefinitions.map((definition, index) => {
            const featured = definition.featured;
            return (
              <motion.div
                key={definition.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  'relative flex flex-col rounded-[20px] border p-6',
                  featured
                    ? 'border-[var(--kazer-line-gold)] bg-[var(--kazer-surface)] shadow-[var(--shadow-gold)]'
                    : 'border-[var(--kazer-line)] bg-[var(--kazer-surface)]',
                )}
              >
                {featured ? (
                  <>
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px rounded-t-[20px]"
                      style={{ background: 'var(--kazer-metal)' }}
                    />
                    <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-[var(--kazer-gold)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--kazer-text-inverse)]">
                      <Sparkles size={11} />
                      Recomendado
                    </span>
                  </>
                ) : null}

                <h2 className="text-[18px] font-medium text-[var(--kazer-text)]">
                  {definition.name}
                </h2>
                <p className="mt-1.5 min-h-[40px] text-[14px] leading-[20px] text-[var(--kazer-text-2)]">
                  {definition.tagline}
                </p>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-[34px] font-medium leading-none tracking-[-0.02em] text-[var(--kazer-text)]">
                    {definition.priceLabel}
                  </span>
                  {definition.priceBRL > 0 ? (
                    <span className="text-[14px] text-[var(--kazer-text-3)]">
                      /mês
                    </span>
                  ) : null}
                </div>

                <Button
                  variant={featured ? 'primary' : 'secondary'}
                  size="lg"
                  className="mt-6 w-full"
                  onClick={() => choose(definition.id)}
                >
                  {definition.cta}
                </Button>

                <div className="mt-7 border-t border-[var(--kazer-line)] pt-5">
                  <CheckList items={definition.highlights} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[13px] text-[var(--kazer-text-3)]">
          Preços em BRL, cobrança mensal. Cancelamento a qualquer momento.
        </p>
      </section>

      {/* Comparison table */}
      <section className="mx-auto mt-20 max-w-[1200px] px-5">
        <h2 className="text-[24px] font-medium tracking-[-0.015em] text-[var(--kazer-text)]">
          Comparativo
        </h2>

        <div className="kazer-scroll mt-6 overflow-x-auto rounded-[14px] border border-[var(--kazer-line)]">
          <table className="w-full min-w-[620px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-[var(--kazer-surface)]">
                <th className="border-b border-[var(--kazer-line)] px-4 py-3 text-left text-[13px] font-medium text-[var(--kazer-text-2)]">
                  Recurso
                </th>
                {planDefinitions.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      'border-b border-[var(--kazer-line)] px-4 py-3 text-center text-[13px] font-medium',
                      p.featured
                        ? 'bg-[var(--kazer-gold-wash)] text-[var(--kazer-gold-text)]'
                        : 'text-[var(--kazer-text-2)]',
                    )}
                  >
                    {p.name.replace('KAZER ', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label}>
                  <td className="border-b border-[var(--kazer-line)] px-4 py-2.5 text-[var(--kazer-text-2)]">
                    {row.label}
                  </td>
                  {(['free', 'pro', 'max'] as const).map((key) => {
                    const value = row.values[key];
                    const disabled = value === '—';
                    return (
                      <td
                        key={key}
                        className={cn(
                          'border-b border-[var(--kazer-line)] px-4 py-2.5 text-center tabular-nums',
                          key === 'max' && 'bg-[var(--kazer-gold-wash)]',
                          disabled
                            ? 'text-[var(--kazer-text-3)]'
                            : 'text-[var(--kazer-text)]',
                        )}
                      >
                        {disabled ? (
                          <Minus
                            size={13}
                            className="mx-auto text-[var(--kazer-text-3)]"
                            aria-label="Não incluído"
                          />
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-20 max-w-[760px] px-5">
        <h2 className="text-[24px] font-medium tracking-[-0.015em] text-[var(--kazer-text)]">
          Perguntas frequentes
        </h2>

        <div className="mt-6 divide-y divide-[var(--kazer-line)] border-y border-[var(--kazer-line)]">
          {FAQ.map((item) => {
            const open = openFaq === item.q;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : item.q)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-[var(--kazer-gold-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
                >
                  <span className="text-[15px] font-medium text-[var(--kazer-text)]">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'text-[20px] leading-none text-[var(--kazer-text-3)] transition-transform duration-200',
                      open && 'rotate-45',
                    )}
                  >
                    +
                  </span>
                </button>
                {open ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden pb-4 text-[14px] leading-[22px] text-[var(--kazer-text-2)]"
                  >
                    {item.a}
                  </motion.p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo plan toggle */}
      <section className="mx-auto mt-16 max-w-[760px] px-5 pb-20">
        <div className="rounded-[14px] border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-5">
          <p className="text-[14px] font-medium text-[var(--kazer-text)]">
            Demonstração
          </p>
          <p className="mt-1 text-[13px] leading-[19px] text-[var(--kazer-text-2)]">
            Alterne o plano para testar como cada nível de acesso se comporta
            na interface.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['free', 'pro', 'max'] as const).map((p) => (
              <Button
                key={p}
                variant={plan === p ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setDemoPlan(p)}
              >
                {p === 'max' ? 'KAZER MAX' : p === 'pro' ? 'Pro' : 'Free'}
                {plan === p ? (
                  <Check size={12} />
                ) : null}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSubscribe={async () => {
          await setDemoPlan('max');
          setPaywallOpen(false);
          router.push('/kazer');
        }}
      />
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Github, Globe, ShieldCheck, Zap } from 'lucide-react';
import { KazerLockup } from '@/components/brand/kazer-mark';
import { Button } from '@/components/ui/button';
import { LandingHero, FeatureRow, CheckList } from '@/components/landing/landing-hero';
import { planDefinitions } from '@kazer/core';

export const metadata: Metadata = {
  title: 'KAZER — Pergunte. O KAZER executa.',
  description:
    'Plataforma de inteligência artificial de pesquisa, execução e criação. Respostas com fontes verificáveis, agentes autônomos e artefatos prontos.',
};

const STEPS = [
  {
    title: 'Você pergunta ou inicia uma missão',
    description:
      'Escreva em português, do jeito que falaria com um colega. O KAZER entende a intenção e decide se precisa pesquisar, raciocinar ou executar.',
  },
  {
    title: 'O KAZER pesquisa em paralelo',
    description:
      'Gera de 3 a 5 consultas, busca ao mesmo tempo, lê as páginas, filtra o que é ruído e pondera o que sobra.',
  },
  {
    title: 'A resposta vem com fonte',
    description:
      'Cada afirmação relevante carrega uma citação numerada que abre a fonte original. Você verifica em dois cliques, sem sair do KAZER.',
  },
  {
    title: 'O resultado vira artefato',
    description:
      'Relatório, planilha, código, landing page ou PDF. Versionado, pronto para usar e vinculado à conversa de origem.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--kazer-base)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--kazer-line)] bg-[color-mix(in_oklch,var(--kazer-base)_86%,transparent)] backdrop-blur-xl">
        <nav
          aria-label="Principal"
          className="mx-auto flex h-16 max-w-[1200px] items-center gap-6 px-5"
        >
          <Link
            href="/"
            aria-label="KAZER — início"
            className="rounded-[6px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--kazer-gold)]"
          >
            <KazerLockup size={24} />
          </Link>

          <div className="ml-auto hidden items-center gap-6 text-[14px] text-[var(--kazer-text-2)] md:flex">
            <Link
              href="/#produto"
              className="transition-colors hover:text-[var(--kazer-text)]"
            >
              Produto
            </Link>
            <Link
              href="/kazer/agents"
              className="transition-colors hover:text-[var(--kazer-text)]"
            >
              Skills
            </Link>
            <Link
              href="/kazer/pricing"
              className="transition-colors hover:text-[var(--kazer-text)]"
            >
              Planos
            </Link>
            <Link
              href="/#faq"
              className="transition-colors hover:text-[var(--kazer-text)]"
            >
              Perguntas
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup">Começar grátis</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:pt-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 opacity-[0.14]"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.82 0.135 82), transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-[720px] text-center">
            <h1 className="text-[40px] font-medium leading-[46px] tracking-[-0.025em] text-[var(--kazer-text)] sm:text-[56px] sm:leading-[62px]">
              Pergunte.
              <br />
              <span className="kazer-gradient-text">O KAZER executa.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[54ch] text-[17px] leading-[26px] text-[var(--kazer-text-2)]">
              Inteligência artificial de pesquisa, execução e criação. Respostas
              com fontes verificáveis e artefatos prontos para usar.
            </p>
          </div>

          <LandingHero />

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href="/signup">
                Começar grátis
                <ArrowRight size={15} />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/kazer">Ver a demonstração</Link>
            </Button>
          </div>

          <p className="mt-4 text-center text-[13px] text-[var(--kazer-text-3)]">
            Sem cartão. 40 mensagens por dia no plano Free.
          </p>
        </div>
      </section>

      {/* What it does */}
      <section id="produto" className="border-t border-[var(--kazer-line)] px-5 py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[var(--kazer-text)]">
            Três coisas que o KAZER faz e um chatbot não
          </h2>

          <div className="mt-10 grid gap-x-12 md:grid-cols-2">
            <FeatureRow
              index="01"
              title="Resposta com fonte, não opinião"
              description="Cada afirmação relevante carrega uma citação numerada. Clique e você vai direto para a página original que sustenta a afirmação."
              accent="gold"
            />
            <FeatureRow
              index="02"
              title="Missões que terminam em entrega"
              description="Você descreve o resultado esperado. O KAZER planeja, executa ferramentas, valida e devolve o artefato pronto — documento, planilha, código ou site."
              accent="violet"
            />
            <FeatureRow
              index="03"
              title="Um espaço de trabalho, não uma caixa de texto"
              description="Histórico organizado, Skills que você ativa, artefatos versionados, execução em segundo plano e fila prioritária."
              accent="cyan"
            />
            <FeatureRow
              index="04"
              title="Você escolhe o modelo"
              description="Modelos premium, raciocínio estendido, modelos locais via Ollama. A mesma conta, o mesmo histórico, na web e no app."
              accent="gold"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--kazer-line)] px-5 py-20">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[var(--kazer-text)]">
            Como funciona
          </h2>

          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="border-t border-[var(--kazer-line)] pt-5"
              >
                <span className="font-mono text-[12px] text-[var(--kazer-gold)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2.5 text-[16px] font-medium leading-[22px] text-[var(--kazer-text)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[21px] text-[var(--kazer-text-2)]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-[var(--kazer-line)] px-5 py-20">
        <div className="mx-auto grid max-w-[1200px] gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[var(--kazer-text)]">
              Feito para quem entrega trabalho
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-[24px] text-[var(--kazer-text-2)]">
              O KAZER foi desenhado para a mão de quem precisa entregar algo
              concreto no fim do dia — não para conversar.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                {
                  icon: Globe,
                  title: 'Research com 60 fontes por resposta',
                  body: 'Buscas paralelas, leitura completa, ponderação por relevância e citação inline onde a afirmação acontece.',
                },
                {
                  icon: Zap,
                  title: 'Execução em segundo plano',
                  body: 'Missão longa continua rodando. Você recebe push quando termina, na web e no celular.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Skills com permissão explícita',
                  body: 'Cada Skill declara o que acessa: web, arquivos, shell. Você vê antes de ativar.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--kazer-line)] bg-[var(--kazer-surface)] text-[var(--kazer-gold)]">
                    <item.icon size={16} />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-medium leading-[22px] text-[var(--kazer-text)]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[14px] leading-[21px] text-[var(--kazer-text-2)]">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing teaser */}
          <div id="planos" className="rounded-[20px] border border-[var(--kazer-line)] bg-[var(--kazer-surface)] p-7">
            <h3 className="text-[20px] font-medium text-[var(--kazer-text)]">
              Planos
            </h3>
            <p className="mt-1.5 text-[14px] text-[var(--kazer-text-2)]">
              Comece de graça. Suba quando precisar de execução.
            </p>

            <div className="mt-6 space-y-3">
              {planDefinitions.map((plan) => (
                <div
                  key={plan.id}
                  className={
                    plan.featured
                      ? 'rounded-xl border border-[var(--kazer-line-gold)] bg-[var(--kazer-gold-wash)] p-4'
                      : 'rounded-xl border border-[var(--kazer-line)] p-4'
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[15px] font-medium text-[var(--kazer-text)]">
                      {plan.name}
                    </span>
                    <span className="text-[15px] font-medium tabular-nums text-[var(--kazer-text)]">
                      {plan.priceLabel}
                      {plan.priceBRL > 0 ? (
                        <span className="text-[12px] font-normal text-[var(--kazer-text-3)]">
                          /mês
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-[18px] text-[var(--kazer-text-2)]">
                    {plan.tagline}
                  </p>
                  {plan.featured ? (
                    <div className="mt-3 border-t border-[var(--kazer-line-gold)] pt-3">
                      <CheckList
                        items={plan.highlights.slice(0, 4)}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <Button variant="outlineGold" className="mt-6 w-full" asChild>
              <Link href="/kazer/pricing">Ver comparativo completo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[var(--kazer-line)] px-5 py-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-medium leading-[34px] tracking-[-0.015em] text-[var(--kazer-text)]">
            Perguntas frequentes
          </h2>

          <div className="mt-8 divide-y divide-[var(--kazer-line)]">
            {[
              {
                q: 'O KAZER é um chat com busca?',
                a: 'Não. Ele executa. Além da resposta com fontes, o KAZER roda ferramentas, valida o resultado e entrega artefatos prontos. A resposta é o começo do trabalho, não o fim.',
              },
              {
                q: 'Funciona sem internet?',
                a: 'No app, o histórico recente continua disponível offline e suas mensagens ficam em fila para envio quando a conexão voltar. As missões em execução, não — elas dependem de rede.',
              },
              {
                q: 'Posso cancelar quando quiser?',
                a: 'Sim. O cancelamento é imediato e você mantém o acesso até o fim do período já pago. Não há fidelidade.',
              },
              {
                q: 'O que exatamente o plano MAX libera?',
                a: 'Execução de tarefas e missões completas, agentes autônomos com tool calling, criação de artefatos em PDF, DOCX, XLSX, CSV, código e landing pages, execução em segundo plano com notificação e fila prioritária.',
              },
              {
                q: 'Meus dados ficam guardados como?',
                a: 'Cada conta tem isolamento por Row Level Security no PostgreSQL. Uma consulta de outro usuário não retorna nada, nem por bug de aplicação.',
              },
            ].map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-[var(--kazer-text)]">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-[20px] leading-none text-[var(--kazer-text-3)] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-[62ch] text-[15px] leading-[24px] text-[var(--kazer-text-2)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--kazer-line)] px-5 py-24">
        <div className="mx-auto max-w-[560px] text-center">
          <h2 className="text-[32px] font-medium leading-[38px] tracking-[-0.02em] text-[var(--kazer-text)]">
            Comece a executar
          </h2>
          <p className="mt-3 text-[16px] leading-[24px] text-[var(--kazer-text-2)]">
            Grátis para começar. Sem cartão. Em menos de um minuto.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href="/signup">
                Criar conta
                <ArrowRight size={15} />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--kazer-line)] px-5 py-10">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <KazerLockup size={20} />
          <nav
            aria-label="Rodapé"
            className="flex flex-wrap items-center gap-5 text-[13px] text-[var(--kazer-text-3)]"
          >
            <Link href="/kazer/pricing" className="hover:text-[var(--kazer-text-2)]">
              Planos
            </Link>
            <Link href="/kazer/agents" className="hover:text-[var(--kazer-text-2)]">
              Skills
            </Link>
            <span>Privacidade</span>
            <span>Termos</span>
            <span>pt-BR</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--kazer-text-2)]"
            >
              <Github size={13} />
              GitHub
            </a>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-[1200px] text-[12px] text-[var(--kazer-text-3)]">
          © 2026 KAZER. Interface de demonstração — dados, fontes e artefatos
          exibidos são fictícios.
        </p>
      </footer>
    </div>
  );
}

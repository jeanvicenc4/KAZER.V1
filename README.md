# KAZER

> **Pergunte. O KAZER executa.**

Plataforma de inteligência artificial de **pesquisa, execução e criação** —
disponível na web (Next.js) e em app mobile (Android/iOS, Expo).

O KAZER não é um chat com busca. É uma **estação de trabalho de IA**: você
pergunta ou inicia uma missão, e ele pesquisa em paralelo, lê as fontes,
raciocina, executa ferramentas e entrega respostas com fontes verificáveis
mais artefatos prontos para usar.

---

## Índice

- [O que o KAZER faz](#o-que-o-kazer-faz)
- [Arquitetura do monorepo](#arquitetura-do-monorepo)
- [Stack](#stack)
- [Setup](#setup)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Design system](#design-system)
- [Agent Skills](#agent-skills)
- [Planos e paywall](#planos-e-paywall)
- [Estado atual — o que é real e o que é mock](#estado-atual--o-que-é-real-e-o-que-é-mock)
- [Build e deploy](#build-e-deploy)
- [Roadmap](#roadmap)

---

## O que o KAZER faz

| Modo | Comportamento |
|---|---|
| **Chat** | Conversa com streaming token a token, Markdown, code blocks com botão de copiar, tabelas. |
| **Research** | Classifica a intenção, gera 3–5 queries, busca em paralelo, lê e pondera as fontes, sintetiza com citações inline `[1][2][3]` e painel de fontes. |
| **Missão** | Agente autônomo com tool calling: planeja, executa, valida e entrega artefato (Markdown, PDF, DOCX, XLSX, CSV, código, landing page, imagem). |

Em todos os modos, a **Missão Trace** — o rail vertical que acende passo a
passo — mostra o que o KAZER está fazendo: intenção → buscas paralelas →
fontes lidas → síntese → artefato.

---

## Arquitetura do monorepo

```
KAZER/
├── kazer-web/          Next.js 15 (App Router) · Tailwind v4 · shadcn/ui · Framer Motion
├── kazer-mobile/       Expo + React Native · Expo Router · NativeWind · Reanimated
├── kazer-core/         Tokens, tipos, mock data e interfaces de adapter compartilhados
└── skills/             Agent Skills no formato SKILL.md
```

**`kazer-core` é a fonte única de verdade.** Tokens de design, tipos de
domínio, dados de demonstração e as interfaces `ChatAdapter`,
`ResearchAdapter`, `ArtifactAdapter`, `BillingAdapter` e `SkillsAdapter` moram
ali. Web e mobile importam o mesmo pacote — é isso que garante que ambos
falam a mesma língua visual e usam os mesmos dados.

O ponto de troca com o backend é **um lugar só**: as implementações mock em
`kazer-core/src/adapters/mock.ts`. Troque por implementações reais
(Supabase + Vercel AI SDK + Stripe) sem tocar em nenhum componente de UI.

```
UI (web / mobile)
      ↓  interfaces
kazer-core/src/adapters/types.ts
      ↓  implementações
mock.ts  →  (futuro) supabase.ts · ai.ts · stripe.ts · revenuecat.ts
```

---

## Stack

**Web** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui (Radix) · Framer Motion · react-markdown + remark-gfm

**Mobile** — Expo SDK 52 · React Native 0.76 · Expo Router · NativeWind v4 ·
Reanimated 3 · react-native-svg · expo-notifications

**Core** — TypeScript puro, sem dependências de runtime

**Planejado (backend)** — Supabase (Auth, PostgreSQL com RLS, Storage,
Realtime) · Vercel AI SDK · Zod · Drizzle · Stripe (web) · RevenueCat (mobile)
· provedores: OpenAI, Anthropic, Google Gemini, Ollama · busca: SearXNG,
Tavily, Exa ou Brave

---

## Setup

Pré-requisitos: **Node 20+** e **npm 10+**.

```bash
# 1. Instalar as dependências da web (o core é linkado como file: dependency)
cd kazer-web
npm install
cp .env.example .env.local

# 2. Rodar
npm run dev
# → http://localhost:3000
```

### Mobile

```bash
cd kazer-mobile
npm install
cp .env.example .env.local

npm run ios       # simulador iOS
npm run android  # emulador Android
npm start         # Expo Go / QR code
```

O `kazer-core` é resolvido via `tsconfig` paths + `metro.config.js`
(`watchFolders` inclui `../kazer-core`).

### Verificação de qualidade

```bash
cd kazer-web
npm run typecheck   # tsc --noEmit
npm run build       # build de produção do Next
```

---

## Variáveis de ambiente

Apenas placeholders — **nenhuma chave real no repositório**. O front-end
funciona inteiramente com os adapters mock, sem nenhuma delas.

### `kazer-web/.env.local`

```bash
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# --- IA ---
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
OLLAMA_BASE_URL=http://localhost:11434

# --- Busca ---
TAVILY_API_KEY=tvly-...
EXA_API_KEY=...
BRAVE_SEARCH_API_KEY=...
SEARXNG_BASE_URL=https://SEU-SEARXNG

# --- Stripe ---
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_MAX=price_...

# --- App ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_SITE_URL=http://localhost:3000
```

### `kazer-mobile/.env.local`

```bash
# --- Supabase (mesma conta da web) ---
EXPO_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# --- RevenueCat ---
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT=pro
REVENUECAT_WEBHOOK_SECRET=...

# --- Push ---
EXPO_PUBLIC_EAS_PROJECT_ID=...
EXPO_PUBLIC_EAS_NOTIFICATION_...=...

# --- Deep linking ---
EXPO_PUBLIC_APP_SCHEME=kazer
```

### `kazer-core/.env.example`

```bash
# Configuração compartilhada de backend (opcional no front-end)
KAZER_DEFAULT_MODEL=kazer-4
KAZER_DEFAULT_LOCALE=pt-BR
KAZER_MAX_PRICE_BRL=59.99
```

---

## Estrutura de pastas

```
KAZER/
├── kazer-web/
│   ├── src/
│   │   ├── app/                    # App Router
│   │   │   ├── page.tsx            # landing
│   │   │   ├── login/ signup/ onboarding/
│   │   │   ├── kazer/
│   │   │   │   ├── layout.tsx      # WorkspaceProvider
│   │   │   │   ├── page.tsx        # workspace principal
│   │   │   │   ├── chat/[id]/      # conversa com streaming
│   │   │   │   ├── research/       # modo Research
│   │   │   │   ├── agents/         # biblioteca de Skills
│   │   │   │   ├── artifacts/      # entregáveis
│   │   │   │   ├── pricing/        # Free · Pro · MAX
│   │   │   │   └── settings/
│   │   │   └── admin/
│   │   ├── components/
│   │   │   ├── brand/              # KazerMark (logo)
│   │   │   ├── chat/               # MissionTrace, Composer, Message, Markdown
│   │   │   ├── sources/            # SourceCard, CitationChip
│   │   │   ├── artifacts/ billing/ workspace/ ui/ theme/ landing/ auth/
│   │   ├── hooks/                  # use-chat, use-kazer
│   │   ├── lib/ utils.ts
│   │   └── styles/globals.css      # tokens em @theme (Tailwind v4)
│   ├── next.config.ts · tailwind via postcss · tsconfig.json
│
├── kazer-mobile/
│   ├── app/                        # Expo Router
│   │   ├── _layout.tsx  index.tsx  splash.tsx  onboarding.tsx
│   │   ├── login.tsx  signup.tsx
│   │   ├── chat/[id].tsx  research.tsx
│   │   ├── skills.tsx  artifacts.tsx  settings.tsx
│   │   └── modal/paywall.tsx
│   ├── components/                 # biblioteca compartilhada
│   │   ├── KazerMark.tsx           # logo (losango facetado + chevron)
│   │   ├── MissionTrace.tsx        # rail vertical (labels + railOnly)
│   │   ├── Composer.tsx  ModeSwitch.tsx  ModelPicker.tsx
│   │   ├── MessageBubble.tsx  Markdown.tsx  CitationChip.tsx
│   │   ├── SourceCard.tsx  SourcesSheet.tsx  HistoryDrawer.tsx
│   │   ├── ArtifactCard.tsx  ArtifactSheet.tsx  PaywallModal.tsx
│   │   └── Button.tsx  Input.tsx  Chip.tsx  Sheet.tsx  Skeleton.tsx
│   ├── constants/                  # tokens (OKLCH→hex) + mapa de ícones
│   ├── hooks/                      # useChat, useSkills, usePlan, useTheme…
│   ├── src/
│   │   ├── theme/                  # ThemeProvider + barrel
│   │   ├── services/               # camada de adapters + efeitos nativos
│   │   └── store/  utils/
│   ├── app.json · eas.json · babel.config.js · metro.config.js
│   └── global.css · tailwind.config.js
│
├── kazer-core/src/
│   ├── tokens/    # OKLCH, tipografia, espaçamento, motion
│   ├── types/     # Conversation, Message, Source, Artifact, Skill, Plan…
│   ├── mocks/     # dados de demonstração pt-BR
│   ├── adapters/  # types.ts (interfaces) + mock.ts (implementações)
│   └── utils/     # groupConversations, formatação
│
└── skills/
    ├── kazer-design-system/        # SKILL.md + references/
    ├── kazer-research/  kazer-docs/  kazer-code/
    └── kazer-growth/    kazer-security/
```

---

## Design system

A identidade vive em **`skills/kazer-design-system/`** e é consumida por
todos os pacotes:

| Arquivo | Conteúdo |
|---|---|
| `SKILL.md` | Princípios, regra de acento, motion, acessibilidade |
| `references/tokens.md` | Cores OKLCH, tipografia, espaçamento, raios, z-index, breakpoints |
| `references/components.md` | Regras de cada componente + microinterações |
| `references/screens.md` | Inventário de telas com wireframes ASCII |

**Identidade:** fundo azul-violeta muito escuro, superfícies em camadas,
bordas sutis, acento **dourado metálico** (marca), **violeta** (raciocínio /
agente) e **ciano** (ação ao vivo). Tipografia Geist para UI e JetBrains
Mono / Geist Mono para código. Tema escuro por padrão, claro disponível.

**Elemento-assinatura:** a **Missão Trace** — rail vertical que acende passo a
passo. Tudo ao redor dela permanece quieto e disciplinado.

---

## Agent Skills

Cada Skill é um agente com propósito e permissões declaradas, no formato
`SKILL.md` com frontmatter YAML:

```yaml
---
name: kazer-research
description: Use quando o usuário pedir pesquisa, comparação, dossiê…
version: 1.2.0
tags: [pesquisa, fontes, dossiê, citação]
permissions: [web.read, net.fetch]
---
```

| Skill | Propósito | Permissões |
|---|---|---|
| `kazer-research` | Pesquisa profunda com dossiê e citações | `web.read`, `net.fetch` |
| `kazer-docs` | Documentos, propostas e relatórios | `files.write`, `web.read` |
| `kazer-code` | Análise, refatoração e documentação de código | `code.run`, `files.write`, `shell.exec` |
| `kazer-growth` | Produto, monetização e lançamento | `web.read`, `files.write` |
| `kazer-security` | Triagem técnica autorizada | `shell.exec`, `code.run`, `net.fetch` |

Cada pasta tem `SKILL.md`, `scripts/` e `references/`. A pasta
`kazer-design-system` é o design system do produto e também segue o mesmo
formato, para que agentes futuros reutilizem a mesma identidade.

---

## Planos e paywall

| | Free | Pro | **KAZER MAX** |
|---|---|---|---|
| Preço | R$ 0 | R$ 29,90 | **R$ 59,99/mês** |
| Chat com IA | ✓ | ✓ | ✓ |
| Pesquisa com citações | básica | avançada | avançada |
| Fontes por resposta | 5 | 22 | 60 |
| Skills ativas | 1 | 5 | ilimitadas |
| Execução de tarefas | — | — | ✓ |
| Agentes autônomos | — | — | ✓ |
| Criação de artefatos | — | — | ✓ |
| Execução em segundo plano | — | — | ✓ |
| Fila | padrão | normal | **prioritária** |

O paywall é um modal dark premium com anel metálico — **nunca um erro
genérico**. Ao tentar executar uma tarefa fora do MAX, aparece:

> Execução de tarefas está disponível no KAZER MAX — R$ 59,99/mês

A validação de plano acontece no backend (`subscriptions` + `usage_logs`).
O front-end apenas reflete o estado — nunca autoriza por si só.

---

## Estado atual — o que é real e o que é mock

Esta entrega é o **front-end completo e navegável**. Backend, autenticação,
pagamentos e chamadas de IA reais estão fora do escopo desta etapa.

| Camada | Status |
|---|---|
| Design system, tokens, identidade | ✅ real, aplicado em web e mobile |
| Layouts, telas, componentes, animações | ✅ real |
| Chat com streaming | ✅ funcional via adapter mock (simula latência e tokens) |
| Research, Skills, artefatos, paywall | ✅ funcionais via adapter mock |
| Rotas de API, Server Actions | ⏳ Prepared — a interface dos adapters está pronta |
| Supabase (Auth, RLS, Storage, Realtime) | ⏳ schema preparado, não conectado |
| Stripe / RevenueCat | ⏳ UI pronta, integração pendente |
| Chamadas reais de IA e busca | ⏳ pendente — via `kazer-core/src/adapters/` |
| Terminal real do Brain | ⏳ contrato compartilhado preparado; autenticação e sandbox ainda não conectadas |

**Todos os dados visíveis são de demonstração** e estão marcados como tal na
interface. Conversas, fontes, artefatos, usuários e métricas são fictícios.

Para ligar o backend, implemente as interfaces de
`kazer-core/src/adapters/types.ts` e registre a implementação real no lugar
dos mocks — nenhum componente de UI precisa mudar.

### Terminal do KAZER Brain — estado e fronteiras

O contrato tipado de execução fica em `kazer-core/src/types/index.ts`. Ele
transporta estado, conversa/missão, comando, diretório de trabalho, `stdout`,
`stderr`, código de saída, tempos e capacidade de cancelamento, sem segredos.
O painel Execução só conta e apresenta registros identificados como
`terminal.exec`; as ferramentas demonstrativas do chat não são apresentadas
como processos reais. Web e mobile compartilham o mesmo formato.

**A execução permanece desativada.** Este repositório não tem autenticação de
servidor, chamadas reais de IA nem um sandbox conectado. Não existe endpoint
que execute comandos. Não habilite execução de processos dentro do servidor
Next.js. Antes de ativar a ferramenta, integre uma sessão validável no servidor,
resolva as permissões da Skill no backend e conecte um executor isolado com
limites de duração/saída, isolamento por workspace, cancelamento e limpeza.
O Brain só deve registrar sucesso após receber a confirmação do executor. A
interface mostra explicitamente quando essa configuração está ausente.

Nenhuma chave do provedor deve ser enviada ao navegador ou ao modelo. Operações
privilegiadas, rede externa e publicação/implantação exigem política própria e
não são autorizadas pela permissão `shell.exec` por si só.

---

## Build e deploy

### Web (Vercel)

```bash
cd kazer-web
vercel --prod
```

Configure as variáveis de ambiente no painel da Vercel. O `next.config.ts`
já está preparado para deploy. Antes de publicar, configure o
`metadataBase` em `src/app/layout.tsx` com o domínio real.

### Mobile (EAS Build)

```bash
cd kazer-mobile
npm install -g eas-cli
eas login
eas build:configure

# Preview (iOS + Android)
eas build --profile preview --platform all

# Produção
eas build --profile production --platform all
```

O `app.json` já tem scheme `kazer`, deep link, permissões de push e
configuração de splash. Troque `extra.eas.projectId` pelo ID real do seu
projeto EAS.

### GitHub

O repositório local já está inicializado e com o commit inicial pronto. Para
publicar na sua conta:

```bash
cd KAZER

# 1. Crie o repositório vazio (sem README) em github.com/new — nome: KAZER
# 2. Conecte e publique
git remote add origin git@github.com:SEU_USUARIO/KAZER.git
git branch -M main
git push -u origin main
```

Ou pela CLI do GitHub, autenticada por navegador (recomendado — evita
colocar token no histórico do shell):

```bash
cd KAZER
gh auth login
gh repo create KAZER --public --source=. --remote=origin --push
```

> **Sobre tokens:** se você usa um Personal Access Token, gere um
> **novo** com escopo mínimo (`repo` apenas, sem `delete_repo` nem escopo de
> organização) e use-o apenas como variável de ambiente temporária. Nunca
> cole um token em arquivo, commit ou issue. Se um token foi exposto em
> conversa, log ou log de shell, **revogue-o imediatamente** —
> github.com → Settings → Developer settings → Personal access tokens.

### Supabase

O schema com as 15 tabelas e Row Level Security está em
`kazer-core/supabase/schema.sql`. Aplique com:

```bash
supabase db push
# ou
psql "$DATABASE_URL" -f kazer-core/supabase/schema.sql
```

---

## Roadmap

- [ ] Implementações reais dos adapters (Supabase, Vercel AI SDK, Stripe, RevenueCat)
- [ ] Supabase Auth com sessão compartilhada web ↔ mobile
- [ ] Streaming real com Server Actions e `useChat` do Vercel AI SDK
- [ ] Realtime entre web e mobile (conversas, mensagens, execuções)
- [ ] Push quando tarefa longa terminar (Expo Notifications)
- [ ] Modo offline no mobile (leitura do histórico + fila de envio)
- [ ] Geração real de artefatos (PDF, DOCX, XLSX, PNG)
- [ ] Execução em segundo plano com fila prioritária
- [ ] Billing e webhooks reais (Stripe + RevenueCat)
- [ ] Testes end-to-end e acessibilidade auditada

---

## Licença

Uso interno / demonstração. Dados de demonstração são fictícios.

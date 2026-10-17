-- =============================================================================
-- KAZER — Supabase schema
-- PostgreSQL + Row Level Security. Cada usuário enxerga apenas os próprios
-- dados. Aplicar com: supabase db push  (ou psql "$DATABASE_URL" -f schema.sql)
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- -----------------------------------------------------------------------------
-- Enumerações
-- -----------------------------------------------------------------------------

create type public.plan_tier      as enum ('free', 'pro', 'max');
create type public.mode_t         as enum ('chat', 'research', 'mission');
create type public.message_role   as enum ('user', 'assistant', 'system');
create type public.source_state   as enum ('pending', 'running', 'done', 'error');
create type public.artifact_kind  as enum (
  'document', 'spreadsheet', 'code', 'landing', 'report', 'image',
  'pdf', 'docx', 'csv', 'xlsx'
);
create type public.sub_status     as enum ('active', 'trialing', 'past_due', 'canceled');
create type public.billing_provider as enum ('stripe', 'revenuecat', 'manual');
create type public.device_platform as enum ('web', 'ios', 'android');

-- -----------------------------------------------------------------------------
-- users — identidade de autenticação (espelho de auth.users)
-- -----------------------------------------------------------------------------

create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text        not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.users is
  'Espelho de auth.users. Não armazena senha — a autenticação é do Supabase Auth.';

-- -----------------------------------------------------------------------------
-- profiles — dados públicos e preferências
-- -----------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references public.users (id) on delete cascade,
  full_name     text        not null default '',
  avatar_url    text,
  locale        text        not null default 'pt-BR',
  theme         text        not null default 'dark',
  default_model text        not null default 'kazer-4',
  default_skill uuid,
  timezone      text        not null default 'America/Sao_Paulo',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- devices — sessões em web e mobile
-- -----------------------------------------------------------------------------

create table public.devices (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users (id) on delete cascade,
  platform     public.device_platform not null,
  name         text        not null default '',
  app_version  text,
  last_seen_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

create index devices_user_idx on public.devices (user_id);

-- -----------------------------------------------------------------------------
-- push_tokens — tokens para notificação push
-- -----------------------------------------------------------------------------

create table public.push_tokens (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users (id) on delete cascade,
  token      text        not null unique,
  platform   public.device_platform not null,
  created_at timestamptz not null default now()
);

create index push_tokens_user_idx on public.push_tokens (user_id);

-- -----------------------------------------------------------------------------
-- workspaces — espaços de trabalho (pessoal ou compartilhado)
-- -----------------------------------------------------------------------------

create table public.workspaces (
  id          uuid primary key default uuid_generate_v4(),
  name        text        not null,
  owner_id    uuid not null references public.users (id) on delete cascade,
  description text        not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index workspaces_owner_idx on public.workspaces (owner_id);

-- -----------------------------------------------------------------------------
-- skills — Agent Skills disponíveis
-- -----------------------------------------------------------------------------

create table public.skills (
  id          uuid primary key default uuid_generate_v4(),
  slug        text        not null unique,
  name        text        not null,
  description text        not null,
  version     text        not null default '1.0.0',
  tags        text[]      not null default '{}',
  body_path   text        not null,
  permissions text[]      not null default '{}',
  icon        text        not null default 'compass',
  accent      text        not null default 'gold',
  is_public   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- conversations
-- -----------------------------------------------------------------------------

create table public.conversations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users (id) on delete cascade,
  workspace_id  uuid references public.workspaces (id) on delete set null,
  title         text        not null default 'Nova missão',
  mode          public.mode_t not null default 'chat',
  model         text        not null default 'kazer-4',
  skill_id      uuid references public.skills (id) on delete set null,
  pinned        boolean     not null default false,
  archived      boolean     not null default false,
  preview       text        not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index conversations_user_idx  on public.conversations (user_id, updated_at desc);
create index conversations_pinned_idx on public.conversations (user_id, pinned desc);

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------

create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  role            public.message_role not null,
  content         text        not null default '',
  reasoning       text,
  mode            public.mode_t not null default 'chat',
  model           text,
  follow_ups      text[]      not null default '{}',
  interrupted     boolean     not null default false,
  created_at      timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- -----------------------------------------------------------------------------
-- sources — documentos consultados
-- -----------------------------------------------------------------------------

create table public.sources (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  idx             integer     not null,
  title           text        not null,
  domain          text        not null,
  url             text        not null,
  favicon         text        not null default '',
  snippet         text        not null default '',
  published_at    date,
  saved           boolean     not null default false,
  read_count      integer     not null default 0,
  relevance       numeric(4, 3) not null default 0,
  created_at      timestamptz not null default now(),
  unique (conversation_id, idx)
);

create index sources_conversation_idx on public.sources (conversation_id, idx);
create index sources_user_idx        on public.sources (user_id, saved);

-- -----------------------------------------------------------------------------
-- citations — ligação entre afirmação e fonte
-- -----------------------------------------------------------------------------

create table public.citations (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid not null references public.messages (id) on delete cascade,
  source_id       uuid not null references public.sources (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  idx             integer     not null,
  quote           text,
  created_at      timestamptz not null default now(),
  unique (message_id, idx)
);

create index citations_message_idx on public.citations (message_id);

-- -----------------------------------------------------------------------------
-- artifacts — entregas geradas
-- -----------------------------------------------------------------------------

create table public.artifacts (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations (id) on delete set null,
  user_id         uuid not null references public.users (id) on delete cascade,
  skill_id        uuid references public.skills (id) on delete set null,
  name            text        not null,
  type            public.artifact_kind not null,
  version         integer     not null default 1,
  size_bytes      bigint      not null default 0,
  mime_type       text        not null default 'application/octet-stream',
  storage_path    text,
  preview         text        not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index artifacts_user_idx on public.artifacts (user_id, updated_at desc);

-- -----------------------------------------------------------------------------
-- artifact_versions — histórico de versões
-- -----------------------------------------------------------------------------

create table public.artifact_versions (
  id          uuid primary key default uuid_generate_v4(),
  artifact_id uuid not null references public.artifacts (id) on delete cascade,
  user_id     uuid not null references public.users (id) on delete cascade,
  version     integer     not null,
  size_bytes  bigint      not null default 0,
  storage_path text,
  note        text        not null default '',
  created_at  timestamptz not null default now(),
  unique (artifact_id, version)
);

create index artifact_versions_artifact_idx on public.artifact_versions (artifact_id, version desc);

-- -----------------------------------------------------------------------------
-- tool_runs — execuções de ferramentas
-- -----------------------------------------------------------------------------

create table public.tool_runs (
  id              uuid primary key default uuid_generate_v4(),
  message_id      uuid references public.messages (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  name            text        not null,
  label           text        not null,
  status          public.source_state not null default 'pending',
  duration_ms     integer,
  output          text,
  detail          text,
  created_at      timestamptz not null default now()
);

create index tool_runs_conversation_idx on public.tool_runs (conversation_id, created_at);

-- -----------------------------------------------------------------------------
-- usage_logs — consumo por plano
-- -----------------------------------------------------------------------------

create table public.usage_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.users (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  kind            text        not null,
  units           integer     not null default 1,
  day             date        not null default current_date,
  plan            public.plan_tier not null default 'free',
  created_at      timestamptz not null default now()
);

create index usage_logs_user_day_idx on public.usage_logs (user_id, day, kind);

-- -----------------------------------------------------------------------------
-- subscriptions
-- -----------------------------------------------------------------------------

create table public.subscriptions (
  user_id             uuid primary key references public.users (id) on delete cascade,
  plan                public.plan_tier not null default 'free',
  status              public.sub_status not null default 'active',
  current_period_end  timestamptz not null,
  provider            public.billing_provider not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Trigger: manter updated_at
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create trigger artifacts_set_updated_at
  before update on public.artifacts
  for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: criar profile + subscription ao cadastrar
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;

  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status, current_period_end)
  values (new.id, 'free', 'active', now() + interval '30 days')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security
-- Cada tabela é isolada por owner. Nenhuma consulta de outro usuário retorna
-- nada, nem por erro de aplicação.
-- =============================================================================

alter table public.users              enable row level security;
alter table public.profiles          enable row level security;
alter table public.devices            enable row level security;
alter table public.push_tokens        enable row level security;
alter table public.workspaces         enable row level security;
alter table public.skills             enable row level security;
alter table public.conversations      enable row level security;
alter table public.messages           enable row level security;
alter table public.sources            enable row level security;
alter table public.citations          enable row level security;
alter table public.artifacts          enable row level security;
alter table public.artifact_versions  enable row level security;
alter table public.tool_runs          enable row level security;
alter table public.usage_logs         enable row level security;
alter table public.subscriptions      enable row level security;

-- --- users -------------------------------------------------------------------

create policy "users_select_own" on public.users
  for select using (id = auth.uid());

create policy "users_update_own" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- --- profiles ----------------------------------------------------------------

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- --- devices -----------------------------------------------------------------

create policy "devices_select_own" on public.devices
  for select using (user_id = auth.uid());

create policy "devices_insert_own" on public.devices
  for insert with check (user_id = auth.uid());

create policy "devices_update_own" on public.devices
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "devices_delete_own" on public.devices
  for delete using (user_id = auth.uid());

-- --- push_tokens -------------------------------------------------------------

create policy "push_tokens_select_own" on public.push_tokens
  for select using (user_id = auth.uid());

create policy "push_tokens_insert_own" on public.push_tokens
  for insert with check (user_id = auth.uid());

create policy "push_tokens_delete_own" on public.push_tokens
  for delete using (user_id = auth.uid());

-- --- workspaces --------------------------------------------------------------

create policy "workspaces_select_own" on public.workspaces
  for select using (owner_id = auth.uid());

create policy "workspaces_insert_own" on public.workspaces
  for insert with check (owner_id = auth.uid());

create policy "workspaces_update_own" on public.workspaces
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "workspaces_delete_own" on public.workspaces
  for delete using (owner_id = auth.uid());

-- --- skills (globais, leitura pública; escrita restrita a admin) --------------

create policy "skills_select_all" on public.skills
  for select using (true);

-- --- conversations -----------------------------------------------------------

create policy "conversations_select_own" on public.conversations
  for select using (user_id = auth.uid());

create policy "conversations_insert_own" on public.conversations
  for insert with check (user_id = auth.uid());

create policy "conversations_update_own" on public.conversations
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "conversations_delete_own" on public.conversations
  for delete using (user_id = auth.uid());

-- --- messages ----------------------------------------------------------------

create policy "messages_select_own" on public.messages
  for select using (user_id = auth.uid());

create policy "messages_insert_own" on public.messages
  for insert with check (user_id = auth.uid());

create policy "messages_update_own" on public.messages
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "messages_delete_own" on public.messages
  for delete using (user_id = auth.uid());

-- --- sources -----------------------------------------------------------------

create policy "sources_select_own" on public.sources
  for select using (user_id = auth.uid());

create policy "sources_insert_own" on public.sources
  for insert with check (user_id = auth.uid());

create policy "sources_update_own" on public.sources
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "sources_delete_own" on public.sources
  for delete using (user_id = auth.uid());

-- --- citations ---------------------------------------------------------------

create policy "citations_select_own" on public.citations
  for select using (user_id = auth.uid());

create policy "citations_insert_own" on public.citations
  for insert with check (user_id = auth.uid());

create policy "citations_delete_own" on public.citations
  for delete using (user_id = auth.uid());

-- --- artifacts ---------------------------------------------------------------

create policy "artifacts_select_own" on public.artifacts
  for select using (user_id = auth.uid());

create policy "artifacts_insert_own" on public.artifacts
  for insert with check (user_id = auth.uid());

create policy "artifacts_update_own" on public.artifacts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "artifacts_delete_own" on public.artifacts
  for delete using (user_id = auth.uid());

-- --- artifact_versions -------------------------------------------------------

create policy "artifact_versions_select_own" on public.artifact_versions
  for select using (user_id = auth.uid());

create policy "artifact_versions_insert_own" on public.artifact_versions
  for insert with check (user_id = auth.uid());

create policy "artifact_versions_delete_own" on public.artifact_versions
  for delete using (user_id = auth.uid());

-- --- tool_runs ---------------------------------------------------------------

create policy "tool_runs_select_own" on public.tool_runs
  for select using (user_id = auth.uid());

create policy "tool_runs_insert_own" on public.tool_runs
  for insert with check (user_id = auth.uid());

create policy "tool_runs_update_own" on public.tool_runs
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tool_runs_delete_own" on public.tool_runs
  for delete using (user_id = auth.uid());

-- --- usage_logs --------------------------------------------------------------

create policy "usage_logs_select_own" on public.usage_logs
  for select using (user_id = auth.uid());

create policy "usage_logs_insert_own" on public.usage_logs
  for insert with check (user_id = auth.uid());

-- --- subscriptions -----------------------------------------------------------

create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = auth.uid());

create policy "subscriptions_update_own" on public.subscriptions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =============================================================================
-- Storage — bucket privado de artefatos
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('artifacts', 'artifacts', false)
on conflict (id) do nothing;

create policy "artifacts_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "artifacts_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "artifacts_storage_update_own" on storage.objects
  for update using (
    bucket_id = 'artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "artifacts_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'artifacts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- Realtime — sincronização entre web e mobile
-- =============================================================================

alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.tool_runs;
alter publication supabase_realtime add table public.artifacts;

-- =============================================================================
-- Limites por plano — função de consulta usada pelo backend
-- =============================================================================

create or replace function public.plan_limits(p public.plan_tier)
returns table (
  daily_messages    integer,
  daily_research    integer,
  active_skills     integer,
  max_sources       integer,
  parallel_searches integer,
  long_tasks        boolean,
  artifacts         boolean,
  agent_mode        boolean,
  background        boolean,
  history_days      integer,
  storage_mb        integer
)
language sql
immutable
as $$
  select
    case p
      when 'free' then 40    when 'pro' then 500   else 5000
    end,
    case p
      when 'free' then 10    when 'pro' then 120   else 1000
    end,
    case p
      when 'free' then 1     when 'pro' then 5     else 999
    end,
    case p
      when 'free' then 5     when 'pro' then 22    else 60
    end,
    case p
      when 'free' then 2     when 'pro' then 6     else 12
    end,
    case p when 'free' then false when 'pro' then false else true end,
    case p when 'free' then false when 'pro' then false else true end,
    case p when 'free' then false when 'pro' then false else true end,
    case p when 'free' then false when 'pro' then false else true end,
    case p when 'free' then 30   when 'pro' then 365  else 3650
    end,
    case p when 'free' then 100  when 'pro' then 2048 else 51200
    end;
$$;

-- -----------------------------------------------------------------------------
-- Uso diário consolidado
-- -----------------------------------------------------------------------------

create or replace function public.usage_today(p_user uuid, p_kind text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(units), 0)::integer
  from public.usage_logs
  where user_id = p_user
    and day = current_date
    and kind = p_kind;
$$;

-- -----------------------------------------------------------------------------
-- Registro das skills iniciais
-- -----------------------------------------------------------------------------

insert into public.skills (slug, name, description, version, tags, body_path, permissions, icon, accent)
values
  ('kazer-research', 'KAZER Research',
   'Pesquisa profunda com dossiê, triangulação de fontes e citações verificáveis em cada afirmação.',
   '1.2.0', array['pesquisa','fontes','relatório'],
   '/skills/kazer-research/SKILL.md', array['web.read','net.fetch'], 'compass', 'gold'),

  ('kazer-docs', 'KAZER Docs',
   'Cria documentos, propostas e relatórios prontos para enviar, em Markdown, PDF ou DOCX.',
   '1.0.4', array['documento','relatório','proposta'],
   '/skills/kazer-docs/SKILL.md', array['files.write','web.read'], 'file', 'violet'),

  ('kazer-code', 'KAZER Code',
   'Analisa, refatora e documenta código, com testes propostos e plano de migração.',
   '2.1.0', array['código','refatoração','testes'],
   '/skills/kazer-code/SKILL.md', array['code.run','files.write','shell.exec'], 'code', 'cyan'),

  ('kazer-growth', 'KAZER Growth',
   'Estratégia de produto, monetização e lançamento, com experimentos e métricas de acompanhamento.',
   '1.3.1', array['produto','monetização','lançamento'],
   '/skills/kazer-growth/SKILL.md', array['web.read','files.write'], 'trending', 'gold'),

  ('kazer-security', 'KAZER Security',
   'Triagem técnica autorizada de apps, repositórios e vulnerabilidades, com severidade e correção.',
   '0.9.0', array['segurança','auditoria','cve'],
   '/skills/kazer-security/SKILL.md', array['shell.exec','code.run','net.fetch'], 'shield', 'violet')
on conflict (slug) do update
  set name       = excluded.name,
      description = excluded.description,
      version     = excluded.version,
      tags        = excluded.tags,
      body_path   = excluded.body_path,
      permissions = excluded.permissions,
      icon        = excluded.icon,
      accent      = excluded.accent;

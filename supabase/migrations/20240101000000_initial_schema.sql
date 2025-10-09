create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null check (type in ('chat', 'form', 'workflow', 'custom')),
  icon text,
  config_json jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  title text,
  session_state jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  last_active_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  agent_id uuid not null references public.agents (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  input_json jsonb,
  output_json jsonb,
  tokens_used integer,
  cost_estimate numeric(10, 4),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.sessions enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agents enable row level security;

create policy "Users can access their sessions" on public.sessions
  for select using (auth.uid() = user_id);

create policy "Users can modify their sessions" on public.sessions
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can access agents" on public.agents
  for select using (true);

create policy "Users can log agent runs" on public.agent_runs
  for insert with check (auth.uid() = user_id);

create policy "Users can read their agent runs" on public.agent_runs
  for select using (auth.uid() = user_id);

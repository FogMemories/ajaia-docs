-- Reproducible schema for the Ajaia Docs assignment.
-- The application uses the Supabase service key on the server. Do not expose it
-- in browser code or commit .env.local.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title varchar(120) not null default 'Untitled document',
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}',
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (document_id, user_id)
);

create index if not exists documents_owner_id_idx on public.documents(owner_id);
create index if not exists documents_updated_at_idx on public.documents(updated_at desc);
create index if not exists document_shares_user_id_idx on public.document_shares(user_id);

insert into public.users (id, name, email)
values
  ('6813471a-33b6-40ff-8ba6-f246f504edb4', 'Alex Owner', 'owner@ajaia.demo'),
  ('7f9c2f36-2f5a-4bd8-8a43-2cc0b0db2f11', 'Sam Reviewer', 'reviewer@ajaia.demo')
on conflict (id) do update
set name = excluded.name, email = excluded.email;

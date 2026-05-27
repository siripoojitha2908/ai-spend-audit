create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  email text not null,
  company_name text,
  role text,
  team_size integer,
  created_at timestamptz not null default now()
);

create index if not exists leads_audit_id_idx on public.leads (audit_id);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

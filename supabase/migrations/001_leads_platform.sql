create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  org_number text unique,
  name text not null,
  city text,
  municipality text,
  county text,
  industry_code text,
  industry_label text,
  phone text,
  email text,
  website_url text,
  website_found boolean default false,
  website_confidence text default 'unknown',
  source text default 'scb',
  raw_data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  status text default 'new',
  priority text default 'medium',
  score integer default 0,
  estimated_value integer,
  source text default 'scb',
  service_interest text,
  next_action text,
  notes text,
  assigned_to text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.website_audits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  website_url text,
  status_code integer,
  has_ssl boolean,
  has_title boolean,
  title text,
  has_meta_description boolean,
  meta_description text,
  has_robots_txt boolean,
  has_sitemap boolean,
  performance_score integer,
  seo_score integer,
  accessibility_score integer,
  best_practices_score integer,
  audit_summary text,
  raw_result jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null,
  message text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.scb_import_runs (
  id uuid primary key default gen_random_uuid(),
  status text default 'pending',
  filters jsonb default '{}'::jsonb,
  imported_count integer default 0,
  created_leads_count integer default 0,
  websites_found_count integer default 0,
  error_message text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create index if not exists companies_org_number_idx on public.companies(org_number);
create index if not exists leads_company_id_idx on public.leads(company_id);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_priority_idx on public.leads(priority);
create index if not exists website_audits_company_id_idx on public.website_audits(company_id);
create index if not exists lead_events_lead_id_idx on public.lead_events(lead_id);
create index if not exists scb_import_runs_started_at_idx on public.scb_import_runs(started_at);

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.leads enable row level security;
alter table public.website_audits enable row level security;
alter table public.lead_events enable row level security;
alter table public.scb_import_runs enable row level security;

grant select on public.companies to anon;
grant select on public.leads to anon;
grant select on public.website_audits to anon;
grant select on public.lead_events to anon;
grant select on public.scb_import_runs to anon;
grant update (status, priority, next_action, notes, updated_at) on public.leads to anon;

grant select, insert, update, delete on public.companies to service_role;
grant select, insert, update, delete on public.leads to service_role;
grant select, insert, update, delete on public.website_audits to service_role;
grant select, insert, update, delete on public.lead_events to service_role;
grant select, insert, update, delete on public.scb_import_runs to service_role;

-- Development/demo policies for the static admin panel.
-- Tighten these when Supabase Auth and admin roles are implemented.
drop policy if exists "Demo admin can read companies" on public.companies;
create policy "Demo admin can read companies"
on public.companies for select
to anon
using (true);

drop policy if exists "Demo admin can read leads" on public.leads;
create policy "Demo admin can read leads"
on public.leads for select
to anon
using (true);

drop policy if exists "Demo admin can update lead workflow fields" on public.leads;
create policy "Demo admin can update lead workflow fields"
on public.leads for update
to anon
using (true)
with check (true);

drop policy if exists "Demo admin can read website audits" on public.website_audits;
create policy "Demo admin can read website audits"
on public.website_audits for select
to anon
using (true);

drop policy if exists "Demo admin can read lead events" on public.lead_events;
create policy "Demo admin can read lead events"
on public.lead_events for select
to anon
using (true);

drop policy if exists "Demo admin can read import runs" on public.scb_import_runs;
create policy "Demo admin can read import runs"
on public.scb_import_runs for select
to anon
using (true);

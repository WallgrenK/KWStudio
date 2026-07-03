create table if not exists public.finance_vat_periods (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  period_type text not null default 'monthly',
  status text not null default 'draft',
  output_vat numeric not null default 0,
  input_vat numeric not null default 0,
  vat_to_pay numeric not null default 0,
  journal_entries integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_vat_periods
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists period_type text default 'monthly',
  add column if not exists status text default 'draft',
  add column if not exists output_vat numeric default 0,
  add column if not exists input_vat numeric default 0,
  add column if not exists vat_to_pay numeric default 0,
  add column if not exists journal_entries integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.finance_vat_lines (
  id uuid primary key default gen_random_uuid(),
  vat_period_id uuid not null references public.finance_vat_periods(id) on delete cascade,
  journal_entry_id uuid references public.finance_journal_entries(id) on delete set null,
  vat_rate numeric not null default 0,
  vat_type text not null default 'no_vat',
  net_amount numeric not null default 0,
  vat_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.finance_vat_lines
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists vat_period_id uuid,
  add column if not exists journal_entry_id uuid,
  add column if not exists vat_rate numeric default 0,
  add column if not exists vat_type text default 'no_vat',
  add column if not exists net_amount numeric default 0,
  add column if not exists vat_amount numeric default 0,
  add column if not exists created_at timestamptz default now();

create table if not exists public.finance_suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  default_category text,
  default_bas_account text,
  default_vat_rate numeric,
  country_code text,
  vat_treatment text,
  vat_number text,
  reverse_charge boolean not null default false,
  match_keywords text[] not null default '{}',
  last_transaction_description text,
  confirmed_matches integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_suppliers
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists name text,
  add column if not exists normalized_name text,
  add column if not exists default_category text,
  add column if not exists default_bas_account text,
  add column if not exists default_vat_rate numeric,
  add column if not exists country_code text,
  add column if not exists vat_treatment text,
  add column if not exists vat_number text,
  add column if not exists reverse_charge boolean default false,
  add column if not exists match_keywords text[] default '{}',
  add column if not exists last_transaction_description text,
  add column if not exists confirmed_matches integer default 0,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.finance_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  organisation_number text,
  accounting_plan text not null default 'BAS2014',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_settings
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists company_name text,
  add column if not exists organisation_number text,
  add column if not exists accounting_plan text default 'BAS2014',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if to_regclass('public.finance_vat_lines') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_lines_vat_period_id_fkey'
        and conrelid = 'public.finance_vat_lines'::regclass
    ) then
      alter table public.finance_vat_lines
        add constraint finance_vat_lines_vat_period_id_fkey
        foreign key (vat_period_id) references public.finance_vat_periods(id) on delete cascade;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_lines_journal_entry_id_fkey'
        and conrelid = 'public.finance_vat_lines'::regclass
    ) then
      alter table public.finance_vat_lines
        add constraint finance_vat_lines_journal_entry_id_fkey
        foreign key (journal_entry_id) references public.finance_journal_entries(id) on delete set null;
    end if;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.finance_vat_periods') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_periods_date_range_check'
        and conrelid = 'public.finance_vat_periods'::regclass
    ) then
      alter table public.finance_vat_periods
        add constraint finance_vat_periods_date_range_check
        check (period_end >= period_start);
    end if;
  end if;

  if to_regclass('public.finance_vat_lines') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_lines_vat_rate_non_negative'
        and conrelid = 'public.finance_vat_lines'::regclass
    ) then
      alter table public.finance_vat_lines
        add constraint finance_vat_lines_vat_rate_non_negative
        check (vat_rate >= 0);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_lines_net_amount_non_negative'
        and conrelid = 'public.finance_vat_lines'::regclass
    ) then
      alter table public.finance_vat_lines
        add constraint finance_vat_lines_net_amount_non_negative
        check (net_amount >= 0);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_lines_vat_amount_non_negative'
        and conrelid = 'public.finance_vat_lines'::regclass
    ) then
      alter table public.finance_vat_lines
        add constraint finance_vat_lines_vat_amount_non_negative
        check (vat_amount >= 0);
    end if;
  end if;

  if to_regclass('public.finance_suppliers') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_suppliers_confirmed_matches_non_negative'
        and conrelid = 'public.finance_suppliers'::regclass
    ) then
      alter table public.finance_suppliers
        add constraint finance_suppliers_confirmed_matches_non_negative
        check (confirmed_matches >= 0);
    end if;
  end if;
end
$$;

create unique index if not exists finance_vat_periods_unique_period_idx
on public.finance_vat_periods(period_start, period_end, period_type);

create index if not exists finance_vat_periods_period_start_idx
on public.finance_vat_periods(period_start desc);

create index if not exists finance_vat_periods_status_idx
on public.finance_vat_periods(status);

create index if not exists finance_vat_lines_vat_period_id_idx
on public.finance_vat_lines(vat_period_id);

create index if not exists finance_vat_lines_journal_entry_id_idx
on public.finance_vat_lines(journal_entry_id);

create index if not exists finance_vat_lines_vat_type_idx
on public.finance_vat_lines(vat_type);

create unique index if not exists finance_suppliers_normalized_name_uidx
on public.finance_suppliers(normalized_name);

create index if not exists finance_suppliers_is_active_idx
on public.finance_suppliers(is_active);

create index if not exists finance_suppliers_confirmed_matches_idx
on public.finance_suppliers(confirmed_matches desc);

create index if not exists finance_suppliers_match_keywords_gin_idx
on public.finance_suppliers using gin(match_keywords);

drop trigger if exists finance_vat_periods_set_updated_at on public.finance_vat_periods;
create trigger finance_vat_periods_set_updated_at
before update on public.finance_vat_periods
for each row execute function public.set_updated_at();

drop trigger if exists finance_suppliers_set_updated_at on public.finance_suppliers;
create trigger finance_suppliers_set_updated_at
before update on public.finance_suppliers
for each row execute function public.set_updated_at();

drop trigger if exists finance_settings_set_updated_at on public.finance_settings;
create trigger finance_settings_set_updated_at
before update on public.finance_settings
for each row execute function public.set_updated_at();

alter table public.finance_vat_periods enable row level security;
alter table public.finance_vat_lines enable row level security;
alter table public.finance_suppliers enable row level security;
alter table public.finance_settings enable row level security;

grant select on public.finance_vat_periods to anon;
grant select on public.finance_vat_lines to anon;
grant select on public.finance_suppliers to anon;
grant select on public.finance_settings to anon;

grant select, insert, update, delete on public.finance_vat_periods to service_role;
grant select, insert, update, delete on public.finance_vat_lines to service_role;
grant select, insert, update, delete on public.finance_suppliers to service_role;
grant select, insert, update, delete on public.finance_settings to service_role;

-- Development/demo policies for the KWStudio admin panel.
-- TODO: replace these with authenticated admin-only policies before production.
drop policy if exists "Demo admin can read finance vat periods" on public.finance_vat_periods;
create policy "Demo admin can read finance vat periods"
on public.finance_vat_periods for select
to anon
using (true);

drop policy if exists "Demo admin can read finance vat lines" on public.finance_vat_lines;
create policy "Demo admin can read finance vat lines"
on public.finance_vat_lines for select
to anon
using (true);

drop policy if exists "Demo admin can read finance suppliers" on public.finance_suppliers;
create policy "Demo admin can read finance suppliers"
on public.finance_suppliers for select
to anon
using (true);

drop policy if exists "Demo admin can read finance settings" on public.finance_settings;
create policy "Demo admin can read finance settings"
on public.finance_settings for select
to anon
using (true);

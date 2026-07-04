create table if not exists public.finance_tax_settings (
  id uuid primary key default gen_random_uuid(),
  business_type text not null default 'enskild_firma',
  tax_year integer,
  municipality_code text,
  municipal_tax_rate numeric,
  church_tax_enabled boolean not null default false,
  church_tax_rate numeric not null default 0,
  egenavgifter_rate numeric,
  state_tax_enabled boolean not null default false,
  state_tax_rate numeric not null default 0.20,
  state_tax_threshold numeric,
  expected_additional_income numeric not null default 0,
  manual_tax_adjustments jsonb not null default '[]'::jsonb,
  tax_reserve_account text default '1931',
  operating_bank_account text default '1930',
  forecast_default_mode text not null default 'ytd_linear',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_tax_settings
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists business_type text default 'enskild_firma',
  add column if not exists tax_year integer,
  add column if not exists municipality_code text,
  add column if not exists municipal_tax_rate numeric,
  add column if not exists church_tax_enabled boolean default false,
  add column if not exists church_tax_rate numeric default 0,
  add column if not exists egenavgifter_rate numeric,
  add column if not exists state_tax_enabled boolean default false,
  add column if not exists state_tax_rate numeric default 0.20,
  add column if not exists state_tax_threshold numeric,
  add column if not exists expected_additional_income numeric default 0,
  add column if not exists manual_tax_adjustments jsonb default '[]'::jsonb,
  add column if not exists tax_reserve_account text default '1931',
  add column if not exists operating_bank_account text default '1930',
  add column if not exists forecast_default_mode text default 'ytd_linear',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if to_regclass('public.finance_tax_settings') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_tax_settings_business_type_check'
        and conrelid = 'public.finance_tax_settings'::regclass
    ) then
      alter table public.finance_tax_settings
        add constraint finance_tax_settings_business_type_check
        check (business_type in ('enskild_firma', 'aktiebolag'));
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_tax_settings_forecast_default_mode_check'
        and conrelid = 'public.finance_tax_settings'::regclass
    ) then
      alter table public.finance_tax_settings
        add constraint finance_tax_settings_forecast_default_mode_check
        check (forecast_default_mode in ('ytd_only', 'ytd_linear', 'manual', 'scenario'));
    end if;
  end if;
end $$;

drop trigger if exists finance_tax_settings_set_updated_at on public.finance_tax_settings;
create trigger finance_tax_settings_set_updated_at
before update on public.finance_tax_settings
for each row execute function public.set_updated_at();

alter table public.finance_tax_settings enable row level security;

grant select on public.finance_tax_settings to anon;
grant select, insert, update, delete on public.finance_tax_settings to service_role;

drop policy if exists "Demo admin can read finance tax settings" on public.finance_tax_settings;
create policy "Demo admin can read finance tax settings"
on public.finance_tax_settings for select
to anon
using (true);

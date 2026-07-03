alter table public.finance_vat_periods
  add column if not exists calculation_hash text,
  add column if not exists declaration_snapshot jsonb,
  add column if not exists lifecycle_history jsonb not null default '[]'::jsonb,
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by text,
  add column if not exists unlocked_at timestamptz,
  add column if not exists unlocked_by text,
  add column if not exists unlock_reason text,
  add column if not exists submitted_at timestamptz,
  add column if not exists submitted_by text,
  add column if not exists submission_metadata jsonb,
  add column if not exists closed_at timestamptz,
  add column if not exists closed_by text;

do $$
begin
  if to_regclass('public.finance_vat_periods') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_periods_status_lifecycle_check'
        and conrelid = 'public.finance_vat_periods'::regclass
    ) then
      alter table public.finance_vat_periods
        add constraint finance_vat_periods_status_lifecycle_check
        check (status in ('draft', 'review', 'ready', 'open', 'locked', 'submitted', 'closed'));
    end if;
  end if;
end
$$;

create index if not exists finance_vat_periods_locked_at_idx
on public.finance_vat_periods(locked_at desc nulls last);

create index if not exists finance_vat_periods_submitted_at_idx
on public.finance_vat_periods(submitted_at desc nulls last);

create index if not exists finance_vat_periods_closed_at_idx
on public.finance_vat_periods(closed_at desc nulls last);

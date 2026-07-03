-- Migration 012: Replace legacy VAT period status check with lifecycle statuses
--
-- Production may still have finance_vat_periods_status_check from early schema
-- (draft/review/ready only). That blocks close/submit/locked transitions even when
-- finance_vat_periods_status_lifecycle_check allows them.

alter table public.finance_vat_periods
  drop constraint if exists finance_vat_periods_status_check;

do $$
begin
  if to_regclass('public.finance_vat_periods') is not null then
    if exists (
      select 1
      from pg_constraint
      where conname = 'finance_vat_periods_status_lifecycle_check'
        and conrelid = 'public.finance_vat_periods'::regclass
    ) then
      alter table public.finance_vat_periods
        drop constraint finance_vat_periods_status_lifecycle_check;
    end if;

    alter table public.finance_vat_periods
      add constraint finance_vat_periods_status_lifecycle_check
      check (status in ('draft', 'review', 'ready', 'open', 'locked', 'submitted', 'closed'));
  end if;
end
$$;

alter table public.finance_transactions
  add column if not exists vat_treatment text,
  add column if not exists reverse_charge boolean not null default false,
  add column if not exists bookkeeping_status text;

alter table public.finance_receipts
  add column if not exists vat_rate numeric,
  add column if not exists vat_treatment text,
  add column if not exists reverse_charge boolean not null default false,
  add column if not exists vat_number text,
  add column if not exists journal_entry_id uuid;

do $$
begin
  if to_regclass('public.finance_receipts') is not null and to_regclass('public.finance_journal_entries') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_receipts_journal_entry_id_fkey'
        and conrelid = 'public.finance_receipts'::regclass
    ) then
      alter table public.finance_receipts
        add constraint finance_receipts_journal_entry_id_fkey
        foreign key (journal_entry_id) references public.finance_journal_entries(id) on delete set null;
    end if;
  end if;
end
$$;

create index if not exists finance_transactions_bookkeeping_status_idx
on public.finance_transactions(bookkeeping_status);

create index if not exists finance_transactions_vat_treatment_idx
on public.finance_transactions(vat_treatment);

create index if not exists finance_transactions_reverse_charge_idx
on public.finance_transactions(reverse_charge);

create index if not exists finance_receipts_journal_entry_id_idx
on public.finance_receipts(journal_entry_id);

create index if not exists finance_receipts_vat_treatment_idx
on public.finance_receipts(vat_treatment);

create index if not exists finance_receipts_reverse_charge_idx
on public.finance_receipts(reverse_charge);

-- Preserve existing data assumptions:
-- - All added columns are nullable or default-safe.
-- - No existing columns, tables, data, or policies are removed.
-- TODO: when production access model is finalized, review whether anon access
-- should continue for these VAT and journal-link metadata fields.

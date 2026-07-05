-- Production integrity constraints: journal balancing, verification uniqueness,
-- account FK validation, document immutability, VAT lock integrity.

-- ---------------------------------------------------------------------------
-- Unique verification numbers (non-null)
-- ---------------------------------------------------------------------------
create unique index if not exists finance_journal_entries_verification_number_uidx
  on public.finance_journal_entries (verification_number)
  where verification_number is not null and trim(verification_number) <> '';

-- ---------------------------------------------------------------------------
-- Journal lines must reference known BAS accounts
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.finance_journal_lines') is not null
     and to_regclass('public.finance_accounts') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_journal_lines_account_fkey'
        and conrelid = 'public.finance_journal_lines'::regclass
    ) then
      alter table public.finance_journal_lines
        add constraint finance_journal_lines_account_fkey
        foreign key (account) references public.finance_accounts(account)
        not valid;
    end if;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Posted journal entries must balance (debit = credit)
-- ---------------------------------------------------------------------------
create or replace function public.guard_finance_journal_entry_balanced()
returns trigger
language plpgsql
as $$
declare
  total_debit numeric;
  total_credit numeric;
begin
  if new.status = 'posted' and (tg_op = 'INSERT' or old.status is distinct from 'posted') then
    select coalesce(sum(debit), 0), coalesce(sum(credit), 0)
    into total_debit, total_credit
    from public.finance_journal_lines
    where journal_entry_id = new.id;

    if total_debit <> total_credit then
      raise exception 'Journal entry must balance before posting. Debit % does not equal credit %.', total_debit, total_credit;
    end if;

    if total_debit = 0 then
      raise exception 'Journal entry must have lines before posting.';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists finance_journal_entries_balance_guard on public.finance_journal_entries;
create trigger finance_journal_entries_balance_guard
before insert or update on public.finance_journal_entries
for each row execute function public.guard_finance_journal_entry_balanced();

-- ---------------------------------------------------------------------------
-- Document versions immutable after publish
-- ---------------------------------------------------------------------------
create or replace function public.guard_document_version_published_immutable()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.status = 'published' then
    raise exception 'Published document versions are immutable.';
  end if;

  if tg_op = 'DELETE' and old.status = 'published' then
    raise exception 'Published document versions are immutable.';
  end if;

  return coalesce(new, old);
end
$$;

drop trigger if exists document_versions_published_immutable_guard on public.document_versions;
create trigger document_versions_published_immutable_guard
before update or delete on public.document_versions
for each row execute function public.guard_document_version_published_immutable();

-- ---------------------------------------------------------------------------
-- Document blocks immutable when parent version is published
-- ---------------------------------------------------------------------------
create or replace function public.guard_document_blocks_published_immutable()
returns trigger
language plpgsql
as $$
declare
  version_status text;
  target_version_id uuid;
begin
  target_version_id := coalesce(new.version_id, old.version_id);

  select status into version_status
  from public.document_versions
  where id = target_version_id;

  if version_status = 'published' then
    raise exception 'Document blocks cannot be changed for published versions.';
  end if;

  return coalesce(new, old);
end
$$;

drop trigger if exists document_blocks_published_immutable_guard on public.document_blocks;
create trigger document_blocks_published_immutable_guard
before insert or update or delete on public.document_blocks
for each row execute function public.guard_document_blocks_published_immutable();

-- ---------------------------------------------------------------------------
-- Signed documents: lock core content fields
-- ---------------------------------------------------------------------------
create or replace function public.guard_documents_signed_immutable()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'signed' and (
    new.title is distinct from old.title
    or new.client_id is distinct from old.client_id
    or new.project_id is distinct from old.project_id
    or new.document_type_id is distinct from old.document_type_id
    or new.active_version_id is distinct from old.active_version_id
  ) then
    raise exception 'Signed documents cannot change core content fields.';
  end if;

  return new;
end
$$;

drop trigger if exists documents_signed_immutable_guard on public.documents;
create trigger documents_signed_immutable_guard
before update on public.documents
for each row execute function public.guard_documents_signed_immutable();

-- ---------------------------------------------------------------------------
-- VAT lock integrity: locked/submitted/closed periods are read-only
-- ---------------------------------------------------------------------------
create or replace function public.guard_finance_vat_period_locked()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('locked', 'submitted', 'closed') and (
    new.status is distinct from old.status
    or new.period_start is distinct from old.period_start
    or new.period_end is distinct from old.period_end
    or new.period_type is distinct from old.period_type
    or new.calculation_hash is distinct from old.calculation_hash
    or new.declaration_snapshot is distinct from old.declaration_snapshot
  ) then
  -- Allow unlock workflow metadata only when transitioning back to open/review
    if not (old.status = 'locked' and new.status in ('open', 'review', 'draft')) then
      raise exception 'Locked VAT periods cannot be modified.';
    end if;
  end if;

  return new;
end
$$;

drop trigger if exists finance_vat_periods_locked_guard on public.finance_vat_periods;
create trigger finance_vat_periods_locked_guard
before update on public.finance_vat_periods
for each row execute function public.guard_finance_vat_period_locked();

create or replace function public.guard_finance_vat_lines_locked_period()
returns trigger
language plpgsql
as $$
declare
  period_status text;
  target_period_id uuid;
begin
  target_period_id := coalesce(new.vat_period_id, old.vat_period_id);

  select status into period_status
  from public.finance_vat_periods
  where id = target_period_id;

  if period_status in ('locked', 'submitted', 'closed') then
    raise exception 'VAT lines cannot be changed for locked periods.';
  end if;

  return coalesce(new, old);
end
$$;

drop trigger if exists finance_vat_lines_locked_period_guard on public.finance_vat_lines;
create trigger finance_vat_lines_locked_period_guard
before insert or update or delete on public.finance_vat_lines
for each row execute function public.guard_finance_vat_lines_locked_period();

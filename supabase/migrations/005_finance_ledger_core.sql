create table if not exists public.finance_accounts (
  account text primary key,
  name text not null,
  account_type text not null,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_accounts
  add column if not exists account text,
  add column if not exists name text,
  add column if not exists account_type text,
  add column if not exists category text,
  add column if not exists is_active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.finance_journal_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.finance_transactions(id) on delete set null,
  receipt_id uuid references public.finance_receipts(id) on delete set null,
  verification_number text,
  entry_date timestamptz not null default now(),
  description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_journal_entries
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists transaction_id uuid,
  add column if not exists receipt_id uuid,
  add column if not exists verification_number text,
  add column if not exists entry_date timestamptz default now(),
  add column if not exists description text,
  add column if not exists status text default 'draft',
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.finance_journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.finance_journal_entries(id) on delete cascade,
  account text not null,
  account_name text,
  debit numeric not null default 0,
  credit numeric not null default 0,
  description text,
  created_at timestamptz not null default now()
);

alter table public.finance_journal_lines
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists journal_entry_id uuid,
  add column if not exists account text,
  add column if not exists account_name text,
  add column if not exists debit numeric default 0,
  add column if not exists credit numeric default 0,
  add column if not exists description text,
  add column if not exists created_at timestamptz default now();

do $$
begin
  if to_regclass('public.finance_journal_entries') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_journal_entries_transaction_id_fkey'
        and conrelid = 'public.finance_journal_entries'::regclass
    ) then
      alter table public.finance_journal_entries
        add constraint finance_journal_entries_transaction_id_fkey
        foreign key (transaction_id) references public.finance_transactions(id) on delete set null;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_journal_entries_receipt_id_fkey'
        and conrelid = 'public.finance_journal_entries'::regclass
    ) then
      alter table public.finance_journal_entries
        add constraint finance_journal_entries_receipt_id_fkey
        foreign key (receipt_id) references public.finance_receipts(id) on delete set null;
    end if;
  end if;

  if to_regclass('public.finance_journal_lines') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_journal_lines_journal_entry_id_fkey'
        and conrelid = 'public.finance_journal_lines'::regclass
    ) then
      alter table public.finance_journal_lines
        add constraint finance_journal_lines_journal_entry_id_fkey
        foreign key (journal_entry_id) references public.finance_journal_entries(id) on delete cascade;
    end if;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.finance_journal_lines') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_journal_lines_debit_non_negative'
        and conrelid = 'public.finance_journal_lines'::regclass
    ) then
      alter table public.finance_journal_lines
        add constraint finance_journal_lines_debit_non_negative
        check (debit >= 0);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_journal_lines_credit_non_negative'
        and conrelid = 'public.finance_journal_lines'::regclass
    ) then
      alter table public.finance_journal_lines
        add constraint finance_journal_lines_credit_non_negative
        check (credit >= 0);
    end if;
  end if;
end
$$;

create index if not exists finance_accounts_account_type_idx
on public.finance_accounts(account_type);

create index if not exists finance_accounts_is_active_idx
on public.finance_accounts(is_active);

create unique index if not exists finance_journal_entries_transaction_unique_idx
on public.finance_journal_entries(transaction_id)
where transaction_id is not null;

create index if not exists finance_journal_entries_status_idx
on public.finance_journal_entries(status);

create index if not exists finance_journal_entries_entry_date_idx
on public.finance_journal_entries(entry_date);

create index if not exists finance_journal_entries_status_entry_date_idx
on public.finance_journal_entries(status, entry_date);

create index if not exists finance_journal_entries_created_at_idx
on public.finance_journal_entries(created_at desc);

create index if not exists finance_journal_entries_verification_number_idx
on public.finance_journal_entries(verification_number);

create index if not exists finance_journal_lines_journal_entry_id_idx
on public.finance_journal_lines(journal_entry_id);

create index if not exists finance_journal_lines_account_idx
on public.finance_journal_lines(account);

create index if not exists finance_journal_lines_journal_entry_account_idx
on public.finance_journal_lines(journal_entry_id, account);

create or replace function public.guard_finance_posted_journal_entry_immutable()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.status = 'posted' then
    raise exception 'Posted journal entries are immutable.';
  end if;

  if tg_op = 'DELETE' and old.status = 'posted' then
    raise exception 'Posted journal entries are immutable.';
  end if;

  return coalesce(new, old);
end
$$;

create or replace function public.guard_finance_posted_journal_lines_immutable()
returns trigger
language plpgsql
as $$
declare
  old_status text;
  new_status text;
begin
  if tg_op = 'INSERT' then
    select status into new_status
    from public.finance_journal_entries
    where id = new.journal_entry_id;

    if new_status = 'posted' then
      raise exception 'Journal lines cannot be changed for posted journal entries.';
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    select status into old_status
    from public.finance_journal_entries
    where id = old.journal_entry_id;

    select status into new_status
    from public.finance_journal_entries
    where id = new.journal_entry_id;

    if old_status = 'posted' or new_status = 'posted' then
      raise exception 'Journal lines cannot be changed for posted journal entries.';
    end if;

    return new;
  end if;

  if tg_op = 'DELETE' then
    select status into old_status
    from public.finance_journal_entries
    where id = old.journal_entry_id;

    if old_status = 'posted' then
      raise exception 'Journal lines cannot be changed for posted journal entries.';
    end if;

    return old;
  end if;

  return null;
end
$$;

drop trigger if exists finance_accounts_set_updated_at on public.finance_accounts;
create trigger finance_accounts_set_updated_at
before update on public.finance_accounts
for each row execute function public.set_updated_at();

drop trigger if exists finance_journal_entries_set_updated_at on public.finance_journal_entries;
create trigger finance_journal_entries_set_updated_at
before update on public.finance_journal_entries
for each row execute function public.set_updated_at();

drop trigger if exists finance_journal_entries_immutable_guard on public.finance_journal_entries;
create trigger finance_journal_entries_immutable_guard
before update or delete on public.finance_journal_entries
for each row execute function public.guard_finance_posted_journal_entry_immutable();

drop trigger if exists finance_journal_lines_immutable_guard on public.finance_journal_lines;
create trigger finance_journal_lines_immutable_guard
before insert or update or delete on public.finance_journal_lines
for each row execute function public.guard_finance_posted_journal_lines_immutable();

alter table public.finance_accounts enable row level security;
alter table public.finance_journal_entries enable row level security;
alter table public.finance_journal_lines enable row level security;

grant select on public.finance_accounts to anon;
grant select on public.finance_journal_entries to anon;
grant select on public.finance_journal_lines to anon;

grant select, insert, update, delete on public.finance_accounts to service_role;
grant select, insert, update, delete on public.finance_journal_entries to service_role;
grant select, insert, update, delete on public.finance_journal_lines to service_role;

-- Development/demo policies for the KWStudio admin panel.
-- TODO: replace these with authenticated admin-only policies before production.
drop policy if exists "Demo admin can read finance accounts" on public.finance_accounts;
create policy "Demo admin can read finance accounts"
on public.finance_accounts for select
to anon
using (true);

drop policy if exists "Demo admin can read finance journal entries" on public.finance_journal_entries;
create policy "Demo admin can read finance journal entries"
on public.finance_journal_entries for select
to anon
using (true);

drop policy if exists "Demo admin can read finance journal lines" on public.finance_journal_lines;
create policy "Demo admin can read finance journal lines"
on public.finance_journal_lines for select
to anon
using (true);

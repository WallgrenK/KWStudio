create table if not exists public.finance_owner_expenses (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  payment_source text not null default 'owner_private',
  linked_bank_transaction_id uuid references public.finance_transactions(id) on delete set null,
  expense_date timestamptz not null default now(),
  description text not null,
  supplier_id uuid references public.finance_suppliers(id) on delete set null,
  supplier_name text,
  receipt_id uuid references public.finance_receipts(id) on delete set null,
  currency text not null default 'SEK',
  gross_amount numeric not null default 0,
  net_amount numeric not null default 0,
  vat_amount numeric not null default 0,
  vat_rate numeric,
  vat_treatment text,
  is_vat_deductible boolean not null default true,
  reverse_charge boolean not null default false,
  expense_account text not null references public.finance_accounts(account),
  recognition_owner_account text not null default '2018' references public.finance_accounts(account),
  reimbursement_owner_account text not null default '2018' references public.finance_accounts(account),
  recognition_journal_entry_id uuid references public.finance_journal_entries(id) on delete set null,
  notes text,
  total_reimbursed_amount numeric not null default 0,
  outstanding_amount numeric not null default 0,
  posted_at timestamptz,
  created_by text,
  posted_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_owner_expenses
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists status text default 'draft',
  add column if not exists payment_source text default 'owner_private',
  add column if not exists linked_bank_transaction_id uuid,
  add column if not exists expense_date timestamptz default now(),
  add column if not exists description text,
  add column if not exists supplier_id uuid,
  add column if not exists supplier_name text,
  add column if not exists receipt_id uuid,
  add column if not exists currency text default 'SEK',
  add column if not exists gross_amount numeric default 0,
  add column if not exists net_amount numeric default 0,
  add column if not exists vat_amount numeric default 0,
  add column if not exists vat_rate numeric,
  add column if not exists vat_treatment text,
  add column if not exists is_vat_deductible boolean default true,
  add column if not exists reverse_charge boolean default false,
  add column if not exists expense_account text,
  add column if not exists recognition_owner_account text default '2018',
  add column if not exists reimbursement_owner_account text default '2018',
  add column if not exists recognition_journal_entry_id uuid,
  add column if not exists notes text,
  add column if not exists total_reimbursed_amount numeric default 0,
  add column if not exists outstanding_amount numeric default 0,
  add column if not exists posted_at timestamptz,
  add column if not exists created_by text,
  add column if not exists posted_by text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.finance_owner_expense_reimbursements (
  id uuid primary key default gen_random_uuid(),
  owner_expense_id uuid not null references public.finance_owner_expenses(id) on delete cascade,
  linked_bank_transaction_id uuid references public.finance_transactions(id) on delete set null,
  amount numeric not null default 0,
  reimbursed_at timestamptz not null default now(),
  journal_entry_id uuid not null references public.finance_journal_entries(id) on delete restrict,
  notes text,
  created_by text,
  created_at timestamptz not null default now()
);

alter table public.finance_owner_expense_reimbursements
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists owner_expense_id uuid,
  add column if not exists linked_bank_transaction_id uuid,
  add column if not exists amount numeric default 0,
  add column if not exists reimbursed_at timestamptz default now(),
  add column if not exists journal_entry_id uuid,
  add column if not exists notes text,
  add column if not exists created_by text,
  add column if not exists created_at timestamptz default now();

alter table public.finance_settings
  add column if not exists owner_expense_recognition_account text default '2018',
  add column if not exists owner_expense_reimbursement_account text default '2018';

alter table public.finance_transactions
  add column if not exists payment_source text default 'company_bank';

do $$
begin
  if to_regclass('public.finance_owner_expenses') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_linked_bank_transaction_id_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_linked_bank_transaction_id_fkey
        foreign key (linked_bank_transaction_id) references public.finance_transactions(id) on delete set null;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_supplier_id_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_supplier_id_fkey
        foreign key (supplier_id) references public.finance_suppliers(id) on delete set null;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_receipt_id_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_receipt_id_fkey
        foreign key (receipt_id) references public.finance_receipts(id) on delete set null;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_expense_account_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_expense_account_fkey
        foreign key (expense_account) references public.finance_accounts(account);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_recognition_owner_account_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_recognition_owner_account_fkey
        foreign key (recognition_owner_account) references public.finance_accounts(account);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_reimbursement_owner_account_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_reimbursement_owner_account_fkey
        foreign key (reimbursement_owner_account) references public.finance_accounts(account);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_recognition_journal_entry_id_fkey'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_recognition_journal_entry_id_fkey
        foreign key (recognition_journal_entry_id) references public.finance_journal_entries(id) on delete set null;
    end if;
  end if;

  if to_regclass('public.finance_owner_expense_reimbursements') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expense_reimbursements_owner_expense_id_fkey'
        and conrelid = 'public.finance_owner_expense_reimbursements'::regclass
    ) then
      alter table public.finance_owner_expense_reimbursements
        add constraint finance_owner_expense_reimbursements_owner_expense_id_fkey
        foreign key (owner_expense_id) references public.finance_owner_expenses(id) on delete cascade;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expense_reimbursements_linked_bank_transaction_id_fkey'
        and conrelid = 'public.finance_owner_expense_reimbursements'::regclass
    ) then
      alter table public.finance_owner_expense_reimbursements
        add constraint finance_owner_expense_reimbursements_linked_bank_transaction_id_fkey
        foreign key (linked_bank_transaction_id) references public.finance_transactions(id) on delete set null;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expense_reimbursements_journal_entry_id_fkey'
        and conrelid = 'public.finance_owner_expense_reimbursements'::regclass
    ) then
      alter table public.finance_owner_expense_reimbursements
        add constraint finance_owner_expense_reimbursements_journal_entry_id_fkey
        foreign key (journal_entry_id) references public.finance_journal_entries(id) on delete restrict;
    end if;
  end if;

  if to_regclass('public.finance_settings') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_settings_owner_expense_recognition_account_fkey'
        and conrelid = 'public.finance_settings'::regclass
    ) then
      alter table public.finance_settings
        add constraint finance_settings_owner_expense_recognition_account_fkey
        foreign key (owner_expense_recognition_account) references public.finance_accounts(account);
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_settings_owner_expense_reimbursement_account_fkey'
        and conrelid = 'public.finance_settings'::regclass
    ) then
      alter table public.finance_settings
        add constraint finance_settings_owner_expense_reimbursement_account_fkey
        foreign key (owner_expense_reimbursement_account) references public.finance_accounts(account);
    end if;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.finance_owner_expenses') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_status_check'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_status_check
        check (status in ('draft', 'posted', 'partially_reimbursed', 'reimbursed', 'cancelled'));
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_payment_source_check'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_payment_source_check
        check (payment_source in ('owner_private', 'company_bank'));
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_non_negative_amounts_check'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_non_negative_amounts_check
        check (
          gross_amount >= 0
          and net_amount >= 0
          and vat_amount >= 0
          and total_reimbursed_amount >= 0
          and outstanding_amount >= 0
        );
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expenses_vat_consistency_check'
        and conrelid = 'public.finance_owner_expenses'::regclass
    ) then
      alter table public.finance_owner_expenses
        add constraint finance_owner_expenses_vat_consistency_check
        check (gross_amount >= vat_amount);
    end if;
  end if;

  if to_regclass('public.finance_owner_expense_reimbursements') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_owner_expense_reimbursements_positive_amount_check'
        and conrelid = 'public.finance_owner_expense_reimbursements'::regclass
    ) then
      alter table public.finance_owner_expense_reimbursements
        add constraint finance_owner_expense_reimbursements_positive_amount_check
        check (amount > 0);
    end if;
  end if;

  if to_regclass('public.finance_transactions') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'finance_transactions_payment_source_check'
        and conrelid = 'public.finance_transactions'::regclass
    ) then
      alter table public.finance_transactions
        add constraint finance_transactions_payment_source_check
        check (payment_source in ('owner_private', 'company_bank'));
    end if;
  end if;
end
$$;

create unique index if not exists finance_owner_expense_reimbursements_journal_uidx
on public.finance_owner_expense_reimbursements(journal_entry_id);

create index if not exists finance_owner_expenses_status_idx
on public.finance_owner_expenses(status);

create index if not exists finance_owner_expenses_reimbursement_status_idx
on public.finance_owner_expenses(status, outstanding_amount);

create index if not exists finance_owner_expenses_expense_date_idx
on public.finance_owner_expenses(expense_date desc);

create index if not exists finance_owner_expenses_payment_source_idx
on public.finance_owner_expenses(payment_source);

create index if not exists finance_owner_expenses_linked_bank_transaction_id_idx
on public.finance_owner_expenses(linked_bank_transaction_id);

create index if not exists finance_owner_expenses_supplier_id_idx
on public.finance_owner_expenses(supplier_id);

create index if not exists finance_owner_expenses_receipt_id_idx
on public.finance_owner_expenses(receipt_id);

create index if not exists finance_owner_expenses_recognition_journal_entry_id_idx
on public.finance_owner_expenses(recognition_journal_entry_id);

create index if not exists finance_owner_expenses_outstanding_open_idx
on public.finance_owner_expenses(outstanding_amount)
where outstanding_amount > 0;

create index if not exists finance_owner_expense_reimbursements_owner_expense_id_idx
on public.finance_owner_expense_reimbursements(owner_expense_id);

create index if not exists finance_owner_expense_reimbursements_reimbursed_at_idx
on public.finance_owner_expense_reimbursements(reimbursed_at desc);

create index if not exists finance_owner_expense_reimbursements_linked_bank_transaction_id_idx
on public.finance_owner_expense_reimbursements(linked_bank_transaction_id);

create index if not exists finance_transactions_payment_source_idx
on public.finance_transactions(payment_source);

drop trigger if exists finance_owner_expenses_set_updated_at on public.finance_owner_expenses;
create trigger finance_owner_expenses_set_updated_at
before update on public.finance_owner_expenses
for each row execute function public.set_updated_at();

alter table public.finance_owner_expenses enable row level security;
alter table public.finance_owner_expense_reimbursements enable row level security;

grant select on public.finance_owner_expenses to anon;
grant select on public.finance_owner_expense_reimbursements to anon;

grant select, insert, update, delete on public.finance_owner_expenses to service_role;
grant select, insert, update, delete on public.finance_owner_expense_reimbursements to service_role;

-- Development/demo policies for the KWStudio admin panel.
-- TODO: replace these with authenticated admin-only policies before production.
drop policy if exists "Demo admin can read owner expenses" on public.finance_owner_expenses;
create policy "Demo admin can read owner expenses"
on public.finance_owner_expenses for select
to anon
using (true);

drop policy if exists "Demo admin can read owner expense reimbursements" on public.finance_owner_expense_reimbursements;
create policy "Demo admin can read owner expense reimbursements"
on public.finance_owner_expense_reimbursements for select
to anon
using (true);

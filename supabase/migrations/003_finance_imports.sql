create table if not exists public.finance_import_batches (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'revolut_pro_csv',
  filename text,
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  skipped_rows integer not null default 0,
  review_rows integer not null default 0,
  categorized_rows integer not null default 0,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  import_batch_id uuid references public.finance_import_batches(id) on delete set null,
  source text not null default 'revolut_pro_csv',
  external_id text not null unique,
  transaction_type text not null,
  booking_date timestamptz,
  payment_date timestamptz,
  description text not null,
  gross_amount numeric not null default 0,
  fee numeric not null default 0,
  currency text not null default 'SEK',
  balance_after numeric,
  raw_type text,
  raw_product text,
  raw_state text,
  category text,
  bas_account text,
  vat_rate numeric,
  vat_amount numeric,
  receipt_status text not null default 'missing',
  status text not null default 'review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_category_rules (
  id uuid primary key default gen_random_uuid(),
  match_text text not null,
  category text not null,
  bas_account text not null,
  vat_rate numeric not null default 25,
  transaction_type text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists finance_transactions_booking_date_idx
on public.finance_transactions(booking_date desc);

create index if not exists finance_transactions_status_idx
on public.finance_transactions(status);

create index if not exists finance_transactions_external_id_idx
on public.finance_transactions(external_id);

create index if not exists finance_import_batches_created_at_idx
on public.finance_import_batches(created_at desc);

drop trigger if exists finance_transactions_set_updated_at on public.finance_transactions;
create trigger finance_transactions_set_updated_at
before update on public.finance_transactions
for each row execute function public.set_updated_at();

insert into public.finance_category_rules (match_text, category, bas_account, vat_rate)
values
  ('OpenAI', 'Software', '5420', 25),
  ('One.com', 'Hosting', '6540', 25),
  ('Adobe', 'Software', '5420', 25),
  ('Figma', 'Software', '5420', 25),
  ('Cloudflare', 'Hosting', '6540', 25)
on conflict do nothing;

alter table public.finance_import_batches enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_category_rules enable row level security;

grant select on public.finance_import_batches to anon;
grant select on public.finance_transactions to anon;
grant select on public.finance_category_rules to anon;

grant select, insert, update, delete on public.finance_import_batches to service_role;
grant select, insert, update, delete on public.finance_transactions to service_role;
grant select, insert, update, delete on public.finance_category_rules to service_role;

-- Development/demo policies for the KWStudio admin panel.
-- Replace these with authenticated admin-only policies before production.
drop policy if exists "Demo admin can read finance import batches" on public.finance_import_batches;
create policy "Demo admin can read finance import batches"
on public.finance_import_batches for select
to anon
using (true);

drop policy if exists "Demo admin can read finance transactions" on public.finance_transactions;
create policy "Demo admin can read finance transactions"
on public.finance_transactions for select
to anon
using (true);

drop policy if exists "Demo admin can read finance category rules" on public.finance_category_rules;
create policy "Demo admin can read finance category rules"
on public.finance_category_rules for select
to anon
using (true);

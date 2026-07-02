create table if not exists public.finance_receipts (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references public.finance_transactions(id) on delete set null,
  filename text not null,
  original_filename text,
  file_path text,
  mime_type text,
  file_size integer,
  supplier text,
  receipt_date timestamptz,
  total_amount numeric,
  vat_amount numeric,
  currency text default 'SEK',
  extracted_text text,
  extraction_status text not null default 'pending',
  match_status text not null default 'unmatched',
  best_transaction_id uuid references public.finance_transactions(id) on delete set null,
  best_match_score integer,
  match_reason text,
  status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_receipt_match_candidates (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.finance_receipts(id) on delete cascade,
  transaction_id uuid not null references public.finance_transactions(id) on delete cascade,
  score integer not null default 0,
  reason text,
  amount_match boolean not null default false,
  date_match boolean not null default false,
  supplier_match boolean not null default false,
  currency_match boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists finance_receipts_created_at_idx
on public.finance_receipts(created_at desc);

create index if not exists finance_receipts_match_status_idx
on public.finance_receipts(match_status);

create index if not exists finance_receipts_transaction_id_idx
on public.finance_receipts(transaction_id);

create index if not exists finance_receipt_candidates_receipt_id_idx
on public.finance_receipt_match_candidates(receipt_id);

create index if not exists finance_receipt_candidates_transaction_id_idx
on public.finance_receipt_match_candidates(transaction_id);

create index if not exists finance_receipt_candidates_score_idx
on public.finance_receipt_match_candidates(score desc);

drop trigger if exists finance_receipts_set_updated_at on public.finance_receipts;
create trigger finance_receipts_set_updated_at
before update on public.finance_receipts
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('finance-receipts', 'finance-receipts', false)
on conflict (id) do update set public = false;

alter table public.finance_receipts enable row level security;
alter table public.finance_receipt_match_candidates enable row level security;

grant select on public.finance_receipts to anon;
grant select on public.finance_receipt_match_candidates to anon;

grant select, insert, update, delete on public.finance_receipts to service_role;
grant select, insert, update, delete on public.finance_receipt_match_candidates to service_role;

-- Development/demo policies for the KWStudio admin panel.
-- Replace these with authenticated admin-only policies before production.
drop policy if exists "Demo admin can read finance receipts" on public.finance_receipts;
create policy "Demo admin can read finance receipts"
on public.finance_receipts for select
to anon
using (true);

drop policy if exists "Demo admin can read finance receipt candidates" on public.finance_receipt_match_candidates;
create policy "Demo admin can read finance receipt candidates"
on public.finance_receipt_match_candidates for select
to anon
using (true);

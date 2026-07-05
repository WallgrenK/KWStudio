-- Production hardening: revoke demo access, add integrity constraints, enquiries public insert.

-- ---------------------------------------------------------------------------
-- Drop demo / development RLS policies
-- ---------------------------------------------------------------------------
drop policy if exists "Demo admin can read companies" on public.companies;
drop policy if exists "Demo admin can read leads" on public.leads;
drop policy if exists "Demo admin can update lead workflow fields" on public.leads;
drop policy if exists "Demo admin can read website audits" on public.website_audits;
drop policy if exists "Demo admin can read lead events" on public.lead_events;
drop policy if exists "Demo admin can read import runs" on public.scb_import_runs;
drop policy if exists "Demo admin can read lead AI insights" on public.lead_ai_insights;
drop policy if exists "Demo admin can read finance import batches" on public.finance_import_batches;
drop policy if exists "Demo admin can read finance transactions" on public.finance_transactions;
drop policy if exists "Demo admin can read finance category rules" on public.finance_category_rules;
drop policy if exists "Demo admin can read finance receipts" on public.finance_receipts;
drop policy if exists "Demo admin can read finance receipt candidates" on public.finance_receipt_match_candidates;
drop policy if exists "Demo admin can read finance accounts" on public.finance_accounts;
drop policy if exists "Demo admin can read finance journal entries" on public.finance_journal_entries;
drop policy if exists "Demo admin can read finance journal lines" on public.finance_journal_lines;
drop policy if exists "Demo admin can read finance vat periods" on public.finance_vat_periods;
drop policy if exists "Demo admin can read finance vat lines" on public.finance_vat_lines;
drop policy if exists "Demo admin can read finance suppliers" on public.finance_suppliers;
drop policy if exists "Demo admin can read finance settings" on public.finance_settings;
drop policy if exists "Demo admin can read owner expenses" on public.finance_owner_expenses;
drop policy if exists "Demo admin can read owner expense reimbursements" on public.finance_owner_expense_reimbursements;
drop policy if exists "Demo admin can read finance tax settings" on public.finance_tax_settings;

-- ---------------------------------------------------------------------------
-- Revoke anonymous access from sensitive tables
-- ---------------------------------------------------------------------------
revoke all on public.companies from anon;
revoke all on public.leads from anon;
revoke all on public.website_audits from anon;
revoke all on public.lead_events from anon;
revoke all on public.scb_import_runs from anon;
revoke all on public.lead_ai_insights from anon;
revoke all on public.finance_import_batches from anon;
revoke all on public.finance_transactions from anon;
revoke all on public.finance_category_rules from anon;
revoke all on public.finance_receipts from anon;
revoke all on public.finance_receipt_match_candidates from anon;
revoke all on public.finance_accounts from anon;
revoke all on public.finance_journal_entries from anon;
revoke all on public.finance_journal_lines from anon;
revoke all on public.finance_vat_periods from anon;
revoke all on public.finance_vat_lines from anon;
revoke all on public.finance_suppliers from anon;
revoke all on public.finance_settings from anon;
revoke all on public.finance_owner_expenses from anon;
revoke all on public.finance_owner_expense_reimbursements from anon;
revoke all on public.finance_tax_settings from anon;

-- ---------------------------------------------------------------------------
-- Integrity constraints
-- ---------------------------------------------------------------------------
create unique index if not exists document_distributions_active_portal_uidx
  on public.document_distributions (document_id)
  where target = 'portal' and status in ('pending', 'sent', 'viewed');

create unique index if not exists asset_requests_pending_workflow_action_uidx
  on public.asset_requests (workflow_action_id)
  where status = 'pending' and workflow_action_id is not null;

-- ---------------------------------------------------------------------------
-- Notifications: users may read only their own rows (defense in depth)
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
  on public.notifications for select
  to authenticated
  using (
    user_profile_id in (
      select id from public.user_profiles where auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Public enquiries (contact / start-a-project forms)
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  budget text,
  message text not null,
  recipient text,
  subject text,
  created_at timestamptz not null default now(),
  constraint enquiries_email_not_empty check (length(trim(email)) > 0),
  constraint enquiries_message_not_empty check (length(trim(message)) > 0)
);

create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);

alter table public.enquiries enable row level security;

revoke all on public.enquiries from anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant all on public.enquiries to service_role;

drop policy if exists "Public can submit enquiries" on public.enquiries;
create policy "Public can submit enquiries"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);

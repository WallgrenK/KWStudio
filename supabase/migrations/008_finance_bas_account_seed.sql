-- Targeted owner-equity BAS seed for Priority 8 readiness.
-- This migration is intentionally small and only ensures owner accounts exist.
-- Safe to re-run: idempotent upsert preserves curated/custom names.

insert into public.finance_accounts (
  account,
  name,
  account_type,
  category,
  is_active
)
values
  ('2018', 'Egen insättning', 'equity', 'owner_contribution', true),
  ('2013', 'Eget uttag', 'equity', 'owner_withdrawal', true)
on conflict (account) do update
set
  account_type = coalesce(public.finance_accounts.account_type, excluded.account_type),
  category = coalesce(public.finance_accounts.category, excluded.category),
  is_active = coalesce(public.finance_accounts.is_active, true);

-- Important upsert behavior:
-- - Existing account names are preserved (no overwrite).
-- - Metadata is only backfilled when currently null.
-- - Existing non-null metadata remains unchanged.

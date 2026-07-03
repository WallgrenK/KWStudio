-- Migration 010: Finance account plan update
-- 
-- 1. Fixes account names to use proper Swedish characters (å, ä, ö)
--    where the live database stored ASCII approximations.
-- 2. Adds seven new expense accounts to support common business categories.
--
-- Safe to re-run (idempotent):
--   - Name updates only run when the stored value differs from the target.
--   - New account inserts use ON CONFLICT DO UPDATE with name always set
--     (these are curated canonical names, not user-entered).
--   - category and is_active are backfilled only when null.

-- ──────────────────────────────────────────────────────────────────────────────
-- Part 1 – Fix Swedish character encoding in existing account names
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE public.finance_accounts SET name = 'Företagskonto'
  WHERE account = '1930' AND name IS DISTINCT FROM 'Företagskonto';

UPDATE public.finance_accounts SET name = 'Årets resultat'
  WHERE account = '2019' AND name IS DISTINCT FROM 'Årets resultat';

UPDATE public.finance_accounts SET name = 'Leverantörsskulder'
  WHERE account = '2440' AND name IS DISTINCT FROM 'Leverantörsskulder';

UPDATE public.finance_accounts SET name = 'Utgående moms 25%'
  WHERE account = '2611' AND name IS DISTINCT FROM 'Utgående moms 25%';

UPDATE public.finance_accounts SET name = 'Ingående moms'
  WHERE account = '2641' AND name IS DISTINCT FROM 'Ingående moms';

UPDATE public.finance_accounts SET name = 'Försäljning'
  WHERE account = '3010' AND name IS DISTINCT FROM 'Försäljning';

UPDATE public.finance_accounts SET name = 'Försäljning Sverige 25%'
  WHERE account = '3041' AND name IS DISTINCT FROM 'Försäljning Sverige 25%';

UPDATE public.finance_accounts SET name = 'Varuinköp'
  WHERE account = '4010' AND name IS DISTINCT FROM 'Varuinköp';

UPDATE public.finance_accounts SET name = 'IT-tjänster'
  WHERE account = '6540' AND name IS DISTINCT FROM 'IT-tjänster';

UPDATE public.finance_accounts SET name = 'Övriga externa kostnader'
  WHERE account = '6991' AND name IS DISTINCT FROM 'Övriga externa kostnader';

UPDATE public.finance_accounts SET name = 'Löner'
  WHERE account = '7010' AND name IS DISTINCT FROM 'Löner';

UPDATE public.finance_accounts SET name = 'Årets resultat'
  WHERE account = '8999' AND name IS DISTINCT FROM 'Årets resultat';

-- ──────────────────────────────────────────────────────────────────────────────
-- Part 2 – Add new expense accounts
-- ──────────────────────────────────────────────────────────────────────────────
-- name is always updated to the canonical Swedish value on conflict.
-- category and is_active are only set when currently null (backfill only).

INSERT INTO public.finance_accounts (account, name, account_type, category, is_active)
VALUES
  ('5410', 'Förbrukningsinventarier',      'expense', 'equipment',        true),
  ('5411', 'Förbrukningsinventarier IT',   'expense', 'equipment_it',     true),
  ('5460', 'Förbrukningsmaterial',         'expense', 'consumables',      true),
  ('5800', 'Resekostnader',               'expense', 'travel',           true),
  ('5831', 'Kost och logi',              'expense', 'lodging',          true),
  ('6071', 'Representation, avdragsgill', 'expense', 'representation',   true),
  ('6212', 'Mobiltelefon',               'expense', 'mobile',           true)
ON CONFLICT (account) DO UPDATE SET
  name         = EXCLUDED.name,
  account_type = COALESCE(public.finance_accounts.account_type, EXCLUDED.account_type),
  category     = COALESCE(public.finance_accounts.category,     EXCLUDED.category),
  is_active    = COALESCE(public.finance_accounts.is_active,    true);

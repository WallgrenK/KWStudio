-- Lock down sensitive finance tables: drop anon/authenticated SELECT policies
-- and revoke table privileges. Complements 027/030 when demo policy names differ
-- or grants were not fully revoked.

-- ---------------------------------------------------------------------------
-- Drop any SELECT policy on finance_* tables that includes anon or authenticated
-- ---------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename like 'finance\_%'
      and (
        policyname like 'Demo admin%'
        or 'anon' = any(roles)
        or 'authenticated' = any(roles)
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      pol.policyname,
      pol.schemaname,
      pol.tablename
    );
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- Revoke frontend role access from all sensitive finance tables
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'finance_import_batches',
    'finance_transactions',
    'finance_category_rules',
    'finance_receipts',
    'finance_receipt_match_candidates',
    'finance_accounts',
    'finance_journal_entries',
    'finance_journal_lines',
    'finance_vat_periods',
    'finance_vat_lines',
    'finance_suppliers',
    'finance_settings',
    'finance_owner_expenses',
    'finance_owner_expense_reimbursements',
    'finance_tax_settings'
  ]
  loop
    if to_regclass('public.' || tbl) is not null then
      execute format('revoke all on public.%I from anon', tbl);
      execute format('revoke all on public.%I from authenticated', tbl);
      execute format('revoke all on public.%I from public', tbl);
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- Ensure RLS stays enabled (idempotent)
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'finance_import_batches',
    'finance_transactions',
    'finance_category_rules',
    'finance_receipts',
    'finance_receipt_match_candidates',
    'finance_accounts',
    'finance_journal_entries',
    'finance_journal_lines',
    'finance_vat_periods',
    'finance_vat_lines',
    'finance_suppliers',
    'finance_settings',
    'finance_owner_expenses',
    'finance_owner_expense_reimbursements',
    'finance_tax_settings'
  ]
  loop
    if to_regclass('public.' || tbl) is not null then
      execute format('alter table public.%I enable row level security', tbl);
    end if;
  end loop;
end
$$;

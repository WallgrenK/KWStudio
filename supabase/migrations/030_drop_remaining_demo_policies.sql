-- Drop any remaining demo RLS policies missed by 027 due to naming variants.
-- Remote databases may have "VAT" (uppercase) while 027 only dropped "vat" (lowercase).

drop policy if exists "Demo admin can read finance vat periods" on public.finance_vat_periods;
drop policy if exists "Demo admin can read finance VAT periods" on public.finance_vat_periods;
drop policy if exists "Demo admin can read finance vat lines" on public.finance_vat_lines;
drop policy if exists "Demo admin can read finance VAT lines" on public.finance_vat_lines;

-- Catch-all: remove any other "Demo admin%" policies regardless of table or casing.
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like 'Demo admin%'
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

-- Defense in depth: ensure anon cannot read VAT tables (idempotent with 027).
revoke all on public.finance_vat_periods from anon;
revoke all on public.finance_vat_lines from anon;

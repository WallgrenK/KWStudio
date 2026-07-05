# KWStudio Backup and Recovery

This document describes how to protect KWStudio data and recover from failures.

## Scope

| Asset | Location | Criticality |
|-------|----------|-------------|
| PostgreSQL database | Supabase | Critical |
| Storage buckets | Supabase Storage | Critical |
| Auth users | Supabase Auth | Critical |
| API Worker secrets | Host secret manager | Critical |
| Frontend deployment | Hosting provider | High |
| Source code | Git repository | High |

## Supabase database backups

### Enable backups

1. Open the Supabase project dashboard.
2. Go to **Database → Backups**.
3. Enable daily backups (requires Pro plan or higher).
4. Confirm retention matches your compliance needs.

### What is included

- All public schema tables (leads, finance, documents, portal, workflow, etc.)
- RLS policies and grants
- Functions, triggers, and indexes

### What is not included

- Storage bucket files (separate backup strategy below)
- Supabase Auth configuration (document redirect URLs separately)
- Edge function code (stored in git)

## Storage backups

Private buckets:

| Bucket | Contents |
|--------|----------|
| `project-assets` | Client uploads |
| `document-pdfs` | Generated PDFs |
| `signature-artifacts` | Signing artifacts |

### Recommended approach

1. Enable bucket versioning where supported, or
2. Schedule periodic export/sync to external object storage (S3, R2, etc.)
3. Prioritize `document-pdfs` and `signature-artifacts` for legal/audit retention

### Recovery priority

1. `document-pdfs` — signed contracts and receipts
2. `signature-artifacts` — signing evidence
3. `project-assets` — client deliverables

## Restore process

### Database restore (Supabase)

1. Identify the restore point from Supabase backup history.
2. Create a **new** staging project or use point-in-time recovery if available.
3. Restore backup to staging — never restore directly over production without validation.
4. Run migration verification:

```sql
-- Verify latest migration applied
select * from supabase_migrations.schema_migrations order by version desc limit 5;

-- Spot-check RLS
select tablename, rowsecurity from pg_tables where schemaname = 'public' and rowsecurity = false;
```

5. Run smoke tests against staging (see PRODUCTION_CHECKLIST.md section 9).
6. Schedule production cutover window if promoting staging to production.

### Storage restore

1. Restore files to the same bucket paths (paths are referenced in database rows).
2. Verify signed URL generation works via API Worker.
3. Test document PDF download and asset download flows.

### Application restore

1. Redeploy API Worker from tagged git release.
2. Restore environment variables from secret manager.
3. Install Playwright Chromium on API host: `npx playwright install chromium`
4. Redeploy frontend from tagged release.
5. Verify `/health` returns `database: ok`, `storage: ok`, `pdf: ok`.

## Disaster recovery

### Scenarios

| Scenario | Response |
|----------|----------|
| Database corruption | Restore from Supabase backup to staging, validate, cutover |
| Accidental data deletion | Point-in-time recovery or latest daily backup |
| Storage bucket loss | Restore from external backup; re-link paths in DB |
| API Worker host failure | Redeploy to new host with same env vars |
| Exposed service role key | Rotate key in Supabase, update API Worker, redeploy |
| Region outage | Failover requires pre-planned secondary region (not automated) |

### Recovery time objectives (suggested)

| Tier | RTO | RPO |
|------|-----|-----|
| Database | 4 hours | 24 hours (daily backup) |
| Storage | 8 hours | 24 hours |
| API / Frontend | 1 hour | 0 (stateless) |

Adjust based on your SLA commitments.

## Verification checklist

After any restore or failover:

- [ ] `/health` returns all checks OK
- [ ] Admin login works
- [ ] Portal client can access own project only
- [ ] Document PDF download works
- [ ] Asset upload and signed download works
- [ ] Finance journal read works (admin)
- [ ] Leads load via API (not direct Supabase)
- [ ] Recent document distributions intact
- [ ] Signature artifacts accessible for recent signings
- [ ] SMTP test email sends (if configured)

## Secrets recovery

Store these in a password manager or host secret manager — never only in deployment UI:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_*` credentials
- `SCB_PFX_*` credentials
- `OPENAI_API_KEY`
- `VITE_SUPABASE_ANON_KEY` (public but document for rebuild)

## Quarterly drill

Every quarter:

1. Restore latest backup to a staging Supabase project.
2. Point a local API Worker at staging credentials.
3. Run the smoke test checklist.
4. Document results and any gaps.

## Migration order after restore

If restoring to a fresh database, apply migrations in order:

```
001 → 002 → … → 029_database_integrity
```

See PRODUCTION_CHECKLIST.md for full migration list.

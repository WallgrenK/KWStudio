# KWStudio Production Checklist

Use this checklist before onboarding real customers. Complete items in order.

## 1. Environment variables

### API Worker (required)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (backend only, never expose to frontend) |
| `PORTAL_APP_BASE_URL` | Public portal URL (e.g. `https://kwstudio.se`) |

### API Worker (optional)

| Variable | Description |
|----------|-------------|
| `PORTAL_INVITE_BASE_URL` | Fallback invite link base URL |
| `DOCUMENT_EMAIL_MODE` | `dev`, `smtp`, or `disabled` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` | Required when `DOCUMENT_EMAIL_MODE=smtp` |
| `DOCUMENT_EMAIL_FROM` | From address for document emails |
| `SCB_PFX_PASSWORD`, `SCB_PFX_BASE64` or `SCB_PFX_PATH` | SCB lead discovery |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Lead AI features |
| `CORS_ALLOWED_ORIGINS` | Comma-separated extra allowed origins |
| `SERVICE_VERSION` | Reported by `/health` |
| `NODE_ENV` | Set to `production` in production |
| `MOBILE_SIGNING_DEBUG` | Set to `true` only for signing diagnostics |

### Frontend (required)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_API_BASE_URL` | API Worker base URL |

## 2. Migration order

Apply all migrations in numeric order via Supabase CLI or dashboard:

```
001 → 002 → … → 026 → 027_production_hardening → 028_performance_indexes
```

Verify after apply:

- No `"Demo admin"` RLS policies remain
- `anon` has no `SELECT` on leads/finance tables
- `enquiries` table exists with insert-only policy
- Partial unique indexes on `document_distributions` and `asset_requests`

## 3. Deployment order

1. Apply Supabase migrations
2. Configure storage buckets (see below)
3. Configure Supabase Auth email templates
4. Deploy API Worker with required env vars
5. Install Playwright browsers on API Worker host
6. Deploy frontend
7. Run post-deployment verification (section 8)

## 4. Supabase setup

- Enable Row Level Security on all public tables
- Service role used only by API Worker (never in frontend)
- Rotate service role key if it was ever exposed
- Enable daily backups (Pro plan or higher)
- Configure Auth redirect URLs for portal and admin
- Review Auth rate limits for login brute-force protection

## 5. Storage buckets

All buckets must be **private** (no public access):

| Bucket | Purpose |
|--------|---------|
| `project-assets` | Client project files |
| `document-pdfs` | Generated document PDFs |
| `signature-artifacts` | Signature SVG/PNG artifacts |

Access is via signed URLs or service-role download only. Buckets are auto-created by API Worker on first use if missing.

## 6. SMTP

For production document email:

1. Set `DOCUMENT_EMAIL_MODE=smtp`
2. Configure SMTP credentials
3. Verify SPF, DKIM, DMARC for sending domain
4. Send test document email from admin
5. Confirm `document_email_sent` event recorded

## 7. Playwright (PDF generation)

On the API Worker host:

```bash
npx playwright install chromium
```

Verify PDF generation:

- Admin document preview PDF
- Portal client document PDF download
- Receipt PDF after signing

## 8. Backup strategy

- **Database:** Enable Supabase daily backups; test restore quarterly
- **Storage:** Enable bucket versioning or periodic export for `document-pdfs` and `signature-artifacts`
- **Secrets:** Store in host secret manager; never commit to git
- **Code:** Tag releases; keep migration history in git

## 9. Post-deployment verification

### Health

```bash
curl https://api.kwstudio.se/health
```

Expect `database: ok`, `storage: ok`, `pdf: ok`, valid `emailMode`.

### Production smoke tests

| Test | Expected |
|------|----------|
| RLS blocks anon access to leads | Direct Supabase anon query on `leads` fails |
| Portal tenant isolation | Client A cannot access Client B project/documents |
| Admin authorization | Portal client JWT rejected on `/finance/*` |
| QR signing | Mobile signing flow completes |
| Signature canvas | Handwritten signature accepted |
| Receipt PDF | Generated after sign (may be async/best-effort) |
| Document PDF | Downloads via authenticated portal route |
| Email sending | Document email sends in SMTP mode |
| Storage | Asset upload + signed download works |
| Playwright | PDF routes return 200, not 503 |
| Finance protected | `/finance/journal` requires admin profile |
| SCB protected | `/categories` requires admin profile |
| Backups enabled | Supabase dashboard shows backup schedule |
| Auth templates | Invite and password reset emails deliver |

## 10. Manual sign-off

- [ ] RLS blocks anon access
- [ ] Portal tenant isolation verified
- [ ] Admin authorization verified
- [ ] QR signing works
- [ ] Signature canvas works
- [ ] Receipt PDF generates
- [ ] Document PDF generates
- [ ] Email sending works
- [ ] SMTP configured
- [ ] Storage private and working
- [ ] Playwright installed
- [ ] Finance protected
- [ ] SCB protected
- [ ] Backups enabled
- [ ] Auth templates configured

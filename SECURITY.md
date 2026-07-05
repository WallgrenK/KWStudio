# KWStudio Security Model

This document describes how KWStudio protects data and access in production.

## Authentication

- **Supabase Auth** issues JWTs for admin and portal users
- Frontend stores sessions via `@supabase/supabase-js` (persisted, auto-refresh)
- API Worker validates JWTs via `supabase.auth.getUser(token)` on every protected request
- **No passwords** are handled by the API Worker; Supabase Auth manages credentials
- Public forms (`contact`, `start-a-project`) insert into `enquiries` via anon key with insert-only RLS

## Authorization

### Admin routes

- Middleware: `requireAdminProfile`
- Requires valid JWT **and** `user_profiles.role = 'admin'`
- Applies to: documents, assets, conversations (admin), workflow (admin), finance, receipts, leads, SCB

### Portal routes

- Middleware: `requirePortalProfile`
- Requires valid JWT **and** `user_profiles.role = 'client'`
- All data access scoped by `user_profiles.client_id`

### Bootstrap

- `POST /portal/admin/bootstrap-profile` creates the **first** admin only
- Subsequent attempts return `403` with `code: admin_bootstrap_closed`
- All bootstrap attempts are logged (auth user ID and IP only)

## Portal security

Portal clients can only access resources tied to their `client_id`:

- `assertClientProjectAccess` — project must belong to client
- `assertClientOwnsDistributedDocument` — document must be distributed to portal
- `assertClientPdfAccess` / `assertClientReceiptAccess` — PDF/receipt download guards
- Notification `markRead` filters by `user_profile_id`

Client-supplied IDs are validated as UUIDs before use. Cross-tenant access returns 404 (not 403) to avoid leaking existence.

## Admin security

- Admin shell requires authenticated session; client profiles redirect to portal
- Finance, receipts, leads, and SCB require admin profile (not merely authenticated JWT)
- Service role key never exposed to frontend

## Storage security

| Bucket | Access |
|--------|--------|
| `project-assets` | Private; signed download URLs |
| `document-pdfs` | Private; service-role generation and download |
| `signature-artifacts` | Private; internal signing pipeline |

Protections:

- Path traversal rejected on storage paths
- MIME type and size validation on uploads
- SVG uploads blocked for client assets (XSS risk)
- Filenames sanitized via `path.basename`

## Signing flow

- QR/mobile signing uses hashed tokens (`signing_token_hash`); raw tokens never stored
- Token routes are rate-limited per IP
- Signing completion is isolated from receipt generation (receipt failure does not fail signing)
- Partial unique index prevents duplicate active signature sessions per token hash

## PDF generation

- On-demand via Playwright (Chromium)
- Failures wrapped as `PdfGenerationUnavailableError` (503 to client, no stack traces)
- Rate-limited per IP on PDF and render routes
- PDF generation failure does not crash the API process

## Receipt generation

- Generated after successful signing (best-effort)
- Failure logged but does not roll back signature or document state
- Receipt artifacts stored in `document-pdfs` bucket

## Email

- Modes: `dev` (log only), `smtp`, `disabled`
- Send failure records `document_email_failed` event; does **not** mark distribution as sent
- Distribution row inserted only after successful provider send
- Workflow activity after email is best-effort (does not fail send response)

## Rate limiting

In-memory IP-based rate limiter (interface allows Redis/Upstash replacement):

| Area | Limit |
|------|-------|
| Mobile signing | 30/min/IP |
| PDF download | 20/min/IP |
| Document render | 20/min/IP |
| Asset upload | 30/min/IP |
| Email send | 10/min/IP |
| Conversation POST | 60/min/IP |

Returns `429` with `{ error, code: "rate_limited" }`.

## RLS model

- **Backend writes:** API Worker uses service role (bypasses RLS)
- **Frontend reads:** Limited to `user_profiles` (own row) and `portal_users` (own row)
- **Public insert:** `enquiries` only
- **Notifications:** Authenticated users may read own notifications only
- **Sensitive tables:** RLS enabled, no anon/authenticated policies (service role only)
- **Demo policies removed** in migration `027_production_hardening`

## Logging

Structured logs via `lib/logger.ts`:

- Redacts JWTs, tokens, passwords, emails, phone numbers, addresses, org numbers
- Supabase error details not exposed in HTTP responses
- Stack traces not returned to clients

## HTTP hardening

- Helmet: CSP, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`
- CORS: explicit origin allowlist (no wildcards in production)
- Global error handler: generic 500 messages, structured server-side logging

## Background failure isolation

Non-critical side effects use `runBestEffort`:

- Workflow notifications
- Conversation system messages
- Receipt generation after signing
- Workflow activity after email send
- Asset/document workflow activity recording

Primary operations (signing, approval, distribution, email send) complete even if side effects fail.

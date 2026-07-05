# KWStudio Monitoring

This document recommends monitoring setup for production. **No services are integrated in code** — configure these externally.

## Goals

| Goal | Why |
|------|-----|
| Uptime | Know when customers cannot access portal or admin |
| Errors | Catch API failures before customers report them |
| Performance | Detect slow PDF generation or database issues |
| Security | Alert on auth anomalies and rate limit spikes |

## Recommended stack

### 1. UptimeRobot (or Better Stack Uptime)

**Purpose:** External HTTP checks from multiple regions.

**Endpoints to monitor:**

| URL | Interval | Alert if |
|-----|----------|----------|
| `https://kwstudio.se` | 5 min | Non-200 or timeout |
| `https://api.kwstudio.se/health` | 5 min | Non-200 or `database` ≠ ok |
| `https://kwstudio.se/portal/dashboard` | 15 min | Non-200 (auth may redirect — expect 302) |

**Health check expectations:**

```json
{
  "database": "ok",
  "storage": "ok",
  "pdf": "ok"
}
```

Alert contacts: email + SMS for critical, email only for warnings.

### 2. Better Stack (formerly Logtail)

**Purpose:** Centralized structured logs from API Worker.

**Setup:**

1. Create a Better Stack source (HTTP or syslog).
2. Forward API Worker stdout/stderr from your host (Render, Railway, VPS).
3. Parse JSON log lines from `lib/logger.ts`.

**Useful queries:**

- `level:error` — all errors
- `event:unhandled_request_error` — uncaught exceptions
- `event:pdf_generation_failed` — PDF issues
- `event:document_email_failed` — email failures

**Alerts:**

- More than 5 `unhandled_request_error` in 10 minutes
- Any `pdf_generation_failed` sustained over 15 minutes
- Rate limit spike: `event:rate_limited` > 100/hour from single IP

### 3. Sentry

**Purpose:** Error tracking with stack traces and release tracking.

**Recommended integration points:**

| Surface | Priority |
|---------|----------|
| API Worker (Express error handler) | High |
| Frontend (React Router) | Medium |
| PDF generation failures | High |

**Setup (documentation only):**

1. Create Sentry project for `kwstudio-api` and `kwstudio-frontend`.
2. Set `SENTRY_DSN` in API Worker env when ready to integrate.
3. Tag releases with git SHA: `SERVICE_VERSION` already exposed in `/health`.

**Alert rules:**

- New issue in production
- Regression in release within 24h of deploy
- Error rate > 1% of requests

## Supabase dashboard monitoring

Use built-in Supabase monitoring for:

- Database connection count
- Query performance (slow queries)
- Auth sign-in failures
- Storage bandwidth

Enable **Database Advisors** and review weekly.

## Email deliverability monitoring

Monitor separately from application uptime:

| Check | Tool |
|-------|------|
| SPF/DKIM/DMARC | MXToolbox, Google Postmaster |
| Bounce rate | SMTP provider dashboard |
| Blocklist status | MXToolbox blacklist check |

See PRODUCTION_CHECKLIST.md section 6 for SMTP setup.

## On-call escalation (suggested)

| Severity | Example | Response |
|----------|---------|----------|
| P1 | Site down, signing broken | Immediate |
| P2 | PDF generation failing | Within 2 hours |
| P3 | Elevated error rate | Next business day |
| P4 | Slow queries | Weekly review |

## Dashboard checklist

Create a single ops dashboard with:

- [ ] Uptime status (site + API health)
- [ ] Error count (last 24h)
- [ ] PDF generation success rate
- [ ] Auth login failures
- [ ] Database connection usage
- [ ] Backup last successful run (Supabase)

## What not to monitor in v1

- Per-user analytics (use product analytics later)
- Custom business KPIs (use admin finance reports)
- Real-time WebSocket metrics (not in scope)

## Integration roadmap

When ready to integrate Sentry:

1. Add `@sentry/node` to API Worker only (minimal scope).
2. Initialize in `src/index.ts` before routes.
3. Capture in `errorHandler` middleware.
4. Do not send PII — logger already redacts sensitive fields.

Frontend Sentry can follow after API stability is confirmed.

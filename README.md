# KWStudio

KWStudio is a full-stack client portal and admin platform for a web design studio. It includes document generation, e-signing, client portal, finance/bookkeeping, leads, and project workflow.

## Repositories

| Repo | Purpose |
|------|---------|
| **KWStudio** (this repo) | React Router frontend + Supabase migrations |
| **KWStudio API Worker** | Express API (documents, finance, portal, leads, signing) |

## Local development

### Frontend

```bash
npm install
cp .env.example .env   # set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_KWSTUDIO_API_URL
npm run dev
```

### API Worker

```bash
cd "../KWStudio API Worker"
npm install
cp .env.example .env   # set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
npm run dev
```

## Production build

### Frontend

```bash
npm run build
npm start   # serves build/server/index.js
```

### API Worker

```bash
npm run build   # compiles TypeScript to dist/
npm start       # node dist/index.js
```

Install Playwright on the API host for PDF generation:

```bash
npx playwright install chromium
```

## Environment variables

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for the full list.

Required frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_KWSTUDIO_API_URL`

Required API Worker:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORTAL_APP_BASE_URL`

## Database migrations

Apply in order via Supabase CLI or dashboard:

```
supabase/migrations/001_*.sql → … → 029_database_integrity.sql
```

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) section 2.

## Documentation

| Document | Contents |
|----------|----------|
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | Pre-launch checklist |
| [SECURITY.md](./SECURITY.md) | Security model |
| [BACKUP_AND_RECOVERY.md](./BACKUP_AND_RECOVERY.md) | Backup and restore |
| [MONITORING.md](./MONITORING.md) | Monitoring recommendations |

## CI

GitHub Actions runs on every push/PR:

- Frontend: `npm ci`, typecheck, build
- API Worker (separate repo): typecheck, regression tests, build

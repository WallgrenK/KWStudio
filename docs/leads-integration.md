# KWStudio Leads Integration

KWStudio admin reads live lead data from Supabase and uses a separate Render API for SCB discovery, website audits, and score recalculation.

## Frontend Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_KWSTUDIO_API_URL=https://your-render-api.onrender.com
```

The frontend must only use the Supabase anon key and the Render API URL. Do not expose service role keys, SCB certificates, SCB passwords, or admin API keys in Vite variables.

## Render Environment Variables

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key
SCB_PFX_BASE64=base64_encoded_client_certificate
SCB_PFX_PASSWORD=certificate_password
OPENAI_API_KEY=server_only_openai_key
OPENAI_MODEL=gpt-4.1-mini
```

The service role key, SCB credentials, and OpenAI API key belong only on the Render server.

## Login Flow

```text
Supabase Auth -> AdminShell guard -> Admin pages
```

1. `/login` signs in with `supabase.auth.signInWithPassword`.
2. `AdminShell` checks the Supabase session before rendering admin pages.
3. If no session exists, the user is redirected to `/login`.
4. `AdminHeader` displays `user.user_metadata.display_name`, falling back to the authenticated email.
5. Logout calls `supabase.auth.signOut`; the auth listener redirects back to `/login`.

## Leads Data Flow

```text
Supabase Auth JWT -> Render API -> Supabase -> KWStudio Admin
```

1. The admin panel calls Render API actions with `VITE_KWSTUDIO_API_URL`.
2. The frontend sends the logged-in user's Supabase access token as `Authorization: Bearer <token>`.
3. Render verifies the token with Supabase before allowing protected mutations.
4. Render uses SCB credentials and the Supabase service role key server-side.
5. Render writes to Supabase tables.
6. The admin frontend reads live data from Supabase tables using the anon key:
   - `companies`
   - `leads`
   - `website_audits`
   - `lead_events`
   - `scb_import_runs`
   - `lead_ai_insights`

Admin leads no longer fall back to demo data. Empty Supabase tables show a real empty state.

## AI Lead Workspace

The Leads page includes a compact preview panel and a full lead workspace modal. The frontend first tries to read the latest saved AI sales pitch from `lead_ai_insights` through the Render API. It does not call OpenAI directly and it does not generate a new pitch automatically when a lead is opened.

Saved AI pitch flow:

1. When a lead is selected, the frontend calls `GET /leads/:id/sales-pitch` with the current Supabase Bearer token.
2. If a saved insight exists, the UI shows `summary`, `recommended_service`, `pitch`, `email_subject`, `email_body`, and `created_at`.
3. If the endpoint returns no insight, `404`, or `501`, the UI shows an empty state and a `Generate AI Pitch` button.
4. The frontend caches loaded insights per `leadId` in state to avoid repeated API reads when switching between leads.
5. `Generate AI Pitch` and `Regenerate` are the only actions that call `POST /leads/:id/sales-pitch`.
6. A successful POST stores the returned insight in UI state immediately and updates the per-lead cache.

The workspace still computes deterministic fallback context for preview, scoring, package recommendation, and empty states from:

- `companies`: name, location, contact details, detected website, and industry context.
- `leads`: status, priority, score, estimated value, source, service interest, notes, owner, and next action.
- `website_audits`: SEO score, audit summary, status code, SSL, title, meta description, robots.txt, and sitemap checks.

Fallback examples:

- Leads without a verified website are treated as starter website opportunities.
- Leads with a website and weak SEO are treated as redesign + SEO opportunities.
- Leads with moderate SEO are treated as audit or refresh opportunities.
- Leads with stronger audit scores are treated as care plan or conversion review opportunities.

The workspace also shows deterministic score breakdowns for Website, SEO, Technical, Conversion, and Business fit. Missing audit data is shown as pending instead of falling back to demo content.

## AI Sales Pitch Endpoint

Render exposes `POST /leads/:id/sales-pitch` behind `requireSupabaseAuth`. The endpoint:

1. Reads the lead, company, and latest website audit with the server-side Supabase service role key.
2. Sends that context to OpenAI using `OPENAI_API_KEY` from the Render environment.
3. Requests structured JSON with `summary`, `recommended_service`, `pitch`, `email_subject`, and `email_body`.
4. Saves the generated result in `lead_ai_insights`.
5. Creates a `lead_events` record with type `sales_pitch_generated`.

The prompt is Swedish, soft, professional, and must not pretend KWStudio has already contacted the customer. No OpenAI keys or prompts are stored in frontend environment variables.

Render also exposes `GET /leads/:id/sales-pitch` behind the same Supabase auth middleware. It returns the latest saved `lead_ai_insights` row for the lead and never generates new AI.

The GET query reads one row:

```sql
select id, lead_id, summary, recommended_service, pitch, email_subject, email_body, raw_response, created_at
from lead_ai_insights
where lead_id = :id
order by created_at desc
limit 1;
```

If no insight exists, the API returns `200` with `{ "ok": true, "insight": null }`. The frontend should show the empty AI state and wait for the user to click Generate.

## SCB Lead Finder Mapping

Frontend filter values are stable UI ids, such as `solna`, `retail_ecommerce`, and `last_90_days`. They are translated to SCB request JSON in `app/services/scbMapper.ts` before any Render API call is made.

SCB requires Swedish category names and code values, for example:

```json
{
  "Företagsstatus": "1",
  "Registreringsstatus": "1",
  "Kategorier": [
    { "Kategori": "SätesKommun", "Kod": ["0184"] },
    { "Kategori": "2-siffrig bransch 1", "Kod": ["47"] },
    { "Kategori": "Juridisk form", "Kod": ["10", "31", "49", "51"] }
  ],
  "variabler": [
    {
      "Variabel": "Registreringsdatum",
      "Operator": "Mellan",
      "Varde1": "20260402",
      "Varde2": "20260701"
    }
  ]
}
```

Municipality takes priority over county. If `municipality` is selected, the frontend sends `SätesKommun` and does not also send `SätesLän`.

Death estates must never become leads. SCB legal form `91` is `dödsbo`, so `buildScbRequest()` includes the default `Juridisk form` allowlist `["10", "31", "49", "51"]` unless a narrower legal form is explicitly requested. The mapper also supports `legalForm` and `excludedLegalForms`, and hard-excludes code `91`.

`/leads/discover` and `/count` must always receive SCB-formatted JSON, not raw UI filter state.

The Render `/leads/discover` implementation should also protect imports server-side by reading legal form from each raw SCB row, skipping rows where legal form is `"91"`, incrementing `skippedLegalFormCount`, and returning that count in the response alongside `importRunId` and `importedCount`.

## Security Notes

RLS is enabled by the initial migration, but current policies must be tightened before production. Admin access should be restricted to authenticated admin users, not broad anon access.

Never use `SUPABASE_SERVICE_ROLE_KEY` in frontend code.

Rotate any previously exposed admin API key in Render and remove it completely if no server code still depends on it.

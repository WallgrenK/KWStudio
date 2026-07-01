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
```

The service role key and SCB credentials belong only on the Render server.

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

Admin leads no longer fall back to demo data. Empty Supabase tables show a real empty state.

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

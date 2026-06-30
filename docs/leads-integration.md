# KWStudio Leads Integration

This project is prepared for a leads workflow where an external Render API imports company data from SCB, enriches it with website checks, writes to Supabase, and the KWStudio admin panel reads from Supabase.

## Frontend Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_KWSTUDIO_API_URL=https://your-render-api.onrender.com
VITE_KWSTUDIO_ADMIN_API_KEY=replace_with_temporary_admin_demo_key
```

`VITE_KWSTUDIO_ADMIN_API_KEY` is only a temporary admin-demo header for the future Render API. Replace it with real authentication before production use.

## Future Render API Environment Variables

```env
SCB_PFX_BASE64=base64_encoded_client_certificate
SCB_PFX_PASSWORD=certificate_password
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key
KWSTUDIO_ADMIN_API_KEY=same_temporary_admin_demo_key
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, SCB certificates, or SCB certificate passwords in the frontend.

## Data Flow

```text
SCB -> Render API -> Supabase -> KWStudio Leads page
```

1. The KWStudio Leads page sends discovery filters to the future Render API.
2. The Render API calls SCB using server-only certificate credentials.
3. The Render API checks company websites and runs lightweight audit/enrichment jobs.
4. The Render API writes companies, leads, website audits, lead events, and import runs to Supabase with the service role key.
5. The KWStudio admin frontend reads lead data from Supabase using the anon key and falls back to demo data if Supabase is not configured.

## Supabase Tables

The migration `supabase/migrations/001_leads_platform.sql` creates:

- `companies`
- `leads`
- `website_audits`
- `lead_events`
- `scb_import_runs`

RLS is enabled on all tables. Current anon policies are marked as development/demo policies and should be tightened when Supabase Auth/admin roles are implemented.

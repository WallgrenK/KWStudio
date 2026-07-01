# KWStudio Render API

The frontend authenticates Render API calls with the logged-in user's Supabase Auth JWT.

## Frontend Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_KWSTUDIO_API_URL=https://your-render-api.onrender.com
```

## Render Environment Variables

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key
SCB_PFX_BASE64=base64_encoded_client_certificate
SCB_PFX_PASSWORD=certificate_password
```

Render should verify protected admin requests from `Authorization: Bearer <token>` with `supabase.auth.getUser(token)`.

SCB lead discovery filters out death estates. Frontend requests include a `Juridisk form` allowlist by default, and Render should still skip raw SCB rows where legal form is `91`, returning `skippedLegalFormCount` from `/leads/discover`.

Supabase RLS still needs to be tightened before production. Rotate any previously exposed admin API key in Render and remove it completely if no code still depends on it.

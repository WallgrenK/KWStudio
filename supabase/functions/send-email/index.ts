import { corsHeaders, handleSendEmail } from "./handler.ts";

/**
 * Supabase Edge Function: send-email
 *
 * Secrets (Supabase project → Edge Functions → Secrets):
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE (optional, "true")
 * - ENQUIRY_EMAIL_FROM — outbound From header (e.g. "Acme Website <noreply@acme.se>")
 * - ENQUIRY_EMAIL_DEFAULT_RECIPIENT — fallback To when body.recipient is absent
 * - ENQUIRY_EMAIL_COMPANY_NAME — template fallback when body.companyName is absent
 * - ENQUIRY_EMAIL_MODE — "smtp" (default) | "dev" | "disabled"
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  return handleSendEmail(req);
});

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export type EnquirySource = "contact" | "start-a-project";

export type EnquiryPayload = {
  name?: string;
  email?: string;
  company?: string | null;
  budget?: string | null;
  message?: string;
  source?: EnquirySource;
  enquiryId?: string | null;
  recipient?: string;
  subject?: string;
  companyName?: string;
  submittedAt?: string;
};

type EnvReader = (name: string) => string | undefined;

type Logger = (level: "info" | "warn" | "error", message: string, details?: Record<string, unknown>) => void;

export function createDefaultEnvReader(): EnvReader {
  return (name: string) => {
    const value = Deno.env.get(name)?.trim();
    return value || undefined;
  };
}

export function createJsonLogger(functionName: string): Logger {
  return (level, message, details) => {
    const entry = {
      level,
      function: functionName,
      message,
      ...(details ?? {}),
      timestamp: new Date().toISOString(),
    };
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function resolveEmailMode(readEnv: EnvReader): "smtp" | "dev" | "disabled" {
  const raw = (readEnv("ENQUIRY_EMAIL_MODE") ?? "smtp").toLowerCase();
  if (raw === "dev" || raw === "disabled") return raw;
  return "smtp";
}

export function resolveRecipient(body: EnquiryPayload, readEnv: EnvReader, logger: Logger): string | null {
  const fromBody = body.recipient?.trim();
  if (fromBody && isValidEmail(fromBody)) {
    return fromBody;
  }
  if (fromBody) {
    logger("warn", "Invalid recipient in request body; falling back to default.", { recipient: fromBody });
  }

  const fallback = readEnv("ENQUIRY_EMAIL_DEFAULT_RECIPIENT");
  if (fallback && isValidEmail(fallback)) {
    return fallback;
  }

  return null;
}

export function resolveCompanyName(body: EnquiryPayload, readEnv: EnvReader): string {
  return body.companyName?.trim() || readEnv("ENQUIRY_EMAIL_COMPANY_NAME")?.trim() || "Website";
}

export function resolveSubject(body: EnquiryPayload, companyName: string): string {
  const fromBody = body.subject?.trim();
  if (fromBody) return fromBody;

  const sourceLabel = body.source === "start-a-project" ? "Project inquiry" : "Contact message";
  return `${companyName}: ${sourceLabel}`;
}

export function resolveFromAddress(companyName: string, readEnv: EnvReader): string {
  const configured = readEnv("ENQUIRY_EMAIL_FROM");
  if (configured) return configured;

  const smtpUser = readEnv("SMTP_USER");
  if (smtpUser && isValidEmail(smtpUser)) {
    return `${companyName} Website <${smtpUser}>`;
  }

  throw new Error("ENQUIRY_EMAIL_FROM is not configured.");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildEmailContent(body: EnquiryPayload, companyName: string): { html: string; text: string } {
  const sourceLabel = body.source === "start-a-project" ? "Start a project" : "Contact";
  const submittedAt = body.submittedAt ?? new Date().toISOString();
  const lines = [
    `New enquiry for ${companyName}`,
    "",
    `Source: ${sourceLabel}`,
    `Name: ${body.name ?? ""}`,
    `Email: ${body.email ?? ""}`,
    body.company ? `Company: ${body.company}` : null,
    body.budget ? `Budget: ${body.budget}` : null,
    "",
    "Message:",
    body.message ?? "",
    "",
    `Submitted: ${submittedAt}`,
    body.enquiryId ? `Enquiry ID: ${body.enquiryId}` : null,
  ].filter((line): line is string => line !== null);

  const text = lines.join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<body style="font-family:Segoe UI,Arial,sans-serif;color:#1f2937;line-height:1.5;">
  <h2 style="margin:0 0 12px;color:#111827;">New enquiry for ${escapeHtml(companyName)}</h2>
  <p style="margin:0 0 16px;color:#4b5563;">A new message was submitted from the public website.</p>
  <table style="border-collapse:collapse;width:100%;max-width:560px;">
    <tr><td style="padding:6px 0;color:#6b7280;width:120px;">Source</td><td style="padding:6px 0;">${escapeHtml(sourceLabel)}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;">${escapeHtml(body.name ?? "")}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(body.email ?? "")}">${escapeHtml(body.email ?? "")}</a></td></tr>
    ${body.company ? `<tr><td style="padding:6px 0;color:#6b7280;">Company</td><td style="padding:6px 0;">${escapeHtml(body.company)}</td></tr>` : ""}
    ${body.budget ? `<tr><td style="padding:6px 0;color:#6b7280;">Budget</td><td style="padding:6px 0;">${escapeHtml(body.budget)}</td></tr>` : ""}
    <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top;">Message</td><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(body.message ?? "")}</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280;">Submitted</td><td style="padding:6px 0;">${escapeHtml(submittedAt)}</td></tr>
    ${body.enquiryId ? `<tr><td style="padding:6px 0;color:#6b7280;">Enquiry ID</td><td style="padding:6px 0;">${escapeHtml(body.enquiryId)}</td></tr>` : ""}
  </table>
</body>
</html>`;

  return { html, text };
}

export function validatePayload(body: EnquiryPayload): string | null {
  const name = body.name?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  if (!name) return "name is required.";
  if (!email || !isValidEmail(email)) return "A valid email is required.";
  if (!message) return "message is required.";
  if (body.source && body.source !== "contact" && body.source !== "start-a-project") {
    return "source must be contact or start-a-project.";
  }

  return null;
}

export async function sendViaSmtp(
  input: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo: string;
  },
  readEnv: EnvReader,
): Promise<void> {
  const host = readEnv("SMTP_HOST");
  const user = readEnv("SMTP_USER");
  const pass = readEnv("SMTP_PASS");

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.");
  }

  const port = Number(readEnv("SMTP_PORT") ?? "587");
  const secure = readEnv("SMTP_SECURE") === "true";

  const client = new SMTPClient({
    connection: {
      hostname: host,
      port,
      tls: secure,
      auth: { username: user, password: pass },
    },
  });

  try {
    await client.send({
      from: input.from,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      content: input.text,
      html: input.html,
    });
  } finally {
    await client.close();
  }
}

export async function handleSendEmail(
  req: Request,
  deps: {
    readEnv?: EnvReader;
    logger?: Logger;
    sendEmail?: typeof sendViaSmtp;
  } = {},
): Promise<Response> {
  const readEnv = deps.readEnv ?? createDefaultEnvReader();
  const logger = deps.logger ?? createJsonLogger("send-email");
  const sendEmail = deps.sendEmail ?? ((input) => sendViaSmtp(input, readEnv));

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  let body: EnquiryPayload;
  try {
    body = await req.json() as EnquiryPayload;
  } catch {
    logger("warn", "Invalid JSON body.");
    return jsonResponse({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const validationError = validatePayload(body);
  if (validationError) {
    logger("warn", "Validation failed.", { error: validationError, source: body.source ?? null });
    return jsonResponse({ ok: false, error: validationError }, 400);
  }

  const mode = resolveEmailMode(readEnv);
  if (mode === "disabled") {
    logger("warn", "Enquiry email delivery is disabled.");
    return jsonResponse({ ok: false, error: "Email delivery is disabled." }, 503);
  }

  const recipient = resolveRecipient(body, readEnv, logger);
  if (!recipient) {
    logger("error", "No valid recipient. Provide body.recipient or ENQUIRY_EMAIL_DEFAULT_RECIPIENT.");
    return jsonResponse({ ok: false, error: "Email recipient is not configured." }, 503);
  }

  const companyName = resolveCompanyName(body, readEnv);
  const subject = resolveSubject(body, companyName);
  const { html, text } = buildEmailContent(body, companyName);

  if (mode === "dev") {
    logger("info", "Dev mode — enquiry email logged, not sent.", {
      to: recipient,
      subject,
      companyName,
      source: body.source ?? "contact",
      fromEmail: body.email,
    });
    return jsonResponse({ ok: true, mode: "dev", recipient, subject });
  }

  try {
    const from = resolveFromAddress(companyName, readEnv);
    await sendEmail({
      from,
      to: recipient,
      subject,
      html,
      text,
      replyTo: body.email!.trim(),
    });

    logger("info", "Enquiry email sent.", {
      to: recipient,
      subject,
      companyName,
      source: body.source ?? "contact",
    });

    return jsonResponse({ ok: true, recipient, subject });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send email.";
    logger("error", "Failed to send enquiry email.", {
      error: message,
      to: recipient,
      subject,
      companyName,
    });
    return jsonResponse({ ok: false, error: "Could not send enquiry email." }, 502);
  }
}

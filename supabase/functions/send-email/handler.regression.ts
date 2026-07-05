import {
  buildEmailContent,
  handleSendEmail,
  resolveCompanyName,
  resolveRecipient,
  resolveSubject,
  validatePayload,
} from "./handler.ts";

const readEnv = (name: string) => {
  const values: Record<string, string> = {
    ENQUIRY_EMAIL_DEFAULT_RECIPIENT: "fallback@example.com",
    ENQUIRY_EMAIL_COMPANY_NAME: "Acme AB",
  };
  return values[name];
};

const logs: Array<{ level: string; message: string }> = [];
const logger = (level: "info" | "warn" | "error", message: string) => {
  logs.push({ level, message });
};

const basePayload = {
  name: "Alex Example",
  email: "alex@example.com",
  message: "Hello there",
  source: "contact" as const,
  recipient: "studio@example.com",
  subject: "Acme AB: Contact Message",
  companyName: "Acme AB",
};

if (validatePayload(basePayload) !== null) {
  throw new Error("Expected valid base payload.");
}

const recipient = resolveRecipient(basePayload, readEnv, logger);
if (recipient !== "studio@example.com") {
  throw new Error(`Expected body recipient, got ${recipient}`);
}

const fallbackRecipient = resolveRecipient(
  { ...basePayload, recipient: undefined },
  readEnv,
  logger,
);
if (fallbackRecipient !== "fallback@example.com") {
  throw new Error(`Expected env fallback recipient, got ${fallbackRecipient}`);
}

const subject = resolveSubject(basePayload, "Acme AB");
if (subject !== "Acme AB: Contact Message") {
  throw new Error(`Unexpected subject: ${subject}`);
}

const companyName = resolveCompanyName({ companyName: "Acme AB" }, readEnv);
if (companyName !== "Acme AB") {
  throw new Error(`Unexpected company name: ${companyName}`);
}

const { html, text } = buildEmailContent(basePayload, "Acme AB");
if (!html.includes("New enquiry for Acme AB") || !text.includes("New enquiry for Acme AB")) {
  throw new Error("Email template should include company name.");
}

let sendCalled = false;
const devResponse = await handleSendEmail(
  new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(basePayload),
  }),
  {
    readEnv: (name) => (name === "ENQUIRY_EMAIL_MODE" ? "dev" : readEnv(name)),
    logger,
    sendEmail: async () => {
      sendCalled = true;
    },
  },
);

const devJson = await devResponse.json();
if (!devJson.ok || devJson.mode !== "dev" || sendCalled) {
  throw new Error("Dev mode should succeed without sending SMTP.");
}

const missingRecipientResponse = await handleSendEmail(
  new Request("http://localhost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...basePayload, recipient: undefined }),
  }),
  {
    readEnv: (name) => (name === "ENQUIRY_EMAIL_MODE" ? "dev" : undefined),
    logger,
  },
);

if (missingRecipientResponse.status !== 503) {
  throw new Error("Expected 503 when recipient is missing and no fallback is configured.");
}

console.log("send-email handler regression checks passed.");

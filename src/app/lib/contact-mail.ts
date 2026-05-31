import { SITE_EMAIL, SITE_NAME } from "./site";

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

interface SendResult {
  ok: boolean;
  error?: string;
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp: string | null
): Promise<boolean> {
  const secret =
    process.env.TURNSTILE_SECRET_KEY ??
    (process.env.NODE_ENV === "development"
      ? "1x0000000000000000000000000000000AA"
      : undefined);

  if (!secret) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

export async function sendContactEmail(payload: ContactPayload): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO ?? SITE_EMAIL;
  const from = process.env.CONTACT_EMAIL_FROM ?? `Contact Form <onboarding@resend.dev>`;

  if (!apiKey) {
    return { ok: false, error: "Contact email is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Contact from ${payload.name} via witl.xyz`,
      text: [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        "",
        payload.message,
        "",
        `— Sent from ${SITE_NAME} contact form`,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    return { ok: false, error: "Failed to send message" };
  }

  return { ok: true };
}

import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail, verifyTurnstileToken } from "@/app/lib/contact-mail";

export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
      turnstileToken?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const turnstileToken = body.turnstileToken?.trim() ?? "";

    if (!name || !email || !message || !turnstileToken) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (
      name.length > MAX_NAME_LENGTH ||
      email.length > MAX_EMAIL_LENGTH ||
      message.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json({ error: "Input exceeds maximum length" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const verified = await verifyTurnstileToken(turnstileToken, getClientIp(request));
    if (!verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 403 });
    }

    const sent = await sendContactEmail({ name, email, message });
    if (!sent.ok) {
      return NextResponse.json(
        { error: sent.error ?? "Unable to send message" },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/contact:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

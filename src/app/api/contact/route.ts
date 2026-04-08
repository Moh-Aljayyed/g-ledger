import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  type?: "contact" | "careers";
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  position?: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();
  const type = body.type === "careers" ? "careers" : "contact";

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "name, email and message are required" },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const isCareers = type === "careers";
  const subject = isCareers
    ? `[Careers] ${body.position || "General application"} — ${name}`
    : `[Contact] ${body.subject || "New inquiry"} — ${name}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:#021544;margin:0 0 16px;">${isCareers ? "📩 New job application" : "📨 New contact message"}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:120px;">Name</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        ${body.phone ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Phone</td><td style="padding:8px;">${escapeHtml(body.phone)}</td></tr>` : ""}
        ${isCareers && body.position ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Position</td><td style="padding:8px;">${escapeHtml(body.position)}</td></tr>` : ""}
        ${!isCareers && body.subject ? `<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Subject</td><td style="padding:8px;">${escapeHtml(body.subject)}</td></tr>` : ""}
      </table>
      <h3 style="color:#021544;margin:24px 0 8px;">${isCareers ? "Cover letter / message" : "Message"}</h3>
      <div style="padding:16px;background:#f9f9f9;border-left:4px solid #0070F2;white-space:pre-wrap;">${escapeHtml(message)}</div>
      <p style="color:#888;font-size:12px;margin-top:24px;">— Sent from g-ledger.com ${isCareers ? "/careers" : "/contact"} form</p>
    </div>
  `;

  // Best-effort email send via Resend (matches existing OTP pattern)
  let emailSent = false;
  let emailError: string | null = null;

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "G-Ledger <onboarding@resend.dev>",
        to: "info@g-ledger.com",
        replyTo: email,
        subject,
        html,
      });
      emailSent = true;
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
      console.error("[contact] resend failed:", emailError);
    }
  } else {
    // No Resend key — log the submission server-side so it isn't lost
    console.log("[contact] (no RESEND_API_KEY) submission:", { type, name, email, subject, message });
  }

  return NextResponse.json({
    ok: true,
    emailSent,
    fallback: !emailSent
      ? "Your message was received. We'll reach you shortly via WhatsApp or email."
      : undefined,
  });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

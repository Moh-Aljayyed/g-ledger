import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

// Send WhatsApp message via UltraMsg or Meta API
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, message } = await request.json();

  if (!to || !message) {
    return NextResponse.json({ error: "to and message required" }, { status: 400 });
  }

  const ULTRAMSG_TOKEN = process.env.WHATSAPP_API_KEY;
  const ULTRAMSG_INSTANCE = process.env.WHATSAPP_INSTANCE;

  if (!ULTRAMSG_TOKEN || !ULTRAMSG_INSTANCE) {
    // Fallback: open WhatsApp web link
    const waLink = `https://wa.me/${to.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
    return NextResponse.json({ success: true, method: "link", url: waLink });
  }

  try {
    const res = await fetch(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE}/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: ULTRAMSG_TOKEN,
        to: to,
        body: message,
      }),
    });

    const data = await res.json();
    return NextResponse.json({ success: true, method: "api", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

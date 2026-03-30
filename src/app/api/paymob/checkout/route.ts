import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || "";
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY || "";

// Paymob Intention API (new V2)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, amount, currency = "EGP" } = await request.json();

  const plans: Record<string, { amount: number; name: string }> = {
    basic: { amount: 40000, name: "G-Ledger أساسي" },           // 400 EGP (~$8)
    professional: { amount: 75000, name: "G-Ledger احترافي" },   // 750 EGP (~$15)
    enterprise: { amount: 125000, name: "G-Ledger مؤسسي" },     // 1250 EGP (~$25)
    storage_1gb: { amount: 50000, name: "تخزين 1GB" },          // 500 EGP (~$10)
  };

  const selected = plans[plan];
  if (!selected && !amount) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const finalAmount = amount || selected.amount;
  const finalName = selected?.name || `G-Ledger - ${plan}`;

  try {
    // Step 1: Auth token
    const authRes = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });
    const authData = await authRes.json();
    const token = authData.token;

    // Step 2: Create order
    const orderRes = await fetch("https://accept.paymob.com/api/ecommerce/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        delivery_needed: false,
        amount_cents: finalAmount,
        currency: currency,
        items: [{ name: finalName, amount_cents: finalAmount, quantity: 1 }],
        merchant_order_id: `GL-${(session.user as any).tenantId}-${Date.now()}`,
      }),
    });
    const orderData = await orderRes.json();

    // Step 3: Payment key
    const paymentRes = await fetch("https://accept.paymob.com/api/acceptance/payment_keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth_token: token,
        amount_cents: finalAmount,
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          first_name: session.user.name || "User",
          last_name: ".",
          email: session.user.email || "user@g-ledger.com",
          phone_number: "+201000000000",
          apartment: "NA", floor: "NA", street: "NA",
          building: "NA", shipping_method: "NA",
          postal_code: "NA", city: "NA", country: "EG", state: "NA",
        },
        currency: currency,
        integration_id: process.env.PAYMOB_CARD_INTEGRATION_ID || "",
        metadata: {
          tenantId: (session.user as any).tenantId,
          plan,
        },
      }),
    });
    const paymentData = await paymentRes.json();

    // Step 4: Generate iframe URL
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID || ""}?payment_token=${paymentData.token}`;

    return NextResponse.json({
      url: iframeUrl,
      paymentToken: paymentData.token,
      orderId: orderData.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

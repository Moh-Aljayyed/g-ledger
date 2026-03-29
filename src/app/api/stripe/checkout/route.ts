import { NextResponse } from "next/server";
import { auth } from "@/server/auth";

function getStripe() {
  const Stripe = require("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, interval } = await request.json();

  const prices: Record<string, { amount: number; name: string }> = {
    basic: { amount: 800, name: "G-Ledger أساسي — $8/مستخدم/شهر" },
    professional: { amount: 1500, name: "G-Ledger احترافي — $15/مستخدم/شهر" },
    enterprise: { amount: 2500, name: "G-Ledger مؤسسي — $25/مستخدم/شهر" },
    storage_1gb: { amount: 1000, name: "تخزين إضافي — 1 GB" },
    crm_addon: { amount: 300, name: "إضافة CRM — $3/مستخدم" },
    pos_addon: { amount: 300, name: "إضافة POS — $3/جهاز" },
    ecommerce_addon: { amount: 500, name: "إضافة eCommerce — $5/مستخدم" },
  };

  const selected = prices[plan];
  if (!selected) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  try {
    const stripe = getStripe();
    const params: any = {
      payment_method_types: ["card"],
      mode: interval === "subscription" ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: selected.name },
            unit_amount: selected.amount,
            ...(interval === "subscription" ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        },
      ],
      metadata: {
        tenantId: (session.user as any).tenantId,
        plan,
        userId: session.user.id,
      },
      customer_email: session.user.email || undefined,
      success_url: `https://g-ledger.com/ar/settings?payment=success&plan=${plan}`,
      cancel_url: `https://g-ledger.com/ar/settings?payment=cancelled`,
    };
    const checkoutSession = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

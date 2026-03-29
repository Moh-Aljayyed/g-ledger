import { NextResponse } from "next/server";
import { db } from "@/server/db";

function getStripe() {
  const Stripe = require("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" });
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event: any;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = JSON.parse(body);
    }
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const tenantId = session.metadata?.tenantId;
    const plan = session.metadata?.plan;

    if (tenantId && plan) {
      const storageMap: Record<string, number> = {
        basic: 1 * 1024 * 1024 * 1024,       // 1 GB
        professional: 2 * 1024 * 1024 * 1024, // 2 GB
        enterprise: 5 * 1024 * 1024 * 1024,   // 5 GB
        storage_1gb: 1 * 1024 * 1024 * 1024,  // +1 GB
      };

      const sub = await db.subscription.findUnique({ where: { tenantId } });
      if (sub) {
        const isAddOn = plan.includes("addon") || plan === "storage_1gb";
        await db.subscription.update({
          where: { tenantId },
          data: {
            plan: isAddOn ? sub.plan : "BASIC",
            status: "ACTIVE",
            storageLimit: isAddOn
              ? sub.storageLimit + BigInt(storageMap[plan] || 0)
              : BigInt(storageMap[plan] || 1073741824),
            maxUsers: plan === "enterprise" ? 999 : plan === "professional" ? 50 : 10,
            trialEndDate: new Date(2099, 11, 31),
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

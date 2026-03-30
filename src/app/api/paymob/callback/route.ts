import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { obj } = body;

  if (obj?.success === true) {
    const tenantId = obj?.order?.merchant_order_id?.split("-")[1];
    const plan = obj?.payment_key_claims?.metadata?.plan;

    if (tenantId) {
      const storageMap: Record<string, number> = {
        basic: 1 * 1024 * 1024 * 1024,
        professional: 2 * 1024 * 1024 * 1024,
        enterprise: 5 * 1024 * 1024 * 1024,
        storage_1gb: 1 * 1024 * 1024 * 1024,
      };

      try {
        const sub = await db.subscription.findUnique({ where: { tenantId } });
        if (sub) {
          await db.subscription.update({
            where: { tenantId },
            data: {
              plan: "BASIC",
              status: "ACTIVE",
              storageLimit: BigInt(storageMap[plan || "basic"] || 1073741824),
              maxUsers: plan === "enterprise" ? 999 : plan === "professional" ? 50 : 10,
              trialEndDate: new Date(2099, 11, 31),
            },
          });
        }
      } catch {}
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const success = searchParams.get("success");
  
  if (success === "true") {
    return NextResponse.redirect("https://g-ledger.com/ar/settings?payment=success");
  }
  return NextResponse.redirect("https://g-ledger.com/ar/settings?payment=failed");
}

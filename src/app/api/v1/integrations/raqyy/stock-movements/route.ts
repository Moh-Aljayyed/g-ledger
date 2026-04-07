import { after } from "next/server";
import { authenticateRaqyy } from "@/server/integrations/raqyy-auth";
import { corsPreflight, jsonWithCors } from "@/server/integrations/raqyy-cors";
import { checkRateLimit, maybeCleanup } from "@/server/integrations/raqyy-rate-limit";
import { logRaqyyEvent, getClientIp } from "@/server/integrations/raqyy-log";
import { mapRaqyyStockMovement } from "@/server/integrations/raqyy-mapper";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  maybeCleanup();
  const ip = getClientIp(request);

  const auth = await authenticateRaqyy(request);
  if (!auth.ok) {
    await logRaqyyEvent({
      tenantId: null,
      endpoint: "stock-movements",
      externalId: null,
      status: auth.code === "SUBSCRIPTION_REQUIRED" ? "SUBSCRIPTION_REQUIRED" : "UNAUTHORIZED",
      httpCode: auth.status,
      errorMessage: auth.error,
      ipAddress: ip,
    });
    return jsonWithCors(request, { ok: false, error: auth.error, code: auth.code }, { status: auth.status });
  }

  const rl = checkRateLimit(`raqyy:stock:${auth.tenantId}`);
  if (!rl.ok) {
    await logRaqyyEvent({
      tenantId: auth.tenantId,
      endpoint: "stock-movements",
      externalId: null,
      status: "RATE_LIMITED",
      httpCode: 429,
      errorMessage: `retry after ${rl.retryAfterSeconds}s`,
      ipAddress: ip,
    });
    return jsonWithCors(
      request,
      { ok: false, error: "Rate limit exceeded", code: "RATE_LIMITED", retryAfter: rl.retryAfterSeconds },
      { status: 429 },
    );
  }

  let payload: Record<string, unknown>;
  let bodyText: string;
  try {
    bodyText = await request.text();
    payload = JSON.parse(bodyText);
  } catch {
    await logRaqyyEvent({
      tenantId: auth.tenantId,
      endpoint: "stock-movements",
      externalId: null,
      status: "BAD_REQUEST",
      httpCode: 400,
      errorMessage: "Invalid JSON",
      ipAddress: ip,
    });
    return jsonWithCors(
      request,
      { ok: false, error: "Invalid JSON body", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const externalId = typeof payload.external_id === "string" ? payload.external_id : null;
  if (!externalId) {
    await logRaqyyEvent({
      tenantId: auth.tenantId,
      endpoint: "stock-movements",
      externalId: null,
      status: "BAD_REQUEST",
      httpCode: 400,
      errorMessage: "Missing external_id",
      payloadSize: bodyText.length,
      ipAddress: ip,
    });
    return jsonWithCors(
      request,
      { ok: false, error: "external_id is required", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const productId = typeof payload.product_id === "number" ? payload.product_id : null;
  const sku = typeof payload.sku === "string" ? payload.sku : null;
  const change = typeof payload.change === "number" ? payload.change : null;
  const newQuantity = typeof payload.new_quantity === "number" ? payload.new_quantity : null;
  const reason = typeof payload.reason === "string" ? payload.reason : null;

  const existing = await db.raqyyStockMovement.findUnique({
    where: { tenantId_externalId: { tenantId: auth.tenantId, externalId } },
  });

  if (existing) {
    await logRaqyyEvent({
      tenantId: auth.tenantId,
      endpoint: "stock-movements",
      externalId,
      status: "DUPLICATE",
      httpCode: 200,
      payloadSize: bodyText.length,
      ipAddress: ip,
    });
    return jsonWithCors(request, {
      ok: true,
      duplicate: true,
      id: existing.id,
      externalId: existing.externalId,
      receivedAt: existing.receivedAt,
      glStockMovementId: existing.glStockMovementId,
    });
  }

  const created = await db.raqyyStockMovement.create({
    data: {
      tenantId: auth.tenantId,
      externalId,
      productId,
      sku,
      change,
      newQuantity,
      reason,
      payload: payload as Prisma.InputJsonValue,
    },
  });

  await logRaqyyEvent({
    tenantId: auth.tenantId,
    endpoint: "stock-movements",
    externalId,
    status: "SUCCESS",
    httpCode: 201,
    payloadSize: bodyText.length,
    ipAddress: ip,
  });

  after(async () => {
    try {
      await mapRaqyyStockMovement(created.id);
    } catch (err) {
      console.error("[raqyy] stock-movement mapping failed:", err);
    }
  });

  return jsonWithCors(
    request,
    {
      ok: true,
      duplicate: false,
      id: created.id,
      externalId: created.externalId,
      receivedAt: created.receivedAt,
    },
    { status: 201 },
  );
}

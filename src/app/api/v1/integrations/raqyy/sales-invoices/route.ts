import { after } from "next/server";
import { authenticateRaqyy } from "@/server/integrations/raqyy-auth";
import { corsPreflight, jsonWithCors } from "@/server/integrations/raqyy-cors";
import { checkRateLimit, maybeCleanup } from "@/server/integrations/raqyy-rate-limit";
import { logRaqyyEvent, getClientIp } from "@/server/integrations/raqyy-log";
import { mapRaqyySalesInvoice } from "@/server/integrations/raqyy-mapper";
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
      endpoint: "sales-invoices",
      externalId: null,
      status: auth.code === "SUBSCRIPTION_REQUIRED" ? "SUBSCRIPTION_REQUIRED" : "UNAUTHORIZED",
      httpCode: auth.status,
      errorMessage: auth.error,
      ipAddress: ip,
    });
    return jsonWithCors(request, { ok: false, error: auth.error, code: auth.code }, { status: auth.status });
  }

  // Rate limit per tenant
  const rl = checkRateLimit(`raqyy:invoice:${auth.tenantId}`);
  if (!rl.ok) {
    await logRaqyyEvent({
      tenantId: auth.tenantId,
      endpoint: "sales-invoices",
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
      endpoint: "sales-invoices",
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
      endpoint: "sales-invoices",
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

  const scope = typeof payload.scope === "string" ? payload.scope : null;
  const totalRaw = payload.total;
  const total =
    typeof totalRaw === "number" || typeof totalRaw === "string"
      ? new Prisma.Decimal(totalRaw)
      : null;

  // Idempotent upsert by (tenantId, externalId)
  const existing = await db.raqyySalesInvoice.findUnique({
    where: { tenantId_externalId: { tenantId: auth.tenantId, externalId } },
  });

  if (existing) {
    await logRaqyyEvent({
      tenantId: auth.tenantId,
      endpoint: "sales-invoices",
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
      glInvoiceId: existing.glInvoiceId,
    });
  }

  const created = await db.raqyySalesInvoice.create({
    data: {
      tenantId: auth.tenantId,
      externalId,
      scope,
      total,
      payload: payload as Prisma.InputJsonValue,
    },
  });

  await logRaqyyEvent({
    tenantId: auth.tenantId,
    endpoint: "sales-invoices",
    externalId,
    status: "SUCCESS",
    httpCode: 201,
    payloadSize: bodyText.length,
    ipAddress: ip,
  });

  // Map to native records after the response is sent
  after(async () => {
    try {
      await mapRaqyySalesInvoice(created.id);
    } catch (err) {
      console.error("[raqyy] sales-invoice mapping failed:", err);
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

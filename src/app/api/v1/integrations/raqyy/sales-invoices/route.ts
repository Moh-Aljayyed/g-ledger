import { authenticateRaqyy } from "@/server/integrations/raqyy-auth";
import { corsPreflight, jsonWithCors } from "@/server/integrations/raqyy-cors";
import { db } from "@/server/db";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const auth = await authenticateRaqyy(request);
  if (!auth.ok) {
    return jsonWithCors(request, { ok: false, error: auth.error, code: auth.code }, { status: auth.status });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonWithCors(
      request,
      { ok: false, error: "Invalid JSON body", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const externalId = typeof payload.external_id === "string" ? payload.external_id : null;
  if (!externalId) {
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
    return jsonWithCors(request, {
      ok: true,
      duplicate: true,
      id: existing.id,
      externalId: existing.externalId,
      receivedAt: existing.receivedAt,
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

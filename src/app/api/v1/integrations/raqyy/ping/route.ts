import { authenticateRaqyy } from "@/server/integrations/raqyy-auth";
import { corsPreflight, jsonWithCors } from "@/server/integrations/raqyy-cors";
import { checkRateLimit, maybeCleanup } from "@/server/integrations/raqyy-rate-limit";
import { logRaqyyEvent, getClientIp } from "@/server/integrations/raqyy-log";

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
      endpoint: "ping",
      externalId: null,
      status: auth.code === "SUBSCRIPTION_REQUIRED" ? "SUBSCRIPTION_REQUIRED" : "UNAUTHORIZED",
      httpCode: auth.status,
      errorMessage: auth.error,
      ipAddress: ip,
    });
    return jsonWithCors(request, { ok: false, error: auth.error, code: auth.code }, { status: auth.status });
  }

  const rl = checkRateLimit(`raqyy:ping:${auth.tenantId}`);
  if (!rl.ok) {
    return jsonWithCors(
      request,
      { ok: false, error: "Rate limit exceeded", code: "RATE_LIMITED", retryAfter: rl.retryAfterSeconds },
      { status: 429 },
    );
  }

  await logRaqyyEvent({
    tenantId: auth.tenantId,
    endpoint: "ping",
    externalId: null,
    status: "SUCCESS",
    httpCode: 200,
    ipAddress: ip,
  });

  return jsonWithCors(request, {
    ok: true,
    service: "g-ledger",
    tenantId: auth.tenantId,
    timestamp: new Date().toISOString(),
  });
}

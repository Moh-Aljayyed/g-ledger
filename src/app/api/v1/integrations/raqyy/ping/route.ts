import { authenticateRaqyy } from "@/server/integrations/raqyy-auth";
import { corsPreflight, jsonWithCors } from "@/server/integrations/raqyy-cors";

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
  return jsonWithCors(request, {
    ok: true,
    service: "g-ledger",
    tenantId: auth.tenantId,
    timestamp: new Date().toISOString(),
  });
}

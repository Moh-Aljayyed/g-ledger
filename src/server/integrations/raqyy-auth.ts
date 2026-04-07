import { db } from "@/server/db";

export type RaqyyAuthSuccess = {
  ok: true;
  tenantId: string;
};

export type RaqyyAuthFailure = {
  ok: false;
  status: 401 | 402;
  error: string;
  code: "INVALID_API_KEY" | "SUBSCRIPTION_REQUIRED";
};

export type RaqyyAuthResult = RaqyyAuthSuccess | RaqyyAuthFailure;

/**
 * Authenticates a Raqyy webhook request:
 *  - Validates Bearer API key against the ApiKey table.
 *  - Honors X-Tenant-Id override (when one API key serves multiple companies).
 *  - Gates by Subscription.status === ACTIVE (returns 402 otherwise).
 */
export async function authenticateRaqyy(request: Request): Promise<RaqyyAuthResult> {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return { ok: false, status: 401, error: "Missing or invalid Authorization header", code: "INVALID_API_KEY" };
  }

  const key = authHeader.substring(7).trim();
  if (!key) {
    return { ok: false, status: 401, error: "Empty API key", code: "INVALID_API_KEY" };
  }

  const apiKey = await db.apiKey.findUnique({ where: { key } });
  if (!apiKey || !apiKey.isActive) {
    return { ok: false, status: 401, error: "Invalid or revoked API key", code: "INVALID_API_KEY" };
  }

  // Tenant routing: honor X-Tenant-Id only if it belongs to the same owner-tenant.
  // For now we trust the API key's tenant; cross-tenant routing is not enabled
  // because every tenant currently has its own ApiKey row.
  const headerTenantId = request.headers.get("x-tenant-id") || request.headers.get("X-Tenant-Id");
  const tenantId = headerTenantId && headerTenantId === apiKey.tenantId ? headerTenantId : apiKey.tenantId;

  // Subscription gate
  const subscription = await db.subscription.findUnique({ where: { tenantId } });
  if (!subscription || subscription.status !== "ACTIVE") {
    return {
      ok: false,
      status: 402,
      error: "Subscription expired or inactive — please renew your G-Ledger subscription",
      code: "SUBSCRIPTION_REQUIRED",
    };
  }

  // Touch lastUsedAt (best-effort, don't block on failure)
  db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});

  return { ok: true, tenantId };
}

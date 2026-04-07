import { db } from "@/server/db";

export type RaqyyLogStatus =
  | "SUCCESS"
  | "DUPLICATE"
  | "FAILED"
  | "UNAUTHORIZED"
  | "SUBSCRIPTION_REQUIRED"
  | "RATE_LIMITED"
  | "BAD_REQUEST";

export async function logRaqyyEvent(args: {
  tenantId: string | null;
  endpoint: "ping" | "sales-invoices" | "stock-movements";
  externalId: string | null;
  status: RaqyyLogStatus;
  httpCode: number;
  errorMessage?: string;
  payloadSize?: number;
  ipAddress?: string | null;
}): Promise<void> {
  // Best-effort: never break the main request if logging fails.
  try {
    await db.raqyySyncLog.create({
      data: {
        tenantId: args.tenantId,
        endpoint: args.endpoint,
        externalId: args.externalId,
        status: args.status,
        httpCode: args.httpCode,
        errorMessage: args.errorMessage,
        payloadSize: args.payloadSize,
        ipAddress: args.ipAddress,
      },
    });
  } catch {
    // swallow
  }
}

export function getClientIp(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}

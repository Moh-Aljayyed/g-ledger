import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

/**
 * Atomically reserve and return the next sequential number for a
 * tenant-scoped counter (invoice number, stock movement number, ...).
 *
 * Implemented as Prisma upsert + increment which translates to a single
 * Postgres `INSERT ... ON CONFLICT DO UPDATE SET value = value + 1`.
 * Race-safe under any number of concurrent callers — replaces the old
 * `findFirst + parseInt + +1` pattern that could collide.
 *
 * Pass a Prisma transaction client (`tx`) when calling from inside a
 * `$transaction` so the counter participates in the same atomic unit.
 */
export type CounterClient = Pick<typeof db, "tenantCounter"> | Prisma.TransactionClient;

export async function nextCounter(
  client: CounterClient,
  tenantId: string,
  type: "INVOICE" | "STOCK_MOVEMENT" | "JOURNAL_ENTRY" | "TAB",
): Promise<number> {
  const row = await client.tenantCounter.upsert({
    where: { tenantId_type: { tenantId, type } },
    create: { tenantId, type, value: 1 },
    update: { value: { increment: 1 } },
    select: { value: true },
  });
  return row.value;
}

/**
 * Format helpers — prefix + zero-padded number.
 * Keeps the existing INV-000001 / SM-000001 conventions.
 */
export function formatInvoiceNumber(value: number): string {
  return `INV-${String(value).padStart(6, "0")}`;
}

export function formatStockMovementNumber(value: number): string {
  return `SM-${String(value).padStart(6, "0")}`;
}

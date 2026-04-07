import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const raqyyRouter = router({
  /**
   * Aggregate stats + recent activity for the Raqyy integration widget
   * shown on the settings/integrations page.
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const tenantId = ctx.tenantId;

    const [
      invoiceCount,
      invoiceMappedCount,
      stockCount,
      stockMappedCount,
      lastInvoice,
      lastStock,
      lastSuccess,
      recentFailures,
    ] = await Promise.all([
      ctx.db.raqyySalesInvoice.count({ where: { tenantId } }),
      ctx.db.raqyySalesInvoice.count({ where: { tenantId, mappingStatus: "MAPPED" } }),
      ctx.db.raqyyStockMovement.count({ where: { tenantId } }),
      ctx.db.raqyyStockMovement.count({ where: { tenantId, mappingStatus: "MAPPED" } }),
      ctx.db.raqyySalesInvoice.findFirst({
        where: { tenantId },
        orderBy: { receivedAt: "desc" },
        select: { receivedAt: true, externalId: true, mappingStatus: true },
      }),
      ctx.db.raqyyStockMovement.findFirst({
        where: { tenantId },
        orderBy: { receivedAt: "desc" },
        select: { receivedAt: true, externalId: true, mappingStatus: true },
      }),
      ctx.db.raqyySyncLog.findFirst({
        where: { tenantId, status: "SUCCESS" },
        orderBy: { receivedAt: "desc" },
        select: { receivedAt: true },
      }),
      ctx.db.raqyySyncLog.findMany({
        where: { tenantId, status: { in: ["FAILED", "BAD_REQUEST"] } },
        orderBy: { receivedAt: "desc" },
        take: 5,
        select: { receivedAt: true, endpoint: true, errorMessage: true, externalId: true },
      }),
    ]);

    return {
      invoices: { total: invoiceCount, mapped: invoiceMappedCount },
      stockMovements: { total: stockCount, mapped: stockMappedCount },
      lastInvoiceAt: lastInvoice?.receivedAt ?? null,
      lastStockAt: lastStock?.receivedAt ?? null,
      lastSuccessAt: lastSuccess?.receivedAt ?? null,
      recentFailures,
    };
  }),

  /**
   * List recent ingest activity (for the dashboard table).
   */
  recentActivity: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const [invoices, stockMovements] = await Promise.all([
        ctx.db.raqyySalesInvoice.findMany({
          where: { tenantId: ctx.tenantId },
          orderBy: { receivedAt: "desc" },
          take: limit,
          select: {
            id: true,
            externalId: true,
            total: true,
            receivedAt: true,
            mappingStatus: true,
            mappingError: true,
            glInvoiceId: true,
          },
        }),
        ctx.db.raqyyStockMovement.findMany({
          where: { tenantId: ctx.tenantId },
          orderBy: { receivedAt: "desc" },
          take: limit,
          select: {
            id: true,
            externalId: true,
            sku: true,
            change: true,
            reason: true,
            receivedAt: true,
            mappingStatus: true,
            mappingError: true,
            glStockMovementId: true,
          },
        }),
      ]);
      return { invoices, stockMovements };
    }),
});

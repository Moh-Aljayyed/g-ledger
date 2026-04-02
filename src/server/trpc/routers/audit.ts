import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const auditRouter = router({
  // List audit logs
  list: protectedProcedure
    .input(z.object({
      entity: z.string().optional(),
      action: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.entity) where.entity = input.entity;
      if (input?.action) where.action = input.action;

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;

      const [logs, total] = await Promise.all([
        ctx.db.auditLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.auditLog.count({ where }),
      ]);

      return { logs, total, page, limit };
    }),

  // List email logs
  emailLogs: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;

      const [logs, total] = await Promise.all([
        ctx.db.emailLog.findMany({
          where: { tenantId: ctx.tenantId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.emailLog.count({ where: { tenantId: ctx.tenantId } }),
      ]);

      return { logs, total, page, limit };
    }),

  // Log an action (used internally by other routers)
  log: protectedProcedure
    .input(z.object({
      action: z.string(),
      entity: z.string(),
      entityId: z.string().optional(),
      details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.auditLog.create({
        data: {
          ...input,
          userId: ctx.session?.user?.id || "system",
          userName: ctx.session?.user?.name || "System",
          tenantId: ctx.tenantId,
        },
      });
      return { success: true };
    }),
});

// Helper function to log actions from other routers
export async function logAudit(db: any, tenantId: string, userId: string, userName: string, action: string, entity: string, entityId?: string, details?: string) {
  try {
    await db.auditLog.create({
      data: { action, entity, entityId, details, userId, userName, tenantId },
    });
  } catch {} // Don't fail if audit log fails
}

export async function logEmail(db: any, tenantId: string, sentBy: string, sentByName: string, to: string, subject: string, documentType?: string, documentId?: string, body?: string) {
  try {
    await db.emailLog.create({
      data: { to, subject, body, documentType, documentId, sentBy, sentByName, tenantId },
    });
  } catch {}
}

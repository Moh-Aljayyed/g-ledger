import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const helpdeskRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.priority) where.priority = input.priority;
      if (input?.category) where.category = input.category;

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [tickets, total] = await Promise.all([
        ctx.db.ticket.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.ticket.count({ where }),
      ]);

      return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        description: z.string().min(1),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate ticket number
      const lastTicket = await ctx.db.ticket.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { createdAt: "desc" },
        select: { ticketNumber: true },
      });

      let nextNum = 1;
      if (lastTicket?.ticketNumber) {
        const match = lastTicket.ticketNumber.match(/TKT-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      const ticketNumber = `TKT-${String(nextNum).padStart(6, "0")}`;

      return ctx.db.ticket.create({
        data: {
          ticketNumber,
          subject: input.subject,
          description: input.description,
          priority: input.priority,
          category: input.category,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        assignedTo: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });

      const data: any = {};
      if (input.status) data.status = input.status;
      if (input.priority) data.priority = input.priority;
      if (input.assignedTo !== undefined) data.assignedTo = input.assignedTo;

      return ctx.db.ticket.update({
        where: { id: input.id },
        data,
      });
    }),

  resolve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });

      return ctx.db.ticket.update({
        where: { id: input.id },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });
    }),

  close: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });

      return ctx.db.ticket.update({
        where: { id: input.id },
        data: {
          status: "CLOSED",
          closedAt: new Date(),
        },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [openCount, inProgressCount, resolvedToday, allResolved] = await Promise.all([
      ctx.db.ticket.count({
        where: { tenantId: ctx.tenantId, status: "OPEN" },
      }),
      ctx.db.ticket.count({
        where: { tenantId: ctx.tenantId, status: "IN_PROGRESS" },
      }),
      ctx.db.ticket.count({
        where: {
          tenantId: ctx.tenantId,
          status: { in: ["RESOLVED", "CLOSED"] },
          resolvedAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      ctx.db.ticket.findMany({
        where: {
          tenantId: ctx.tenantId,
          resolvedAt: { not: null },
        },
        select: { createdAt: true, resolvedAt: true },
        take: 100,
        orderBy: { resolvedAt: "desc" },
      }),
    ]);

    // Calculate average resolution time in hours
    let avgResolutionHours = 0;
    if (allResolved.length > 0) {
      const totalHours = allResolved.reduce((sum, t) => {
        if (!t.resolvedAt) return sum;
        return sum + (t.resolvedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / allResolved.length);
    }

    return {
      openCount,
      inProgressCount,
      resolvedToday,
      avgResolutionHours,
    };
  }),
});

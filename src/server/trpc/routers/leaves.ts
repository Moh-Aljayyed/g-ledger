import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const LEAVE_BALANCES: Record<string, number> = {
  ANNUAL: 21,
  SICK: 30,
  UNPAID: 365,
  MATERNITY: 70,
  EMERGENCY: 5,
  HAJJ: 15,
  OTHER: 10,
};

function calcBusinessDays(start: Date, end: Date): number {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 5 && day !== 6) count++; // Skip Friday/Saturday (Middle East weekend)
    cur.setDate(cur.getDate() + 1);
  }
  return count || 1;
}

export const leavesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
        employeeId: z.string().optional(),
        type: z.enum(["ANNUAL", "SICK", "UNPAID", "MATERNITY", "EMERGENCY", "HAJJ", "OTHER"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.employeeId) where.employeeId = input.employeeId;
      if (input?.type) where.type = input.type;
      if (input?.startDate || input?.endDate) {
        where.startDate = {};
        if (input?.startDate) where.startDate.gte = input.startDate;
        if (input?.endDate) where.startDate.lte = input.endDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [requests, total] = await Promise.all([
        ctx.db.leaveRequest.findMany({
          where,
          include: { employee: { select: { nameAr: true, nameEn: true, employeeNumber: true } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.leaveRequest.count({ where }),
      ]);

      return { requests, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        type: z.enum(["ANNUAL", "SICK", "UNPAID", "MATERNITY", "EMERGENCY", "HAJJ", "OTHER"]),
        startDate: z.date(),
        endDate: z.date(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify employee belongs to tenant
      const employee = await ctx.db.employee.findFirst({
        where: { id: input.employeeId, tenantId: ctx.tenantId },
      });
      if (!employee) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });

      const days = calcBusinessDays(input.startDate, input.endDate);

      return ctx.db.leaveRequest.create({
        data: {
          employeeId: input.employeeId,
          type: input.type,
          startDate: input.startDate,
          endDate: input.endDate,
          days,
          reason: input.reason,
          tenantId: ctx.tenantId,
        },
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.leaveRequest.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId, status: "PENDING" },
      });
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Leave request not found or already processed" });

      return ctx.db.leaveRequest.update({
        where: { id: input.id },
        data: {
          status: "APPROVED",
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
        },
      });
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.leaveRequest.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId, status: "PENDING" },
      });
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Leave request not found or already processed" });

      return ctx.db.leaveRequest.update({
        where: { id: input.id },
        data: {
          status: "REJECTED",
          rejectedReason: input.reason,
        },
      });
    }),

  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.leaveRequest.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId, status: { in: ["PENDING", "APPROVED"] } },
      });
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Leave request not found or cannot be cancelled" });

      return ctx.db.leaveRequest.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });
    }),

  getBalance: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const year = new Date().getFullYear();
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);

      const used = await ctx.db.leaveRequest.groupBy({
        by: ["type"],
        where: {
          tenantId: ctx.tenantId,
          employeeId: input.employeeId,
          status: { in: ["APPROVED", "PENDING"] },
          startDate: { gte: startOfYear, lte: endOfYear },
        },
        _sum: { days: true },
      });

      const balances = Object.entries(LEAVE_BALANCES).map(([type, total]) => {
        const usedDays = used.find((u) => u.type === type)?._sum?.days ?? 0;
        return { type, total, used: usedDays, remaining: total - usedDays };
      });

      return balances;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [pendingCount, approvedThisMonth, onLeaveToday, totalDaysUsed] = await Promise.all([
      ctx.db.leaveRequest.count({
        where: { tenantId: ctx.tenantId, status: "PENDING" },
      }),
      ctx.db.leaveRequest.count({
        where: {
          tenantId: ctx.tenantId,
          status: "APPROVED",
          approvedAt: { gte: startOfMonth },
        },
      }),
      ctx.db.leaveRequest.count({
        where: {
          tenantId: ctx.tenantId,
          status: "APPROVED",
          startDate: { lte: tomorrow },
          endDate: { gte: today },
        },
      }),
      ctx.db.leaveRequest.aggregate({
        where: {
          tenantId: ctx.tenantId,
          status: "APPROVED",
          startDate: { gte: startOfYear },
        },
        _sum: { days: true },
      }),
    ]);

    return {
      pendingCount,
      approvedThisMonth,
      onLeaveToday,
      totalDaysUsed: totalDaysUsed._sum.days ?? 0,
    };
  }),
});

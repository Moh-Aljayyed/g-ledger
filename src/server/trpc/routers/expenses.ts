import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const expensesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "PAID"]).optional(),
        employeeId: z.string().optional(),
        category: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.employeeId) where.employeeId = input.employeeId;
      if (input?.category) where.category = input.category;
      if (input?.fromDate || input?.toDate) {
        where.date = {};
        if (input?.fromDate) where.date.gte = input.fromDate;
        if (input?.toDate) where.date.lte = input.toDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [expenses, total] = await Promise.all([
        ctx.db.expense.findMany({
          where,
          include: { employee: { select: { nameAr: true, employeeNumber: true } } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.expense.count({ where }),
      ]);

      return { expenses, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  create: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        date: z.date(),
        category: z.string().min(1),
        description: z.string().min(1),
        amount: z.number().min(0),
        vatAmount: z.number().min(0).optional(),
        attachmentUrl: z.string().optional(),
        attachmentName: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Auto-generate expense number
      const lastExpense = await ctx.db.expense.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { expenseNumber: "desc" },
      });

      let nextNum = 1;
      if (lastExpense) {
        const match = lastExpense.expenseNumber.match(/EXP-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }
      const expenseNumber = `EXP-${String(nextNum).padStart(6, "0")}`;

      const vatAmount = input.vatAmount ?? 0;
      const totalAmount = input.amount + vatAmount;

      return ctx.db.expense.create({
        data: {
          expenseNumber,
          employeeId: input.employeeId || null,
          date: input.date,
          category: input.category,
          description: input.description,
          amount: input.amount,
          vatAmount,
          totalAmount,
          attachmentUrl: input.attachmentUrl || null,
          attachmentName: input.attachmentName || null,
          notes: input.notes || null,
          tenantId: ctx.tenantId,
        },
      });
    }),

  submit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "المصروف غير موجود" });
      if (expense.status !== "DRAFT") throw new TRPCError({ code: "BAD_REQUEST", message: "يمكن تقديم المسودات فقط" });

      return ctx.db.expense.update({
        where: { id: input.id },
        data: { status: "SUBMITTED" },
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "المصروف غير موجود" });
      if (expense.status !== "SUBMITTED") throw new TRPCError({ code: "BAD_REQUEST", message: "يمكن اعتماد المصروفات المقدمة فقط" });

      return ctx.db.expense.update({
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
      const expense = await ctx.db.expense.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "المصروف غير موجود" });
      if (expense.status !== "SUBMITTED") throw new TRPCError({ code: "BAD_REQUEST", message: "يمكن رفض المصروفات المقدمة فقط" });

      return ctx.db.expense.update({
        where: { id: input.id },
        data: {
          status: "REJECTED",
          notes: input.reason ? `سبب الرفض: ${input.reason}` : expense.notes,
        },
      });
    }),

  markPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const expense = await ctx.db.expense.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!expense) throw new TRPCError({ code: "NOT_FOUND", message: "المصروف غير موجود" });
      if (expense.status !== "APPROVED") throw new TRPCError({ code: "BAD_REQUEST", message: "يمكن صرف المصروفات المعتمدة فقط" });

      return ctx.db.expense.update({
        where: { id: input.id },
        data: { status: "PAID" },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await ctx.db.expense.findMany({
      where: {
        tenantId: ctx.tenantId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const pending = expenses.filter((e) => e.status === "SUBMITTED").reduce((sum, e) => sum + Number(e.totalAmount), 0);
    const approved = expenses.filter((e) => e.status === "APPROVED").reduce((sum, e) => sum + Number(e.totalAmount), 0);
    const paid = expenses.filter((e) => e.status === "PAID").reduce((sum, e) => sum + Number(e.totalAmount), 0);
    const total = expenses.reduce((sum, e) => sum + Number(e.totalAmount), 0);

    return { pending, approved, paid, total, count: expenses.length };
  }),
});

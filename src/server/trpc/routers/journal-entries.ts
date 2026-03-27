import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const journalLineSchema = z.object({
  accountId: z.string(),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional(),
});

export const journalEntriesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "POSTED", "REVERSED"]).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.fromDate || input?.toDate) {
        where.date = {};
        if (input?.fromDate) where.date.gte = input.fromDate;
        if (input?.toDate) where.date.lte = input.toDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [entries, total] = await Promise.all([
        ctx.db.journalEntry.findMany({
          where,
          include: {
            lines: { include: { account: true } },
            fiscalPeriod: true,
          },
          orderBy: [{ date: "desc" }, { entryNumber: "desc" }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.journalEntry.count({ where }),
      ]);

      return { entries, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.journalEntry.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          lines: { include: { account: true } },
          fiscalPeriod: true,
          reversalOf: true,
          reversedBy: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        date: z.date(),
        description: z.string().min(1),
        reference: z.string().optional(),
        lines: z.array(journalLineSchema).min(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate: debits must equal credits
      const totalDebit = input.lines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = input.lines.reduce((sum, l) => sum + l.credit, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "القيد غير متوازن - إجمالي المدين يجب أن يساوي إجمالي الدائن",
        });
      }

      // Each line must have either debit OR credit, not both
      for (const line of input.lines) {
        if (line.debit > 0 && line.credit > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "كل سطر يجب أن يكون إما مدين أو دائن، وليس كلاهما",
          });
        }
        if (line.debit === 0 && line.credit === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "كل سطر يجب أن يحتوي على مبلغ",
          });
        }
      }

      // Validate all accounts exist and are leaf accounts
      const accountIds = input.lines.map((l) => l.accountId);
      const accounts = await ctx.db.account.findMany({
        where: { id: { in: accountIds }, tenantId: ctx.tenantId },
      });

      if (accounts.length !== accountIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "بعض الحسابات غير موجودة",
        });
      }

      const nonLeaf = accounts.find((a) => !a.isLeaf);
      if (nonLeaf) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `لا يمكن الترحيل على حساب غير فرعي: ${nonLeaf.code} - ${nonLeaf.nameAr}`,
        });
      }

      // Find open fiscal period
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: input.date },
          endDate: { gte: input.date },
          isClosed: false,
        },
      });

      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لهذا التاريخ",
        });
      }

      // Get next entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

      return ctx.db.journalEntry.create({
        data: {
          entryNumber,
          date: input.date,
          description: input.description,
          reference: input.reference,
          status: "DRAFT",
          fiscalPeriodId: fiscalPeriod.id,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          lines: {
            create: input.lines.map((line) => ({
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
              description: line.description,
            })),
          },
        },
        include: { lines: { include: { account: true } } },
      });
    }),

  post: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.journalEntry.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { fiscalPeriod: true },
      });

      if (!entry) throw new TRPCError({ code: "NOT_FOUND" });
      if (entry.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن ترحيل قيد غير مسودة",
        });
      }
      if (entry.fiscalPeriod.isClosed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "الفترة المالية مغلقة",
        });
      }

      return ctx.db.journalEntry.update({
        where: { id: input.id },
        data: { status: "POSTED", postedAt: new Date() },
        include: { lines: { include: { account: true } } },
      });
    }),

  reverse: protectedProcedure
    .input(z.object({ id: z.string(), date: z.date(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.journalEntry.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { lines: true },
      });

      if (!entry) throw new TRPCError({ code: "NOT_FOUND" });
      if (entry.status !== "POSTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن عكس قيد غير مرحّل",
        });
      }

      // Find fiscal period for reversal date
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: input.date },
          endDate: { gte: input.date },
          isClosed: false,
        },
      });

      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لتاريخ العكس",
        });
      }

      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });

      // Create reversal entry (swap debits and credits)
      const reversal = await ctx.db.journalEntry.create({
        data: {
          entryNumber: (lastEntry?.entryNumber ?? 0) + 1,
          date: input.date,
          description: input.description || `عكس القيد رقم ${entry.entryNumber}`,
          status: "POSTED",
          fiscalPeriodId: fiscalPeriod.id,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          postedAt: new Date(),
          reversalOfId: entry.id,
          lines: {
            create: entry.lines.map((line) => ({
              accountId: line.accountId,
              debit: Number(line.credit),
              credit: Number(line.debit),
              description: `عكس: ${line.description || ""}`,
            })),
          },
        },
        include: { lines: { include: { account: true } } },
      });

      // Mark original as reversed
      await ctx.db.journalEntry.update({
        where: { id: entry.id },
        data: { status: "REVERSED" },
      });

      return reversal;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await ctx.db.journalEntry.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!entry) throw new TRPCError({ code: "NOT_FOUND" });
      if (entry.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف قيد مرحّل - استخدم العكس",
        });
      }

      return ctx.db.journalEntry.delete({ where: { id: input.id } });
    }),
});

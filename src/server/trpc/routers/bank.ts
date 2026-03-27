import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const bankRouter = router({
  listAccounts: protectedProcedure
    .input(
      z.object({
        type: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT_CARD_ACCOUNT"]).optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.type) where.type = input.type;
      if (input?.isActive !== undefined) where.isActive = input.isActive;

      return ctx.db.bankAccount.findMany({
        where,
        orderBy: { name: "asc" },
      });
    }),

  createAccount: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        iban: z.string().optional(),
        type: z.enum(["CHECKING", "SAVINGS", "CASH", "CREDIT_CARD_ACCOUNT"]).default("CHECKING"),
        currency: z.string().default("SAR"),
        openingBalance: z.number().default(0),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.bankAccount.create({
        data: {
          ...input,
          currentBalance: input.openingBalance,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateAccount: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        iban: z.string().optional(),
        isActive: z.boolean().optional(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.bankAccount.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
    }),

  getAccountDetails: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.bankAccount.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الحساب البنكي غير موجود" });
      }

      const txWhere: any = { bankAccountId: input.id };
      if (input.fromDate || input.toDate) {
        txWhere.date = {};
        if (input.fromDate) txWhere.date.gte = input.fromDate;
        if (input.toDate) txWhere.date.lte = input.toDate;
      }

      const page = input.page;
      const limit = input.limit;

      const [transactions, total] = await Promise.all([
        ctx.db.bankTransaction.findMany({
          where: txWhere,
          orderBy: { date: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.bankTransaction.count({ where: txWhere }),
      ]);

      return {
        account,
        transactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  addTransaction: protectedProcedure
    .input(
      z.object({
        bankAccountId: z.string(),
        type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
        date: z.date(),
        amount: z.number().positive(),
        reference: z.string().optional(),
        description: z.string().min(1),
        counterAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const bankAccount = await ctx.db.bankAccount.findFirst({
        where: { id: input.bankAccountId, tenantId: ctx.tenantId },
      });

      if (!bankAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الحساب البنكي غير موجود" });
      }

      // Get next entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

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

      const result = await ctx.db.$transaction(async (tx) => {
        // Update bank account balance
        const balanceChange = input.type === "DEPOSIT" ? input.amount : -input.amount;
        const updatedAccount = await tx.bankAccount.update({
          where: { id: input.bankAccountId },
          data: { currentBalance: { increment: balanceChange } },
        });

        let journalEntryId: string | null = null;

        // Create journal entry if both accounts are available
        if (bankAccount.accountId && input.counterAccountId) {
          const journalLines =
            input.type === "DEPOSIT"
              ? [
                  {
                    accountId: bankAccount.accountId,
                    debit: input.amount,
                    credit: 0,
                    description: input.description,
                  },
                  {
                    accountId: input.counterAccountId,
                    debit: 0,
                    credit: input.amount,
                    description: input.description,
                  },
                ]
              : [
                  {
                    accountId: input.counterAccountId,
                    debit: input.amount,
                    credit: 0,
                    description: input.description,
                  },
                  {
                    accountId: bankAccount.accountId,
                    debit: 0,
                    credit: input.amount,
                    description: input.description,
                  },
                ];

          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: input.date,
              description: input.description,
              reference: input.reference,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: new Date(),
              lines: { create: journalLines },
            },
          });
          journalEntryId = je.id;
        }

        // Create bank transaction
        const transaction = await tx.bankTransaction.create({
          data: {
            bankAccountId: input.bankAccountId,
            type: input.type,
            date: input.date,
            amount: input.amount,
            balance: Number(updatedAccount.currentBalance),
            reference: input.reference,
            description: input.description,
            journalEntryId,
            tenantId: ctx.tenantId,
          },
        });

        return transaction;
      });

      return result;
    }),

  transfer: protectedProcedure
    .input(
      z.object({
        fromAccountId: z.string(),
        toAccountId: z.string(),
        date: z.date(),
        amount: z.number().positive(),
        reference: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.fromAccountId === input.toAccountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن التحويل لنفس الحساب",
        });
      }

      const [fromAccount, toAccount] = await Promise.all([
        ctx.db.bankAccount.findFirst({
          where: { id: input.fromAccountId, tenantId: ctx.tenantId },
        }),
        ctx.db.bankAccount.findFirst({
          where: { id: input.toAccountId, tenantId: ctx.tenantId },
        }),
      ]);

      if (!fromAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "حساب المصدر غير موجود" });
      }
      if (!toAccount) {
        throw new TRPCError({ code: "NOT_FOUND", message: "حساب الوجهة غير موجود" });
      }

      // Get next entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

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

      const desc = input.description || `تحويل من ${fromAccount.name} إلى ${toAccount.name}`;

      const result = await ctx.db.$transaction(async (tx) => {
        // Update balances
        const updatedFrom = await tx.bankAccount.update({
          where: { id: input.fromAccountId },
          data: { currentBalance: { decrement: input.amount } },
        });

        const updatedTo = await tx.bankAccount.update({
          where: { id: input.toAccountId },
          data: { currentBalance: { increment: input.amount } },
        });

        let journalEntryId: string | null = null;

        // Create journal entry if both GL accounts are linked
        if (fromAccount.accountId && toAccount.accountId) {
          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: input.date,
              description: desc,
              reference: input.reference,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: new Date(),
              lines: {
                create: [
                  {
                    accountId: toAccount.accountId,
                    debit: input.amount,
                    credit: 0,
                    description: desc,
                  },
                  {
                    accountId: fromAccount.accountId,
                    debit: 0,
                    credit: input.amount,
                    description: desc,
                  },
                ],
              },
            },
          });
          journalEntryId = je.id;
        }

        // Create bank transactions
        const [txOut, txIn] = await Promise.all([
          tx.bankTransaction.create({
            data: {
              bankAccountId: input.fromAccountId,
              type: "TRANSFER_OUT",
              date: input.date,
              amount: input.amount,
              balance: Number(updatedFrom.currentBalance),
              reference: input.reference,
              description: `تحويل إلى ${toAccount.name}`,
              journalEntryId,
              tenantId: ctx.tenantId,
            },
          }),
          tx.bankTransaction.create({
            data: {
              bankAccountId: input.toAccountId,
              type: "TRANSFER_IN",
              date: input.date,
              amount: input.amount,
              balance: Number(updatedTo.currentBalance),
              reference: input.reference,
              description: `تحويل من ${fromAccount.name}`,
              journalEntryId,
              tenantId: ctx.tenantId,
            },
          }),
        ]);

        return { transferOut: txOut, transferIn: txIn, journalEntryId };
      });

      return result;
    }),

  reconcile: protectedProcedure
    .input(
      z.object({
        transactionIds: z.array(z.string()).min(1),
        isReconciled: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all transactions belong to tenant
      const transactions = await ctx.db.bankTransaction.findMany({
        where: {
          id: { in: input.transactionIds },
          tenantId: ctx.tenantId,
        },
      });

      if (transactions.length !== input.transactionIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "بعض المعاملات غير موجودة",
        });
      }

      await ctx.db.bankTransaction.updateMany({
        where: {
          id: { in: input.transactionIds },
          tenantId: ctx.tenantId,
        },
        data: { isReconciled: input.isReconciled },
      });

      return { success: true, count: transactions.length };
    }),

  getReconciliation: protectedProcedure
    .input(
      z.object({
        bankAccountId: z.string(),
        asOfDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.bankAccount.findFirst({
        where: { id: input.bankAccountId, tenantId: ctx.tenantId },
      });

      if (!account) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الحساب البنكي غير موجود" });
      }

      const dateFilter: any = { bankAccountId: input.bankAccountId };
      if (input.asOfDate) {
        dateFilter.date = { lte: input.asOfDate };
      }

      const [reconciledTotals, unreconciledTotals, unreconciledTransactions] =
        await Promise.all([
          ctx.db.bankTransaction.aggregate({
            where: { ...dateFilter, isReconciled: true },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.db.bankTransaction.aggregate({
            where: { ...dateFilter, isReconciled: false },
            _sum: { amount: true },
            _count: true,
          }),
          ctx.db.bankTransaction.findMany({
            where: { ...dateFilter, isReconciled: false },
            orderBy: { date: "desc" },
          }),
        ]);

      // Calculate reconciled balance from transaction types
      const allReconciled = await ctx.db.bankTransaction.findMany({
        where: { ...dateFilter, isReconciled: true },
        select: { type: true, amount: true },
      });

      let reconciledBalance = Number(account.openingBalance);
      for (const tx of allReconciled) {
        const amt = Number(tx.amount);
        if (["DEPOSIT", "TRANSFER_IN", "INTEREST"].includes(tx.type)) {
          reconciledBalance += amt;
        } else {
          reconciledBalance -= amt;
        }
      }

      return {
        account: {
          id: account.id,
          name: account.name,
          currentBalance: Number(account.currentBalance),
          openingBalance: Number(account.openingBalance),
        },
        reconciledBalance,
        reconciledCount: reconciledTotals._count,
        unreconciledCount: unreconciledTotals._count,
        unreconciledTransactions,
      };
    }),
});

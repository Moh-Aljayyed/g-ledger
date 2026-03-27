import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const paymentsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["RECEIVED", "MADE"]).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.type) where.type = input.type;
      if (input?.fromDate || input?.toDate) {
        where.date = {};
        if (input?.fromDate) where.date.gte = input.fromDate;
        if (input?.toDate) where.date.lte = input.toDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [payments, total] = await Promise.all([
        ctx.db.payment.findMany({
          where,
          include: {
            invoice: {
              select: { id: true, invoiceNumber: true, buyerName: true },
            },
            bill: {
              select: {
                id: true,
                billNumber: true,
                vendor: { select: { nameAr: true } },
              },
            },
            bankAccount: {
              select: { id: true, name: true },
            },
          },
          orderBy: { date: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.payment.count({ where }),
      ]);

      return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              buyerName: true,
              grandTotal: true,
            },
          },
          bill: {
            select: {
              id: true,
              billNumber: true,
              vendor: { select: { nameAr: true, code: true } },
              grandTotal: true,
            },
          },
          bankAccount: true,
        },
      });

      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الدفعة غير موجودة" });
      }

      return payment;
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["RECEIVED", "MADE"]),
        method: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CREDIT_CARD", "OTHER"]).default("BANK_TRANSFER"),
        date: z.date(),
        amount: z.number().positive(),
        currency: z.string().default("SAR"),
        reference: z.string().optional(),
        notes: z.string().optional(),
        invoiceId: z.string().optional(),
        billId: z.string().optional(),
        bankAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate: must link to invoice or bill
      if (input.type === "RECEIVED" && !input.invoiceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "دفعة مستلمة يجب ربطها بفاتورة",
        });
      }
      if (input.type === "MADE" && !input.billId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "دفعة صادرة يجب ربطها بفاتورة مشتريات",
        });
      }

      // Generate payment number
      const lastPayment = await ctx.db.payment.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { createdAt: "desc" },
      });
      const nextNum = lastPayment
        ? parseInt(lastPayment.paymentNumber.replace(/\D/g, "")) + 1
        : 1;
      const prefix = input.type === "RECEIVED" ? "RCV" : "PMT";
      const paymentNumber = `${prefix}-${String(nextNum).padStart(6, "0")}`;

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
          message: "لا توجد فترة مالية مفتوحة لتاريخ الدفعة",
        });
      }

      const result = await ctx.db.$transaction(async (tx) => {
        let journalEntryId: string | null = null;

        if (input.type === "RECEIVED" && input.invoiceId) {
          // Payment received from customer: Dr Bank/Cash, Cr AR
          const invoice = await tx.invoice.findFirst({
            where: { id: input.invoiceId, tenantId: ctx.tenantId },
            include: { customer: true },
          });
          if (!invoice) {
            throw new TRPCError({ code: "NOT_FOUND", message: "الفاتورة غير موجودة" });
          }

          const journalLines: Array<{
            accountId: string;
            debit: number;
            credit: number;
            description: string;
          }> = [];

          // Dr Bank account
          if (input.bankAccountId) {
            const bankAcct = await tx.bankAccount.findFirst({
              where: { id: input.bankAccountId, tenantId: ctx.tenantId },
            });
            if (bankAcct?.accountId) {
              journalLines.push({
                accountId: bankAcct.accountId,
                debit: input.amount,
                credit: 0,
                description: `تحصيل ${paymentNumber} - ${invoice.buyerName}`,
              });
            }
          }

          // Cr AR account (customer linked account)
          if (invoice.customer?.accountId) {
            journalLines.push({
              accountId: invoice.customer.accountId,
              debit: 0,
              credit: input.amount,
              description: `تحصيل ${paymentNumber} - ${invoice.buyerName}`,
            });
          }

          if (journalLines.length >= 2) {
            const je = await tx.journalEntry.create({
              data: {
                entryNumber,
                date: input.date,
                description: `تحصيل دفعة ${paymentNumber} - ${invoice.buyerName}`,
                reference: paymentNumber,
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

          // Update bank account balance
          if (input.bankAccountId) {
            await tx.bankAccount.update({
              where: { id: input.bankAccountId },
              data: { currentBalance: { increment: input.amount } },
            });

            // Create bank transaction
            const bankAcct = await tx.bankAccount.findUnique({
              where: { id: input.bankAccountId },
            });
            await tx.bankTransaction.create({
              data: {
                bankAccountId: input.bankAccountId,
                type: "DEPOSIT",
                date: input.date,
                amount: input.amount,
                balance: Number(bankAcct!.currentBalance),
                reference: paymentNumber,
                description: `تحصيل من ${invoice.buyerName}`,
                journalEntryId,
                tenantId: ctx.tenantId,
              },
            });
          }
        } else if (input.type === "MADE" && input.billId) {
          // Payment made to vendor: Dr AP, Cr Bank/Cash
          const bill = await tx.bill.findFirst({
            where: { id: input.billId, tenantId: ctx.tenantId },
            include: { vendor: true },
          });
          if (!bill) {
            throw new TRPCError({ code: "NOT_FOUND", message: "فاتورة المشتريات غير موجودة" });
          }

          const journalLines: Array<{
            accountId: string;
            debit: number;
            credit: number;
            description: string;
          }> = [];

          // Dr AP account (vendor linked account)
          if (bill.vendor.accountId) {
            journalLines.push({
              accountId: bill.vendor.accountId,
              debit: input.amount,
              credit: 0,
              description: `سداد ${paymentNumber} - ${bill.vendor.nameAr}`,
            });
          }

          // Cr Bank account
          if (input.bankAccountId) {
            const bankAcct = await tx.bankAccount.findFirst({
              where: { id: input.bankAccountId, tenantId: ctx.tenantId },
            });
            if (bankAcct?.accountId) {
              journalLines.push({
                accountId: bankAcct.accountId,
                debit: 0,
                credit: input.amount,
                description: `سداد ${paymentNumber} - ${bill.vendor.nameAr}`,
              });
            }
          }

          if (journalLines.length >= 2) {
            const je = await tx.journalEntry.create({
              data: {
                entryNumber,
                date: input.date,
                description: `سداد دفعة ${paymentNumber} - ${bill.vendor.nameAr}`,
                reference: paymentNumber,
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

          // Update bill paid amount and status
          const newAmountPaid = Number(bill.amountPaid) + input.amount;
          const billGrandTotal = Number(bill.grandTotal);
          let newStatus = bill.status;
          if (newAmountPaid >= billGrandTotal) {
            newStatus = "PAID";
          } else if (newAmountPaid > 0) {
            newStatus = "PARTIALLY_PAID";
          }

          await tx.bill.update({
            where: { id: input.billId },
            data: { amountPaid: newAmountPaid, status: newStatus },
          });

          // Update bank account balance
          if (input.bankAccountId) {
            await tx.bankAccount.update({
              where: { id: input.bankAccountId },
              data: { currentBalance: { decrement: input.amount } },
            });

            const bankAcct = await tx.bankAccount.findUnique({
              where: { id: input.bankAccountId },
            });
            await tx.bankTransaction.create({
              data: {
                bankAccountId: input.bankAccountId,
                type: "WITHDRAWAL",
                date: input.date,
                amount: input.amount,
                balance: Number(bankAcct!.currentBalance),
                reference: paymentNumber,
                description: `سداد إلى ${bill.vendor.nameAr}`,
                journalEntryId,
                tenantId: ctx.tenantId,
              },
            });
          }
        }

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            paymentNumber,
            type: input.type,
            method: input.method,
            date: input.date,
            amount: input.amount,
            currency: input.currency,
            reference: input.reference,
            notes: input.notes,
            invoiceId: input.invoiceId,
            billId: input.billId,
            bankAccountId: input.bankAccountId,
            journalEntryId,
            tenantId: ctx.tenantId,
            createdById: ctx.user.id,
          },
          include: {
            invoice: { select: { invoiceNumber: true } },
            bill: { select: { billNumber: true } },
            bankAccount: { select: { name: true } },
          },
        });

        return payment;
      });

      return result;
    }),
});

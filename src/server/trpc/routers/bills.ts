import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const billItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
  vatRate: z.number().min(0).default(15),
  accountId: z.string().optional(),
});

export const billsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "APPROVED", "PARTIALLY_PAID", "PAID", "CANCELLED"]).optional(),
        vendorId: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.vendorId) where.vendorId = input.vendorId;
      if (input?.fromDate || input?.toDate) {
        where.issueDate = {};
        if (input?.fromDate) where.issueDate.gte = input.fromDate;
        if (input?.toDate) where.issueDate.lte = input.toDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [bills, total] = await Promise.all([
        ctx.db.bill.findMany({
          where,
          include: {
            vendor: { select: { id: true, nameAr: true, code: true } },
            items: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.bill.count({ where }),
      ]);

      return { bills, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bill = await ctx.db.bill.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          vendor: true,
          items: { orderBy: { lineNumber: "asc" } },
          payments: true,
        },
      });

      if (!bill) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الفاتورة غير موجودة" });
      }

      return bill;
    }),

  create: protectedProcedure
    .input(
      z.object({
        vendorId: z.string(),
        issueDate: z.date(),
        dueDate: z.date(),
        currency: z.string().default("SAR"),
        notes: z.string().optional(),
        items: z.array(billItemSchema).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify vendor exists
      const vendor = await ctx.db.vendor.findFirst({
        where: { id: input.vendorId, tenantId: ctx.tenantId },
      });
      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المورد غير موجود" });
      }

      // Generate bill number
      const lastBill = await ctx.db.bill.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { createdAt: "desc" },
      });
      const nextNum = lastBill
        ? parseInt(lastBill.billNumber.replace(/\D/g, "")) + 1
        : 1;
      const billNumber = `BILL-${String(nextNum).padStart(6, "0")}`;

      // Calculate item totals
      const processedItems = input.items.map((item, idx) => {
        const netAmount = item.quantity * item.unitPrice - item.discount;
        const vatAmount = netAmount * (item.vatRate / 100);
        const totalAmount = netAmount + vatAmount;

        return {
          lineNumber: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          vatRate: item.vatRate,
          vatAmount,
          netAmount,
          totalAmount,
          accountId: item.accountId,
        };
      });

      const subtotal = processedItems.reduce((sum, i) => sum + i.netAmount, 0);
      const totalVat = processedItems.reduce((sum, i) => sum + i.vatAmount, 0);
      const totalDiscount = processedItems.reduce((sum, i) => sum + i.discount, 0);
      const grandTotal = subtotal + totalVat;

      return ctx.db.bill.create({
        data: {
          billNumber,
          vendorId: input.vendorId,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          status: "DRAFT",
          subtotal,
          totalVat,
          totalDiscount,
          grandTotal,
          currency: input.currency,
          notes: input.notes,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          items: { create: processedItems },
        },
        include: { items: true, vendor: true },
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.db.bill.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { items: true, vendor: true },
      });

      if (!bill) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الفاتورة غير موجودة" });
      }
      if (bill.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن اعتماد فاتورة غير مسودة",
        });
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
          startDate: { lte: bill.issueDate },
          endDate: { gte: bill.issueDate },
          isClosed: false,
        },
      });

      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لتاريخ الفاتورة",
        });
      }

      // Build journal lines: Dr Expense/Asset accounts, Cr AP
      const journalLines: Array<{
        accountId: string;
        debit: number;
        credit: number;
        description: string;
      }> = [];

      // Debit lines - expense/asset accounts from bill items
      for (const item of bill.items) {
        if (item.accountId) {
          journalLines.push({
            accountId: item.accountId,
            debit: Number(item.totalAmount),
            credit: 0,
            description: item.description,
          });
        }
      }

      // Credit line - AP account (vendor's linked account)
      if (bill.vendor.accountId) {
        journalLines.push({
          accountId: bill.vendor.accountId,
          debit: 0,
          credit: Number(bill.grandTotal),
          description: `فاتورة مشتريات ${bill.billNumber} - ${bill.vendor.nameAr}`,
        });
      }

      // Create journal entry and update bill in a transaction
      const result = await ctx.db.$transaction(async (tx) => {
        let journalEntryId: string | null = null;

        if (journalLines.length >= 2) {
          const journalEntry = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: bill.issueDate,
              description: `فاتورة مشتريات ${bill.billNumber} - ${bill.vendor.nameAr}`,
              reference: bill.billNumber,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: new Date(),
              lines: {
                create: journalLines,
              },
            },
          });
          journalEntryId = journalEntry.id;
        }

        const updatedBill = await tx.bill.update({
          where: { id: input.id },
          data: {
            status: "APPROVED",
            journalEntryId,
          },
          include: { items: true, vendor: true },
        });

        return updatedBill;
      });

      return result;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const bill = await ctx.db.bill.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!bill) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الفاتورة غير موجودة" });
      }
      if (bill.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف فاتورة غير مسودة",
        });
      }

      return ctx.db.bill.delete({
        where: { id: input.id },
      });
    }),
});

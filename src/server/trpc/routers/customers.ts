import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const customersRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.isActive !== undefined) where.isActive = input.isActive;
      if (input?.search) {
        where.OR = [
          { nameAr: { contains: input.search } },
          { nameEn: { contains: input.search, mode: "insensitive" } },
          { code: { contains: input.search } },
          { taxId: { contains: input.search } },
        ];
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [customers, total] = await Promise.all([
        ctx.db.customer.findMany({
          where,
          orderBy: { code: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.customer.count({ where }),
      ]);

      return { customers, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          invoices: {
            select: {
              id: true,
              invoiceNumber: true,
              grandTotal: true,
              status: true,
              issueDate: true,
            },
            orderBy: { issueDate: "desc" },
            take: 20,
          },
        },
      });

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "العميل غير موجود" });
      }

      // Calculate outstanding balance from accepted/submitted invoices
      const invoiceTotals = await ctx.db.invoice.aggregate({
        where: {
          customerId: input.id,
          tenantId: ctx.tenantId,
          status: { in: ["ACCEPTED", "SUBMITTED", "READY"] },
        },
        _sum: { grandTotal: true },
      });

      const paymentTotals = await ctx.db.payment.aggregate({
        where: {
          tenantId: ctx.tenantId,
          type: "RECEIVED",
          invoice: { customerId: input.id },
        },
        _sum: { amount: true },
      });

      const totalInvoiced = Number(invoiceTotals._sum.grandTotal ?? 0);
      const totalPaid = Number(paymentTotals._sum.amount ?? 0);
      const outstandingBalance = totalInvoiced - totalPaid;

      return { ...customer, totalInvoiced, totalPaid, outstandingBalance };
    }),

  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        taxId: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        creditLimit: z.number().min(0).optional(),
        paymentTerms: z.number().min(0).optional(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get tenant country for validation
      const tenant = await ctx.db.tenant.findUnique({ where: { id: ctx.tenantId }, select: { country: true } });
      const country = tenant?.country || "SA";

      // Saudi Arabia requires: address, city, taxId for B2B
      if (country === "SA") {
        if (!input.address) throw new TRPCError({ code: "BAD_REQUEST", message: "العنوان مطلوب في السعودية" });
        if (!input.city) throw new TRPCError({ code: "BAD_REQUEST", message: "المدينة مطلوبة في السعودية" });
      }

      const existing = await ctx.db.customer.findFirst({
        where: { tenantId: ctx.tenantId, code: input.code },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "كود العميل مستخدم بالفعل",
        });
      }

      return ctx.db.customer.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        taxId: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        creditLimit: z.number().min(0).optional(),
        paymentTerms: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.customer.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoiceCount = await ctx.db.invoice.count({
        where: { customerId: input.id, tenantId: ctx.tenantId },
      });

      if (invoiceCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف عميل لديه فواتير",
        });
      }

      return ctx.db.customer.delete({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
    }),

  getAging: protectedProcedure
    .input(
      z.object({
        asOfDate: z.date().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const asOf = input?.asOfDate ?? new Date();

      const customers = await ctx.db.customer.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        include: {
          invoices: {
            where: {
              status: { in: ["ACCEPTED", "SUBMITTED", "READY"] },
              issueDate: { lte: asOf },
            },
            include: {
              payments: {
                select: { amount: true },
              },
            },
          },
        },
      });

      const agingReport = customers.map((customer) => {
        let current = 0;
        let days30 = 0;
        let days60 = 0;
        let days90 = 0;
        let days120Plus = 0;

        for (const invoice of customer.invoices) {
          const totalPaid = invoice.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0
          );
          const outstanding = Number(invoice.grandTotal) - totalPaid;
          if (outstanding <= 0) continue;

          const daysDiff = Math.floor(
            (asOf.getTime() - invoice.issueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysDiff <= 30) current += outstanding;
          else if (daysDiff <= 60) days30 += outstanding;
          else if (daysDiff <= 90) days60 += outstanding;
          else if (daysDiff <= 120) days90 += outstanding;
          else days120Plus += outstanding;
        }

        const total = current + days30 + days60 + days90 + days120Plus;

        return {
          customerId: customer.id,
          customerCode: customer.code,
          customerName: customer.nameAr,
          current,
          days30,
          days60,
          days90,
          days120Plus,
          total,
        };
      }).filter((r) => r.total > 0);

      const totals = agingReport.reduce(
        (acc, r) => ({
          current: acc.current + r.current,
          days30: acc.days30 + r.days30,
          days60: acc.days60 + r.days60,
          days90: acc.days90 + r.days90,
          days120Plus: acc.days120Plus + r.days120Plus,
          total: acc.total + r.total,
        }),
        { current: 0, days30: 0, days60: 0, days90: 0, days120Plus: 0, total: 0 }
      );

      return { customers: agingReport, totals };
    }),

  getStatement: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        fromDate: z.date(),
        toDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { id: input.customerId, tenantId: ctx.tenantId },
      });

      if (!customer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "العميل غير موجود" });
      }

      const invoices = await ctx.db.invoice.findMany({
        where: {
          customerId: input.customerId,
          tenantId: ctx.tenantId,
          issueDate: { gte: input.fromDate, lte: input.toDate },
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
        orderBy: { issueDate: "asc" },
      });

      const payments = await ctx.db.payment.findMany({
        where: {
          tenantId: ctx.tenantId,
          type: "RECEIVED",
          invoice: { customerId: input.customerId },
          date: { gte: input.fromDate, lte: input.toDate },
        },
        orderBy: { date: "asc" },
      });

      // Build statement lines
      type StatementLine = {
        date: Date;
        type: "INVOICE" | "PAYMENT";
        reference: string;
        description: string;
        debit: number;
        credit: number;
        balance: number;
      };

      const lines: StatementLine[] = [];

      for (const inv of invoices) {
        lines.push({
          date: inv.issueDate,
          type: "INVOICE",
          reference: inv.invoiceNumber,
          description: `فاتورة ${inv.invoiceNumber}`,
          debit: Number(inv.grandTotal),
          credit: 0,
          balance: 0,
        });
      }

      for (const pmt of payments) {
        lines.push({
          date: pmt.date,
          type: "PAYMENT",
          reference: pmt.paymentNumber,
          description: `سداد ${pmt.paymentNumber}`,
          debit: 0,
          credit: Number(pmt.amount),
          balance: 0,
        });
      }

      // Sort by date
      lines.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Calculate running balance
      let runningBalance = 0;
      for (const line of lines) {
        runningBalance += line.debit - line.credit;
        line.balance = runningBalance;
      }

      return {
        customer: {
          id: customer.id,
          code: customer.code,
          nameAr: customer.nameAr,
          nameEn: customer.nameEn,
        },
        fromDate: input.fromDate,
        toDate: input.toDate,
        lines,
        closingBalance: runningBalance,
      };
    }),
});

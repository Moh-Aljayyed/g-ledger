import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { submitToETA, cancelETADocument } from "@/server/services/einvoice/eta.service";
import { submitToZATCA, zatcaOnboarding } from "@/server/services/einvoice/zatca.service";
import { nextCounter, formatInvoiceNumber } from "@/server/counter";

const invoiceItemSchema = z.object({
  description: z.string().min(1),
  descriptionEn: z.string().optional(),
  itemCode: z.string().optional(),
  itemCodeType: z.string().optional(),
  internalCode: z.string().optional(),
  unitType: z.string().default("EA"),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
  discountRate: z.number().min(0).max(100).default(0),
  vatRate: z.number().min(0).default(14),
  vatCategory: z.string().default("S"),
  withholdingRate: z.number().min(0).default(0),
  tableTaxRate: z.number().min(0).default(0),
  accountId: z.string().optional(),
});

export const invoicesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "READY", "SUBMITTED", "ACCEPTED", "REJECTED", "CANCELLED"]).optional(),
        type: z.enum(["SALES", "SALES_RETURN", "PURCHASE", "DEBIT_NOTE", "CREDIT_NOTE"]).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.type) where.type = input.type;
      if (input?.fromDate || input?.toDate) {
        where.issueDate = {};
        if (input?.fromDate) where.issueDate.gte = input.fromDate;
        if (input?.toDate) where.issueDate.lte = input.toDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [invoices, total] = await Promise.all([
        ctx.db.invoice.findMany({
          where,
          include: { items: true, submissions: { orderBy: { submittedAt: "desc" }, take: 1 } },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.invoice.count({ where }),
      ]);

      return { invoices, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.invoice.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          items: { orderBy: { lineNumber: "asc" } },
          submissions: { orderBy: { submittedAt: "desc" } },
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["SALES", "SALES_RETURN", "PURCHASE", "DEBIT_NOTE", "CREDIT_NOTE"]),
        issueDate: z.date(),
        supplyDate: z.date().optional(),
        buyerName: z.string().min(1),
        buyerNameEn: z.string().optional(),
        buyerTaxId: z.string().optional(),
        buyerAddress: z.string().optional(),
        buyerCity: z.string().optional(),
        buyerCountry: z.string().optional(),
        buyerType: z.string().optional(),
        currency: z.string().default("EGP"),
        exchangeRate: z.number().default(1),
        notes: z.string().optional(),
        items: z.array(invoiceItemSchema).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Atomic per-tenant counter — race-safe under concurrent invoice creation
      const nextNum = await nextCounter(ctx.db, ctx.tenantId, "INVOICE");
      const invoiceNumber = formatInvoiceNumber(nextNum);

      // Calculate item totals
      const processedItems = input.items.map((item, idx) => {
        const netAmount = item.quantity * item.unitPrice - item.discount;
        const vatAmount = netAmount * (item.vatRate / 100);
        const withholdingAmount = netAmount * (item.withholdingRate / 100);
        const tableTaxAmount = netAmount * (item.tableTaxRate / 100);
        const totalAmount = netAmount + vatAmount + tableTaxAmount;

        return {
          lineNumber: idx + 1,
          description: item.description,
          descriptionEn: item.descriptionEn,
          itemCode: item.itemCode,
          itemCodeType: item.itemCodeType,
          internalCode: item.internalCode,
          unitType: item.unitType,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          discountRate: item.discountRate,
          vatRate: item.vatRate,
          vatAmount,
          vatCategory: item.vatCategory,
          withholdingRate: item.withholdingRate,
          withholdingAmount,
          tableTaxRate: item.tableTaxRate,
          tableTaxAmount,
          netAmount,
          totalAmount,
          accountId: item.accountId,
        };
      });

      const subtotal = processedItems.reduce((sum, i) => sum + i.netAmount, 0);
      const totalVat = processedItems.reduce((sum, i) => sum + i.vatAmount, 0);
      const totalWithholding = processedItems.reduce((sum, i) => sum + i.withholdingAmount, 0);
      const totalTableTax = processedItems.reduce((sum, i) => sum + i.tableTaxAmount, 0);
      const totalDiscount = processedItems.reduce((sum, i) => sum + i.discount, 0);
      const grandTotal = subtotal + totalVat + totalTableTax;

      return ctx.db.invoice.create({
        data: {
          invoiceNumber,
          type: input.type,
          status: "DRAFT",
          issueDate: input.issueDate,
          supplyDate: input.supplyDate,
          buyerName: input.buyerName,
          buyerNameEn: input.buyerNameEn,
          buyerTaxId: input.buyerTaxId,
          buyerAddress: input.buyerAddress,
          buyerCity: input.buyerCity,
          buyerCountry: input.buyerCountry,
          buyerType: input.buyerType,
          currency: input.currency,
          exchangeRate: input.exchangeRate,
          notes: input.notes,
          subtotal,
          totalVat,
          totalWithholding,
          totalTableTax,
          totalDiscount,
          grandTotal,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          items: { create: processedItems },
        },
        include: { items: true },
      });
    }),

  // Submit to tax authority
  submit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });
      if (invoice.status !== "DRAFT" && invoice.status !== "READY" && invoice.status !== "REJECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن إرسال فاتورة بهذه الحالة",
        });
      }

      // Check tax config
      const taxConfig = await ctx.db.taxConfig.findUnique({
        where: { tenantId: ctx.tenantId },
      });

      if (!taxConfig) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "يرجى إعداد تكوين الضرائب أولاً",
        });
      }

      // Submit based on country
      if (taxConfig.country === "EG") {
        return submitToETA(input.id);
      } else if (taxConfig.country === "SA") {
        return submitToZATCA(input.id);
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "الدولة غير مدعومة للفوترة الإلكترونية",
      });
    }),

  // Cancel invoice
  cancel: protectedProcedure
    .input(z.object({ id: z.string(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!invoice) throw new TRPCError({ code: "NOT_FOUND" });

      const taxConfig = await ctx.db.taxConfig.findUnique({
        where: { tenantId: ctx.tenantId },
      });

      if (invoice.status === "ACCEPTED" && taxConfig?.country === "EG") {
        return cancelETADocument(input.id, input.reason);
      }

      // For non-submitted invoices, just update status
      await ctx.db.invoice.update({
        where: { id: input.id },
        data: { status: "CANCELLED" },
      });

      return { success: true };
    }),

  // Tax Settings
  getTaxConfig: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.taxConfig.findUnique({
      where: { tenantId: ctx.tenantId },
    });
  }),

  saveTaxConfig: protectedProcedure
    .input(
      z.object({
        country: z.enum(["EG", "SA"]),
        taxRegistrationNumber: z.string().min(1),
        companyNameAr: z.string().min(1),
        companyNameEn: z.string().optional(),
        branchId: z.string().optional(),
        activityCode: z.string().optional(),
        addressStreet: z.string().optional(),
        addressCity: z.string().optional(),
        addressState: z.string().optional(),
        addressCountry: z.string().optional(),
        addressPostalCode: z.string().optional(),
        addressBuildingNo: z.string().optional(),
        addressAdditionalNo: z.string().optional(),
        addressDistrict: z.string().optional(),
        vatRate: z.number().min(0).max(100),
        // ETA
        etaClientId: z.string().optional(),
        etaClientSecret: z.string().optional(),
        etaSignerSerialNo: z.string().optional(),
        etaSignerPin: z.string().optional(),
        etaEnvironment: z.string().optional(),
        // ZATCA
        zatcaEnvironment: z.string().optional(),
        zatcaOtp: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.taxConfig.upsert({
        where: { tenantId: ctx.tenantId },
        update: input,
        create: { ...input, tenantId: ctx.tenantId },
      });
    }),

  // ZATCA Onboarding
  zatcaOnboard: protectedProcedure
    .input(z.object({ otp: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return zatcaOnboarding(ctx.tenantId, input.otp);
    }),
});

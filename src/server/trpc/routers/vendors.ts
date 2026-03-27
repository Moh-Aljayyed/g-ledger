import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const vendorsRouter = router({
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

      const [vendors, total] = await Promise.all([
        ctx.db.vendor.findMany({
          where,
          orderBy: { code: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.vendor.count({ where }),
      ]);

      return { vendors, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.db.vendor.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          bills: {
            select: {
              id: true,
              billNumber: true,
              grandTotal: true,
              amountPaid: true,
              status: true,
              issueDate: true,
            },
            orderBy: { issueDate: "desc" },
            take: 20,
          },
        },
      });

      if (!vendor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المورد غير موجود" });
      }

      // Calculate outstanding balance
      const billTotals = await ctx.db.bill.aggregate({
        where: {
          vendorId: input.id,
          tenantId: ctx.tenantId,
          status: { in: ["APPROVED", "PARTIALLY_PAID"] },
        },
        _sum: { grandTotal: true, amountPaid: true },
      });

      const totalBilled = Number(billTotals._sum.grandTotal ?? 0);
      const totalPaid = Number(billTotals._sum.amountPaid ?? 0);
      const outstandingBalance = totalBilled - totalPaid;

      return { ...vendor, totalBilled, totalPaid, outstandingBalance };
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
        paymentTerms: z.number().min(0).optional(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.vendor.findFirst({
        where: { tenantId: ctx.tenantId, code: input.code },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "كود المورد مستخدم بالفعل",
        });
      }

      return ctx.db.vendor.create({
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
        paymentTerms: z.number().min(0).optional(),
        isActive: z.boolean().optional(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.vendor.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const billCount = await ctx.db.bill.count({
        where: { vendorId: input.id, tenantId: ctx.tenantId },
      });

      if (billCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف مورد لديه فواتير مشتريات",
        });
      }

      return ctx.db.vendor.delete({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
    }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { nextCounter, formatStockMovementNumber } from "@/server/counter";

export const inventoryRouter = router({
  // ============ PRODUCTS ============

  listProducts: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.category) where.category = input.category;
      if (input?.isActive !== undefined) where.isActive = input.isActive;
      if (input?.search) {
        where.OR = [
          { nameAr: { contains: input.search, mode: "insensitive" } },
          { nameEn: { contains: input.search, mode: "insensitive" } },
          { code: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          orderBy: { code: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      }

      const recentMovements = await ctx.db.stockMovement.findMany({
        where: { productId: input.id, tenantId: ctx.tenantId },
        orderBy: { date: "desc" },
        take: 20,
      });

      return { product, recentMovements };
    }),

  createProduct: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        barcode: z.string().optional(),
        category: z.string().optional(),
        unitType: z.string().default("EA"),
        costPrice: z.number().min(0).default(0),
        sellingPrice: z.number().min(0).default(0),
        minimumStock: z.number().min(0).default(0),
        maximumStock: z.number().min(0).default(0),
        reorderLevel: z.number().min(0).default(0),
        vatRate: z.number().min(0).default(0),
        vatCategory: z.string().optional(),
        trackExpiry: z.boolean().default(false),
        trackBatch: z.boolean().default(false),
        inventoryAccountId: z.string().optional(),
        cogsAccountId: z.string().optional(),
        revenueAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check unique code
      const existing = await ctx.db.product.findFirst({
        where: { tenantId: ctx.tenantId, code: input.code },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "كود المنتج مستخدم بالفعل" });
      }

      return ctx.db.product.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string().min(1).optional(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        barcode: z.string().optional(),
        category: z.string().optional(),
        unitType: z.string().optional(),
        costPrice: z.number().min(0).optional(),
        sellingPrice: z.number().min(0).optional(),
        minimumStock: z.number().min(0).optional(),
        maximumStock: z.number().min(0).optional(),
        reorderLevel: z.number().min(0).optional(),
        vatRate: z.number().min(0).optional(),
        vatCategory: z.string().optional(),
        trackExpiry: z.boolean().optional(),
        trackBatch: z.boolean().optional(),
        inventoryAccountId: z.string().optional(),
        cogsAccountId: z.string().optional(),
        revenueAccountId: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const product = await ctx.db.product.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      }

      // If changing code, check uniqueness
      if (data.code && data.code !== product.code) {
        const codeExists = await ctx.db.product.findFirst({
          where: { tenantId: ctx.tenantId, code: data.code, id: { not: id } },
        });
        if (codeExists) {
          throw new TRPCError({ code: "CONFLICT", message: "كود المنتج مستخدم بالفعل" });
        }
      }

      return ctx.db.product.update({
        where: { id },
        data,
      });
    }),

  deleteProduct: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      }

      const movementCount = await ctx.db.stockMovement.count({
        where: { productId: input.id },
      });
      if (movementCount > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف المنتج لوجود حركات مخزون مرتبطة به",
        });
      }

      await ctx.db.product.delete({ where: { id: input.id } });
      return { success: true };
    }),

  getCategories: protectedProcedure
    .query(async ({ ctx }) => {
      const products = await ctx.db.product.findMany({
        where: { tenantId: ctx.tenantId, category: { not: null } },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      });
      return products.map((p) => p.category).filter(Boolean) as string[];
    }),

  // ============ STOCK MOVEMENTS ============

  listMovements: protectedProcedure
    .input(
      z.object({
        productId: z.string().optional(),
        type: z.enum(["IN", "OUT", "ADJUSTMENT", "TRANSFER", "RETURN_IN", "RETURN_OUT", "OPENING"]).optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.productId) where.productId = input.productId;
      if (input?.type) where.type = input.type;
      if (input?.fromDate || input?.toDate) {
        where.date = {};
        if (input?.fromDate) where.date.gte = input.fromDate;
        if (input?.toDate) where.date.lte = input.toDate;
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;

      const [movements, total] = await Promise.all([
        ctx.db.stockMovement.findMany({
          where,
          include: { product: { select: { code: true, nameAr: true, nameEn: true } } },
          orderBy: { date: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.stockMovement.count({ where }),
      ]);

      return {
        movements,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  addMovement: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        type: z.enum(["IN", "OUT", "ADJUSTMENT", "RETURN_IN", "RETURN_OUT"]),
        date: z.date(),
        quantity: z.number().positive(),
        unitCost: z.number().min(0).default(0),
        batchNumber: z.string().optional(),
        expiryDate: z.date().optional(),
        warehouseFrom: z.string().optional(),
        warehouseTo: z.string().optional(),
        reference: z.string().optional(),
        notes: z.string().optional(),
        counterAccountId: z.string().optional(), // AP/Cash for IN, or adjustment account
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.db.product.findFirst({
        where: { id: input.productId, tenantId: ctx.tenantId },
      });
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
      }

      // Determine stock change direction
      const isIncrease = ["IN", "RETURN_IN"].includes(input.type);
      const isDecrease = ["OUT", "RETURN_OUT"].includes(input.type);
      // For ADJUSTMENT, positive quantity = increase, handled below

      // Validate stock doesn't go negative on OUT/RETURN_OUT
      if (isDecrease) {
        const newStock = Number(product.currentStock) - input.quantity;
        if (newStock < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `الكمية المتاحة (${Number(product.currentStock)}) غير كافية`,
          });
        }
      }

      // Atomic per-tenant counter — race-safe under concurrent stock movements
      const movementNumberValue = await nextCounter(ctx.db, ctx.tenantId, "STOCK_MOVEMENT");
      const movementNumber = formatStockMovementNumber(movementNumberValue);

      const totalCost = input.quantity * input.unitCost;

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

      // Atomic per-tenant counter for journal entries
      const entryNumber = await nextCounter(ctx.db, ctx.tenantId, "JOURNAL_ENTRY");

      const result = await ctx.db.$transaction(async (tx) => {
        // Update product stock
        let stockChange: number;
        if (isIncrease) {
          stockChange = input.quantity;
        } else if (isDecrease) {
          stockChange = -input.quantity;
        } else {
          // ADJUSTMENT: positive = increase stock
          stockChange = input.quantity;
        }

        await tx.product.update({
          where: { id: input.productId },
          data: { currentStock: { increment: stockChange } },
        });

        let journalEntryId: string | null = null;

        // Create journal entry if GL accounts are linked
        const inventoryAccountId = product.inventoryAccountId;
        const cogsAccountId = product.cogsAccountId;
        const counterAccountId = input.counterAccountId;

        if (inventoryAccountId && totalCost > 0) {
          let journalLines: {
            accountId: string;
            debit: number;
            credit: number;
            description: string;
          }[] = [];

          const desc = `${input.type === "IN" ? "شراء مخزون" : input.type === "OUT" ? "صرف مخزون" : input.type === "ADJUSTMENT" ? "تسوية مخزون" : input.type === "RETURN_IN" ? "مرتجع وارد" : "مرتجع صادر"} - ${product.nameAr}`;

          if (input.type === "IN" && counterAccountId) {
            // Dr Inventory, Cr AP/Cash
            journalLines = [
              { accountId: inventoryAccountId, debit: totalCost, credit: 0, description: desc },
              { accountId: counterAccountId, debit: 0, credit: totalCost, description: desc },
            ];
          } else if (input.type === "OUT" && cogsAccountId) {
            // Dr COGS, Cr Inventory
            journalLines = [
              { accountId: cogsAccountId, debit: totalCost, credit: 0, description: desc },
              { accountId: inventoryAccountId, debit: 0, credit: totalCost, description: desc },
            ];
          } else if (input.type === "ADJUSTMENT" && counterAccountId) {
            // Positive adjustment: Dr Inventory, Cr Adjustment account
            // Negative adjustment would use negative quantity (not supported here - quantity is always positive)
            journalLines = [
              { accountId: inventoryAccountId, debit: totalCost, credit: 0, description: desc },
              { accountId: counterAccountId, debit: 0, credit: totalCost, description: desc },
            ];
          } else if (input.type === "RETURN_IN" && counterAccountId) {
            // Dr Inventory, Cr AP/Cash (same as IN)
            journalLines = [
              { accountId: inventoryAccountId, debit: totalCost, credit: 0, description: desc },
              { accountId: counterAccountId, debit: 0, credit: totalCost, description: desc },
            ];
          } else if (input.type === "RETURN_OUT" && cogsAccountId) {
            // Reverse of OUT: Dr Inventory, Cr COGS
            journalLines = [
              { accountId: inventoryAccountId, debit: totalCost, credit: 0, description: desc },
              { accountId: cogsAccountId, debit: 0, credit: totalCost, description: desc },
            ];
          }

          if (journalLines.length > 0) {
            const je = await tx.journalEntry.create({
              data: {
                entryNumber,
                date: input.date,
                description: `حركة مخزون ${movementNumber} - ${product.nameAr}`,
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
        }

        // Create stock movement
        const movement = await tx.stockMovement.create({
          data: {
            movementNumber,
            type: input.type,
            date: input.date,
            productId: input.productId,
            quantity: input.quantity,
            unitCost: input.unitCost,
            totalCost,
            batchNumber: input.batchNumber,
            expiryDate: input.expiryDate,
            warehouseFrom: input.warehouseFrom,
            warehouseTo: input.warehouseTo,
            reference: input.reference,
            notes: input.notes,
            journalEntryId,
            tenantId: ctx.tenantId,
            createdById: ctx.user.id,
          },
        });

        return movement;
      });

      return result;
    }),

  // ============ REPORTS ============

  getStockValuation: protectedProcedure
    .query(async ({ ctx }) => {
      const products = await ctx.db.product.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        select: {
          id: true,
          code: true,
          nameAr: true,
          nameEn: true,
          category: true,
          currentStock: true,
          costPrice: true,
        },
      });

      let totalValue = 0;
      const items = products.map((p) => {
        const value = Number(p.currentStock) * Number(p.costPrice);
        totalValue += value;
        return {
          ...p,
          currentStock: Number(p.currentStock),
          costPrice: Number(p.costPrice),
          value,
        };
      });

      return { items, totalValue };
    }),

  getLowStockAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      // Use raw comparison since Prisma doesn't support field-to-field comparison directly
      const products = await ctx.db.product.findMany({
        where: {
          tenantId: ctx.tenantId,
          isActive: true,
        },
        select: {
          id: true,
          code: true,
          nameAr: true,
          nameEn: true,
          category: true,
          currentStock: true,
          minimumStock: true,
          reorderLevel: true,
        },
      });

      // Filter in JS since Prisma can't compare two fields
      return products.filter(
        (p) => Number(p.currentStock) <= Number(p.reorderLevel) && Number(p.reorderLevel) > 0
      );
    }),

  getExpiringItems: protectedProcedure
    .input(
      z.object({
        days: z.number().min(1).default(30), // 30, 60, or 90
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const days = input?.days ?? 30;
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);

      const movements = await ctx.db.stockMovement.findMany({
        where: {
          tenantId: ctx.tenantId,
          expiryDate: {
            gte: now,
            lte: futureDate,
          },
        },
        include: {
          product: { select: { code: true, nameAr: true, nameEn: true } },
        },
        orderBy: { expiryDate: "asc" },
      });

      return movements;
    }),
});

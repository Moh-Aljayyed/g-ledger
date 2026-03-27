import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const fixedAssetsRouter = router({
  // ============ CRUD ============

  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "FULLY_DEPRECIATED", "DISPOSED", "UNDER_MAINTENANCE"]).optional(),
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.category) where.category = input.category;

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;

      const [assets, total] = await Promise.all([
        ctx.db.fixedAsset.findMany({
          where,
          orderBy: { assetNumber: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.fixedAsset.count({ where }),
      ]);

      return {
        assets,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.fixedAsset.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل الثابت غير موجود" });
      }

      const depreciationHistory = await ctx.db.depreciationEntry.findMany({
        where: { assetId: input.id },
        orderBy: { period: "desc" },
      });

      return { asset, depreciationHistory };
    }),

  create: protectedProcedure
    .input(
      z.object({
        assetNumber: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        serialNumber: z.string().optional(),
        acquisitionDate: z.date(),
        acquisitionCost: z.number().positive(),
        residualValue: z.number().min(0).default(0),
        usefulLifeMonths: z.number().int().positive(),
        depreciationMethod: z.enum(["STRAIGHT_LINE", "DECLINING_BALANCE", "UNITS_OF_PRODUCTION"]).default("STRAIGHT_LINE"),
        assetAccountId: z.string().optional(),
        depreciationAccountId: z.string().optional(),
        accDepreciationAccountId: z.string().optional(),
        counterAccountId: z.string().optional(), // Bank/Cash account for purchase JE
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check unique asset number
      const existing = await ctx.db.fixedAsset.findFirst({
        where: { tenantId: ctx.tenantId, assetNumber: input.assetNumber },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "رقم الأصل مستخدم بالفعل" });
      }

      // Calculate monthly depreciation (straight line)
      const monthlyDepreciation =
        input.depreciationMethod === "STRAIGHT_LINE"
          ? (input.acquisitionCost - input.residualValue) / input.usefulLifeMonths
          : 0;

      // Find fiscal period
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: input.acquisitionDate },
          endDate: { gte: input.acquisitionDate },
          isClosed: false,
        },
      });
      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لتاريخ الاقتناء",
        });
      }

      // Get next journal entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

      const { counterAccountId, ...assetData } = input;

      const result = await ctx.db.$transaction(async (tx) => {
        let journalEntryId: string | undefined;

        // Create journal entry: Dr Asset Account, Cr Bank/Cash
        if (input.assetAccountId && counterAccountId) {
          const desc = `اقتناء أصل ثابت - ${input.nameAr}`;
          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: input.acquisitionDate,
              description: desc,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: new Date(),
              lines: {
                create: [
                  {
                    accountId: input.assetAccountId,
                    debit: input.acquisitionCost,
                    credit: 0,
                    description: desc,
                  },
                  {
                    accountId: counterAccountId,
                    debit: 0,
                    credit: input.acquisitionCost,
                    description: desc,
                  },
                ],
              },
            },
          });
          journalEntryId = je.id;
        }

        const asset = await tx.fixedAsset.create({
          data: {
            assetNumber: assetData.assetNumber,
            nameAr: assetData.nameAr,
            nameEn: assetData.nameEn,
            description: assetData.description,
            category: assetData.category,
            location: assetData.location,
            serialNumber: assetData.serialNumber,
            acquisitionDate: assetData.acquisitionDate,
            acquisitionCost: assetData.acquisitionCost,
            residualValue: assetData.residualValue,
            usefulLifeMonths: assetData.usefulLifeMonths,
            depreciationMethod: assetData.depreciationMethod,
            monthlyDepreciation,
            netBookValue: input.acquisitionCost,
            accumulatedDepreciation: 0,
            assetAccountId: assetData.assetAccountId,
            depreciationAccountId: assetData.depreciationAccountId,
            accDepreciationAccountId: assetData.accDepreciationAccountId,
            tenantId: ctx.tenantId,
          },
        });

        return { asset, journalEntryId };
      });

      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        location: z.string().optional(),
        serialNumber: z.string().optional(),
        assetAccountId: z.string().optional(),
        depreciationAccountId: z.string().optional(),
        accDepreciationAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const asset = await ctx.db.fixedAsset.findFirst({
        where: { id, tenantId: ctx.tenantId },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل الثابت غير موجود" });
      }

      return ctx.db.fixedAsset.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.fixedAsset.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل الثابت غير موجود" });
      }

      if (asset.status !== "ACTIVE") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف أصل غير نشط",
        });
      }

      const depEntries = await ctx.db.depreciationEntry.count({
        where: { assetId: input.id },
      });
      if (depEntries > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف الأصل لوجود قيود إهلاك مرتبطة به",
        });
      }

      await ctx.db.fixedAsset.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ============ DEPRECIATION ============

  runDepreciation: protectedProcedure
    .input(
      z.object({
        period: z.string().regex(/^\d{4}-\d{2}$/, "الصيغة المطلوبة: YYYY-MM"), // e.g. "2026-03"
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [yearStr, monthStr] = input.period.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      // The depreciation date is the last day of the period month
      const depDate = new Date(year, month, 0); // last day of month

      // Find open fiscal period for the depreciation date
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: depDate },
          endDate: { gte: depDate },
          isClosed: false,
        },
      });
      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لهذه الفترة",
        });
      }

      // Find all ACTIVE assets that haven't been depreciated for this period
      const activeAssets = await ctx.db.fixedAsset.findMany({
        where: {
          tenantId: ctx.tenantId,
          status: "ACTIVE",
        },
      });

      // Filter out assets already depreciated for this period
      const alreadyDepreciated = await ctx.db.depreciationEntry.findMany({
        where: {
          tenantId: ctx.tenantId,
          period: input.period,
        },
        select: { assetId: true },
      });
      const depreciatedIds = new Set(alreadyDepreciated.map((d) => d.assetId));

      const eligibleAssets = activeAssets.filter((a) => !depreciatedIds.has(a.id));

      if (eligibleAssets.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد أصول مؤهلة للإهلاك في هذه الفترة",
        });
      }

      // Get next journal entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

      const result = await ctx.db.$transaction(async (tx) => {
        const depreciatedAssets: {
          assetId: string;
          assetNumber: string;
          nameAr: string;
          amount: number;
          newNBV: number;
          fullyDepreciated: boolean;
        }[] = [];

        // Collect journal lines for consolidated entry
        const journalLines: {
          accountId: string;
          debit: number;
          credit: number;
          description: string;
        }[] = [];

        for (const asset of eligibleAssets) {
          const monthlyDep = Number(asset.monthlyDepreciation);
          const currentNBV = Number(asset.netBookValue);
          const residual = Number(asset.residualValue);

          // Don't depreciate beyond residual value
          let depAmount = Math.min(monthlyDep, currentNBV - residual);
          if (depAmount <= 0) continue;

          const newAccumulated = Number(asset.accumulatedDepreciation) + depAmount;
          const newNBV = currentNBV - depAmount;
          const fullyDepreciated = newNBV <= residual;

          // Create depreciation entry
          await tx.depreciationEntry.create({
            data: {
              assetId: asset.id,
              period: input.period,
              date: depDate,
              amount: depAmount,
              accumulatedTotal: newAccumulated,
              netBookValue: newNBV,
              tenantId: ctx.tenantId,
            },
          });

          // Update asset
          await tx.fixedAsset.update({
            where: { id: asset.id },
            data: {
              accumulatedDepreciation: newAccumulated,
              netBookValue: newNBV,
              lastDepreciationDate: depDate,
              status: fullyDepreciated ? "FULLY_DEPRECIATED" : "ACTIVE",
            },
          });

          // Collect journal lines
          if (asset.depreciationAccountId && asset.accDepreciationAccountId) {
            const lineDesc = `إهلاك ${input.period} - ${asset.nameAr}`;
            journalLines.push({
              accountId: asset.depreciationAccountId,
              debit: depAmount,
              credit: 0,
              description: lineDesc,
            });
            journalLines.push({
              accountId: asset.accDepreciationAccountId,
              debit: 0,
              credit: depAmount,
              description: lineDesc,
            });
          }

          depreciatedAssets.push({
            assetId: asset.id,
            assetNumber: asset.assetNumber,
            nameAr: asset.nameAr,
            amount: depAmount,
            newNBV,
            fullyDepreciated,
          });
        }

        let journalEntryId: string | null = null;

        // Create ONE consolidated journal entry
        if (journalLines.length > 0) {
          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: depDate,
              description: `إهلاك الأصول الثابتة - ${input.period}`,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: new Date(),
              lines: { create: journalLines },
            },
          });
          journalEntryId = je.id;

          // Update depreciation entries with journal entry ID
          for (const da of depreciatedAssets) {
            await tx.depreciationEntry.updateMany({
              where: { assetId: da.assetId, period: input.period, tenantId: ctx.tenantId },
              data: { journalEntryId },
            });
          }
        }

        return {
          period: input.period,
          assetsDepreciated: depreciatedAssets.length,
          totalDepreciation: depreciatedAssets.reduce((sum, a) => sum + a.amount, 0),
          journalEntryId,
          details: depreciatedAssets,
        };
      });

      return result;
    }),

  // ============ DISPOSAL ============

  dispose: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        disposalDate: z.date(),
        disposalPrice: z.number().min(0),
        bankAccountId: z.string().optional(), // Bank/Cash account to receive proceeds
      })
    )
    .mutation(async ({ ctx, input }) => {
      const asset = await ctx.db.fixedAsset.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل الثابت غير موجود" });
      }
      if (asset.status === "DISPOSED") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "الأصل تم التخلص منه بالفعل" });
      }

      const nbv = Number(asset.netBookValue);
      const gainLoss = input.disposalPrice - nbv;
      const accDep = Number(asset.accumulatedDepreciation);
      const cost = Number(asset.acquisitionCost);

      // Find fiscal period
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: input.disposalDate },
          endDate: { gte: input.disposalDate },
          isClosed: false,
        },
      });
      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لتاريخ التخلص",
        });
      }

      // Get next journal entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

      const result = await ctx.db.$transaction(async (tx) => {
        let journalEntryId: string | null = null;

        const cashAccountId = input.bankAccountId;
        const assetAccountId = asset.assetAccountId;
        const accDepAccountId = asset.accDepreciationAccountId;

        // Create journal entry for disposal
        // Dr Bank/Cash (disposal price)
        // Dr Accumulated Depreciation (accDep)
        // Cr Asset Account (cost)
        // Dr/Cr Gain/Loss on Disposal (difference)
        if (assetAccountId && accDepAccountId && cashAccountId) {
          const desc = `التخلص من أصل ثابت - ${asset.nameAr}`;
          const journalLines: {
            accountId: string;
            debit: number;
            credit: number;
            description: string;
          }[] = [];

          // Dr Bank/Cash for disposal proceeds
          if (input.disposalPrice > 0) {
            journalLines.push({
              accountId: cashAccountId,
              debit: input.disposalPrice,
              credit: 0,
              description: `متحصلات بيع - ${asset.nameAr}`,
            });
          }

          // Dr Accumulated Depreciation
          if (accDep > 0) {
            journalLines.push({
              accountId: accDepAccountId,
              debit: accDep,
              credit: 0,
              description: `إلغاء مجمع إهلاك - ${asset.nameAr}`,
            });
          }

          // Cr Asset Account (full cost)
          journalLines.push({
            accountId: assetAccountId,
            debit: 0,
            credit: cost,
            description: `إلغاء تكلفة الأصل - ${asset.nameAr}`,
          });

          // Gain/Loss: if disposal price + accDep > cost => gain (credit), else loss (debit)
          // gainLoss = disposalPrice - NBV = disposalPrice - (cost - accDep)
          // To balance: Dr side = disposalPrice + accDep, Cr side = cost + gain (or Dr side + loss = cost)
          if (gainLoss > 0) {
            // Gain: credit the gain/loss account
            // Use cashAccountId as placeholder - in real system would be a gain/loss account
            // The gain balances: Dr(disposalPrice + accDep) = Cr(cost + gain)
            journalLines.push({
              accountId: cashAccountId, // ideally a gain/loss account
              debit: 0,
              credit: gainLoss,
              description: `أرباح بيع أصل - ${asset.nameAr}`,
            });
          } else if (gainLoss < 0) {
            // Loss: debit the gain/loss account
            journalLines.push({
              accountId: cashAccountId, // ideally a gain/loss account
              debit: Math.abs(gainLoss),
              credit: 0,
              description: `خسائر بيع أصل - ${asset.nameAr}`,
            });
          }

          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: input.disposalDate,
              description: desc,
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

        // Update asset status
        const updatedAsset = await tx.fixedAsset.update({
          where: { id: input.id },
          data: {
            status: "DISPOSED",
            disposalDate: input.disposalDate,
            disposalPrice: input.disposalPrice,
            disposalGainLoss: gainLoss,
          },
        });

        return { asset: updatedAsset, gainLoss, journalEntryId };
      });

      return result;
    }),

  // ============ REPORTS ============

  getDepreciationSchedule: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const asset = await ctx.db.fixedAsset.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });
      if (!asset) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الأصل الثابت غير موجود" });
      }

      // Past entries
      const pastEntries = await ctx.db.depreciationEntry.findMany({
        where: { assetId: input.id },
        orderBy: { period: "asc" },
      });

      // Build projected future schedule
      const projectedEntries: {
        period: string;
        amount: number;
        accumulatedTotal: number;
        netBookValue: number;
      }[] = [];

      if (asset.status === "ACTIVE") {
        const monthlyDep = Number(asset.monthlyDepreciation);
        const residual = Number(asset.residualValue);
        let currentNBV = Number(asset.netBookValue);
        let currentAccumulated = Number(asset.accumulatedDepreciation);

        // Determine the starting month for projections
        let startDate: Date;
        if (asset.lastDepreciationDate) {
          startDate = new Date(asset.lastDepreciationDate);
          startDate.setMonth(startDate.getMonth() + 1);
        } else {
          startDate = new Date(asset.acquisitionDate);
          startDate.setMonth(startDate.getMonth() + 1);
        }

        // Project until fully depreciated (max 600 months safety cap)
        for (let i = 0; i < 600 && currentNBV > residual; i++) {
          const depAmount = Math.min(monthlyDep, currentNBV - residual);
          if (depAmount <= 0) break;

          currentAccumulated += depAmount;
          currentNBV -= depAmount;

          const periodYear = startDate.getFullYear();
          const periodMonth = String(startDate.getMonth() + 1).padStart(2, "0");

          projectedEntries.push({
            period: `${periodYear}-${periodMonth}`,
            amount: depAmount,
            accumulatedTotal: currentAccumulated,
            netBookValue: currentNBV,
          });

          startDate.setMonth(startDate.getMonth() + 1);
        }
      }

      return {
        asset,
        pastEntries,
        projectedEntries,
      };
    }),

  getSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const assets = await ctx.db.fixedAsset.findMany({
        where: { tenantId: ctx.tenantId },
        select: {
          id: true,
          status: true,
          category: true,
          acquisitionCost: true,
          accumulatedDepreciation: true,
          netBookValue: true,
        },
      });

      let totalAssets = assets.length;
      let totalCost = 0;
      let totalAccumulatedDepreciation = 0;
      let totalNBV = 0;
      const byCategory: Record<
        string,
        { count: number; totalCost: number; totalAccDep: number; totalNBV: number }
      > = {};
      const byStatus: Record<string, number> = {};

      for (const asset of assets) {
        const cost = Number(asset.acquisitionCost);
        const accDep = Number(asset.accumulatedDepreciation);
        const nbv = Number(asset.netBookValue);

        totalCost += cost;
        totalAccumulatedDepreciation += accDep;
        totalNBV += nbv;

        // By status
        byStatus[asset.status] = (byStatus[asset.status] || 0) + 1;

        // By category
        const cat = asset.category || "غير مصنف";
        if (!byCategory[cat]) {
          byCategory[cat] = { count: 0, totalCost: 0, totalAccDep: 0, totalNBV: 0 };
        }
        byCategory[cat].count++;
        byCategory[cat].totalCost += cost;
        byCategory[cat].totalAccDep += accDep;
        byCategory[cat].totalNBV += nbv;
      }

      return {
        totalAssets,
        totalCost,
        totalAccumulatedDepreciation,
        totalNBV,
        byStatus,
        byCategory,
      };
    }),
});

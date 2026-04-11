import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

/**
 * Loyalty program — per-tenant points system.
 *
 * Rules of thumb:
 *   - Earn N points per 1 currency unit spent (pointsPerUnit, default 1)
 *   - 1 point is worth M currency units on redemption (redeemValue, default 0.01)
 *   - Customers must have at least `minRedeemPoints` to cash any points
 *   - Tier (STANDARD/SILVER/GOLD/PLATINUM) is recomputed from totalEarned
 *     on every earn/redeem
 */

function computeTier(totalEarned: number, s: { silverThreshold: number; goldThreshold: number; platinumThreshold: number }): string {
  if (totalEarned >= s.platinumThreshold) return "PLATINUM";
  if (totalEarned >= s.goldThreshold) return "GOLD";
  if (totalEarned >= s.silverThreshold) return "SILVER";
  return "STANDARD";
}

export const loyaltyRouter = router({
  // ============ SETTINGS ============
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const existing = await ctx.db.loyaltySettings.findUnique({
      where: { tenantId: ctx.tenantId },
    });
    if (existing) return existing;
    // Auto-create defaults on first read
    return ctx.db.loyaltySettings.create({
      data: { tenantId: ctx.tenantId },
    });
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean().optional(),
        pointsPerUnit: z.number().min(0).optional(),
        redeemValue: z.number().min(0).optional(),
        minRedeemPoints: z.number().min(0).optional(),
        silverThreshold: z.number().min(0).optional(),
        goldThreshold: z.number().min(0).optional(),
        platinumThreshold: z.number().min(0).optional(),
        expiryDays: z.number().min(0).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.loyaltySettings.upsert({
        where: { tenantId: ctx.tenantId },
        create: { tenantId: ctx.tenantId, ...input },
        update: input,
      });
    }),

  // ============ ACCOUNT LOOKUP ============
  getAccountByCustomer: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { id: input.customerId, tenantId: ctx.tenantId },
        select: { id: true, nameAr: true, nameEn: true, phone: true },
      });
      if (!customer) throw new TRPCError({ code: "NOT_FOUND" });

      let account = await ctx.db.loyaltyAccount.findUnique({
        where: { customerId: input.customerId },
      });
      if (!account) {
        account = await ctx.db.loyaltyAccount.create({
          data: { customerId: input.customerId, tenantId: ctx.tenantId },
        });
      }
      return { customer, account };
    }),

  lookupByPhone: protectedProcedure
    .input(z.object({ phone: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const customer = await ctx.db.customer.findFirst({
        where: { tenantId: ctx.tenantId, phone: { contains: input.phone } },
        select: { id: true, nameAr: true, phone: true, loyalty: true },
      });
      if (!customer) return null;
      if (!customer.loyalty) {
        const acc = await ctx.db.loyaltyAccount.create({
          data: { customerId: customer.id, tenantId: ctx.tenantId },
        });
        return { customer, account: acc };
      }
      return { customer, account: customer.loyalty };
    }),

  // ============ EARN POINTS ============
  earn: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        amount: z.number().min(0), // invoice grand total
        invoiceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.db.loyaltySettings.findUnique({
        where: { tenantId: ctx.tenantId },
      });
      if (!settings || !settings.enabled) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "نظام الولاء غير مفعّل" });
      }

      const points = Math.floor(input.amount * Number(settings.pointsPerUnit));
      if (points <= 0) return null;

      let account = await ctx.db.loyaltyAccount.findUnique({
        where: { customerId: input.customerId },
      });
      if (!account) {
        account = await ctx.db.loyaltyAccount.create({
          data: { customerId: input.customerId, tenantId: ctx.tenantId },
        });
      }

      const newTotalEarned = account.totalEarned + points;
      const newBalance = account.balance + points;
      const newTier = computeTier(newTotalEarned, settings);

      const updated = await ctx.db.loyaltyAccount.update({
        where: { id: account.id },
        data: { balance: newBalance, totalEarned: newTotalEarned, tier: newTier },
      });

      await ctx.db.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: "EARN",
          points,
          invoiceId: input.invoiceId,
          notes: `Earned from invoice ${input.amount.toFixed(2)}`,
        },
      });

      return { account: updated, pointsEarned: points };
    }),

  // ============ REDEEM POINTS ============
  redeem: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        points: z.number().positive(),
        invoiceId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.db.loyaltySettings.findUnique({
        where: { tenantId: ctx.tenantId },
      });
      if (!settings || !settings.enabled) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "نظام الولاء غير مفعّل" });
      }
      if (input.points < settings.minRedeemPoints) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `الحد الأدنى للاستبدال ${settings.minRedeemPoints} نقطة`,
        });
      }

      const account = await ctx.db.loyaltyAccount.findUnique({
        where: { customerId: input.customerId },
      });
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد حساب ولاء" });
      if (account.balance < input.points) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "رصيد النقاط غير كافٍ" });
      }

      const discount = input.points * Number(settings.redeemValue);

      const updated = await ctx.db.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balance: account.balance - input.points,
          totalRedeemed: account.totalRedeemed + input.points,
        },
      });

      await ctx.db.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: "REDEEM",
          points: -input.points,
          invoiceId: input.invoiceId,
          notes: `Redeemed for ${discount.toFixed(2)} discount`,
        },
      });

      return { account: updated, discountAmount: discount };
    }),

  // ============ MANUAL ADJUSTMENT ============
  adjust: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        points: z.number().int(),
        reason: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.db.loyaltyAccount.findUnique({
        where: { customerId: input.customerId },
      });
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });

      const newBalance = Math.max(0, account.balance + input.points);
      const updated = await ctx.db.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balance: newBalance,
          ...(input.points > 0 && { totalEarned: account.totalEarned + input.points }),
        },
      });

      await ctx.db.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: "ADJUST",
          points: input.points,
          notes: input.reason,
        },
      });

      return updated;
    }),

  // ============ HISTORY ============
  listTransactions: protectedProcedure
    .input(z.object({ customerId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.loyaltyAccount.findUnique({
        where: { customerId: input.customerId },
      });
      if (!account) return [];
      return ctx.db.loyaltyTransaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // ============ LEADERBOARD (top customers) ============
  topCustomers: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.loyaltyAccount.findMany({
        where: { tenantId: ctx.tenantId },
        include: {
          customer: { select: { nameAr: true, phone: true } },
        },
        orderBy: { totalEarned: "desc" },
        take: input?.limit ?? 20,
      });
    }),
});

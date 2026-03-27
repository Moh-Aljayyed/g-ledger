import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

// Plans configuration
const PLANS = {
  FREE_TRIAL: {
    nameAr: "تجربة مجانية",
    nameEn: "Free Trial",
    storageMB: 512,
    maxUsers: 3,
    maxInvoicesPerMonth: 100,
    pricePerGbUsd: 8,
    monthlyPriceUsd: 0,
    durationDays: 365,
  },
  BASIC: {
    nameAr: "أساسي",
    nameEn: "Basic",
    storageMB: 5120, // 5 GB
    maxUsers: 5,
    maxInvoicesPerMonth: 500,
    pricePerGbUsd: 6,
    monthlyPriceUsd: 29,
    durationDays: 0, // unlimited
  },
  PROFESSIONAL: {
    nameAr: "احترافي",
    nameEn: "Professional",
    storageMB: 20480, // 20 GB
    maxUsers: 15,
    maxInvoicesPerMonth: 2000,
    pricePerGbUsd: 4,
    monthlyPriceUsd: 79,
    durationDays: 0,
  },
  ENTERPRISE: {
    nameAr: "مؤسسي",
    nameEn: "Enterprise",
    storageMB: 102400, // 100 GB
    maxUsers: 999,
    maxInvoicesPerMonth: 999999,
    pricePerGbUsd: 2,
    monthlyPriceUsd: 199,
    durationDays: 0,
  },
};

export const subscriptionRouter = router({
  // Get current subscription & usage
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    let subscription = await ctx.db.subscription.findUnique({
      where: { tenantId: ctx.tenantId },
    });

    // Auto-create if not exists
    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 365);

      subscription = await ctx.db.subscription.create({
        data: {
          tenantId: ctx.tenantId,
          plan: "FREE_TRIAL",
          status: "ACTIVE",
          trialStartDate: now,
          trialEndDate: trialEnd,
          storageLimit: BigInt(536870912), // 512 MB
          storageUsed: BigInt(0),
          maxUsers: 3,
          maxInvoices: 100,
        },
      });
    }

    // Calculate actual storage usage
    const [usersCount, accountsCount, entriesCount, invoicesCount, linesCount] = await Promise.all([
      ctx.db.user.count({ where: { tenantId: ctx.tenantId } }),
      ctx.db.account.count({ where: { tenantId: ctx.tenantId } }),
      ctx.db.journalEntry.count({ where: { tenantId: ctx.tenantId } }),
      ctx.db.invoice.count({ where: { tenantId: ctx.tenantId } }),
      ctx.db.journalLine.count({ where: { journalEntry: { tenantId: ctx.tenantId } } }),
    ]);

    // Estimate storage (rough calculation: ~500 bytes per record)
    const estimatedBytes = (accountsCount * 300 + entriesCount * 500 + invoicesCount * 800 + linesCount * 200) || 0;

    // Update storage used
    await ctx.db.subscription.update({
      where: { tenantId: ctx.tenantId },
      data: { storageUsed: BigInt(estimatedBytes) },
    });

    const storageLimitMB = Number(subscription.storageLimit) / (1024 * 1024);
    const storageUsedMB = estimatedBytes / (1024 * 1024);
    const usagePercent = storageLimitMB > 0 ? Math.min(100, (storageUsedMB / storageLimitMB) * 100) : 0;

    // Check trial expiry
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpired = subscription.plan === "FREE_TRIAL" && daysRemaining <= 0;

    // Plan info
    const planConfig = PLANS[subscription.plan];

    return {
      plan: subscription.plan,
      planNameAr: planConfig.nameAr,
      planNameEn: planConfig.nameEn,
      status: isExpired ? "EXPIRED" : subscription.status,

      // Storage
      storageLimitMB,
      storageUsedMB: Math.round(storageUsedMB * 100) / 100,
      storagePercent: Math.round(usagePercent * 10) / 10,

      // Limits
      maxUsers: subscription.maxUsers,
      currentUsers: usersCount,
      maxInvoicesPerMonth: subscription.maxInvoices,
      invoicesThisMonth: subscription.invoicesThisMonth,

      // Trial
      daysRemaining,
      trialEndDate: subscription.trialEndDate,
      isExpired,

      // Pricing
      pricePerGbUsd: Number(subscription.pricePerGbUsd),
      monthlyPriceUsd: Number(subscription.monthlyPriceUsd),

      // Warnings
      showWarning50: usagePercent >= 50 && usagePercent < 80,
      showWarning80: usagePercent >= 80 && usagePercent < 95,
      showWarning95: usagePercent >= 95,

      // Records
      totalRecords: accountsCount + entriesCount + invoicesCount + linesCount,
    };
  }),

  // Get plans for upgrade
  getPlans: protectedProcedure.query(() => {
    return Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      ...plan,
    }));
  }),

  // Upgrade plan (placeholder - would integrate with payment gateway)
  upgradePlan: protectedProcedure
    .input(z.object({
      plan: z.enum(["BASIC", "PROFESSIONAL", "ENTERPRISE"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const planConfig = PLANS[input.plan];

      await ctx.db.subscription.update({
        where: { tenantId: ctx.tenantId },
        data: {
          plan: input.plan,
          status: "ACTIVE",
          storageLimit: BigInt(planConfig.storageMB * 1024 * 1024),
          maxUsers: planConfig.maxUsers,
          maxInvoices: planConfig.maxInvoicesPerMonth,
          monthlyPriceUsd: planConfig.monthlyPriceUsd,
          pricePerGbUsd: planConfig.pricePerGbUsd,
        },
      });

      return { success: true, plan: input.plan };
    }),

  // Buy extra storage
  buyStorage: protectedProcedure
    .input(z.object({ gbAmount: z.number().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { tenantId: ctx.tenantId },
      });

      if (!subscription) throw new Error("لا يوجد اشتراك");

      const additionalBytes = BigInt(input.gbAmount * 1024 * 1024 * 1024);
      const cost = input.gbAmount * Number(subscription.pricePerGbUsd);

      await ctx.db.subscription.update({
        where: { tenantId: ctx.tenantId },
        data: {
          storageLimit: subscription.storageLimit + additionalBytes,
          warning50Sent: false,
          warning80Sent: false,
          warning95Sent: false,
        },
      });

      return {
        success: true,
        addedGB: input.gbAmount,
        costUsd: cost,
        newLimitMB: Number(subscription.storageLimit + additionalBytes) / (1024 * 1024),
      };
    }),
});

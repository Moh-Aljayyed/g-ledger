import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

/**
 * Subscription & Usage System
 *
 * Free Trial: 100,000 KB (~97.6 MB) for 6 months
 * After trial: must subscribe at $10/GB/month
 *
 * Discount tiers:
 * - 1 GB: $10/month (base)
 * - 2-10 GB: 2% discount per additional GB
 * - 11-20 GB: 1% discount per additional GB
 * - 21-50 GB: no additional discount (stays at accumulated rate)
 * - 50+ GB: no further discount
 *
 * Warnings: at 50%, then every 10% (60%, 70%, 80%, 90%, 100%)
 * Block: at 100% usage - cannot perform operations until subscription/upgrade
 */

const FREE_TRIAL_KB = 100000; // 100,000 KB
const FREE_TRIAL_DAYS = 180; // 6 months
const BASE_PRICE_PER_GB = 10; // $10/GB/month
const MAX_USERS_FREE = 3;
const MAX_USERS_PAID = 999;

// Calculate price per GB with tiered discounts
function calculateGBPrice(gbNumber: number): number {
  if (gbNumber <= 1) return BASE_PRICE_PER_GB;

  let totalDiscount = 0;

  if (gbNumber <= 10) {
    // 2% discount per additional GB (GB 2-10)
    totalDiscount = (gbNumber - 1) * 2;
  } else if (gbNumber <= 20) {
    // First 9 extra GBs at 2% each = 18%
    // Then 1% per additional GB (GB 11-20)
    totalDiscount = 9 * 2 + (gbNumber - 10) * 1;
  } else {
    // Max discount: 9*2 + 10*1 = 28%
    totalDiscount = 9 * 2 + 10 * 1;
  }

  // Cap discount at 28%
  totalDiscount = Math.min(totalDiscount, 28);

  return Math.round(BASE_PRICE_PER_GB * (1 - totalDiscount / 100) * 100) / 100;
}

// Calculate total monthly cost for given GB
function calculateMonthlyCost(totalGB: number): { totalCost: number; perGBPrice: number; discount: number } {
  if (totalGB <= 0) return { totalCost: 0, perGBPrice: BASE_PRICE_PER_GB, discount: 0 };

  let totalCost = 0;
  for (let gb = 1; gb <= totalGB; gb++) {
    totalCost += calculateGBPrice(gb);
  }

  const perGBPrice = Math.round((totalCost / totalGB) * 100) / 100;
  const fullPrice = totalGB * BASE_PRICE_PER_GB;
  const discount = Math.round(((fullPrice - totalCost) / fullPrice) * 100 * 10) / 10;

  return { totalCost: Math.round(totalCost * 100) / 100, perGBPrice, discount };
}

export const subscriptionRouter = router({
  // Get current subscription & usage
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    let subscription = await ctx.db.subscription.findUnique({
      where: { tenantId: ctx.tenantId },
    });

    // Auto-create free trial if not exists
    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + FREE_TRIAL_DAYS);

      subscription = await ctx.db.subscription.create({
        data: {
          tenantId: ctx.tenantId,
          plan: "FREE_TRIAL",
          status: "ACTIVE",
          trialStartDate: now,
          trialEndDate: trialEnd,
          storageLimit: BigInt(FREE_TRIAL_KB * 1024), // Convert KB to bytes
          storageUsed: BigInt(0),
          maxUsers: MAX_USERS_FREE,
          maxInvoices: 50,
          pricePerGbUsd: BASE_PRICE_PER_GB,
          monthlyPriceUsd: 0,
        },
      });
    }

    // Calculate actual storage usage from records
    const [usersCount, accountsCount, entriesCount, invoicesCount, linesCount,
           customersCount, vendorsCount, billsCount, employeesCount, productsCount] =
      await Promise.all([
        ctx.db.user.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.account.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.journalEntry.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.invoice.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.journalLine.count({ where: { journalEntry: { tenantId: ctx.tenantId } } }),
        ctx.db.customer.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.vendor.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.bill.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.employee.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.product.count({ where: { tenantId: ctx.tenantId } }),
      ]);

    // Estimate storage in bytes (~average bytes per record type)
    const estimatedBytes =
      accountsCount * 400 +
      entriesCount * 600 +
      invoicesCount * 1000 +
      linesCount * 250 +
      customersCount * 500 +
      vendorsCount * 500 +
      billsCount * 800 +
      employeesCount * 600 +
      productsCount * 500;

    // Update storage used
    await ctx.db.subscription.update({
      where: { tenantId: ctx.tenantId },
      data: { storageUsed: BigInt(estimatedBytes) },
    });

    const storageLimitKB = Number(subscription.storageLimit) / 1024;
    const storageUsedKB = estimatedBytes / 1024;
    const storageLimitMB = storageLimitKB / 1024;
    const storageUsedMB = storageUsedKB / 1024;
    const usagePercent = storageLimitKB > 0 ? Math.min(100, (storageUsedKB / storageLimitKB) * 100) : 0;

    // Check trial expiry
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil(
      (subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    ));
    const isTrialExpired = subscription.plan === "FREE_TRIAL" && daysRemaining <= 0;
    const isStorageFull = usagePercent >= 100;
    const isBlocked = isTrialExpired || isStorageFull;

    // Warning level (50%, 60%, 70%, 80%, 90%, 100%)
    let warningLevel = 0;
    if (usagePercent >= 100) warningLevel = 100;
    else if (usagePercent >= 90) warningLevel = 90;
    else if (usagePercent >= 80) warningLevel = 80;
    else if (usagePercent >= 70) warningLevel = 70;
    else if (usagePercent >= 60) warningLevel = 60;
    else if (usagePercent >= 50) warningLevel = 50;

    // Warning message
    let warningMessage = "";
    if (isBlocked && isStorageFull) {
      warningMessage = "تم استهلاك كامل المساحة المتاحة. يرجى الاشتراك أو ترقية الباقة لمتابعة العمل.";
    } else if (isBlocked && isTrialExpired) {
      warningMessage = "انتهت الفترة التجريبية. يرجى الاشتراك لمتابعة العمل.";
    } else if (warningLevel >= 50) {
      warningMessage = `تنبيه: استهلكت ${Math.round(usagePercent)}% من المساحة المتاحة. يمكنك الترقية لمساحة أكبر.`;
    }

    return {
      plan: subscription.plan,
      planNameAr: subscription.plan === "FREE_TRIAL" ? "تجربة مجانية" : "مشترك",
      planNameEn: subscription.plan === "FREE_TRIAL" ? "Free Trial" : "Subscribed",
      status: isBlocked ? "BLOCKED" : subscription.status,

      // Storage in KB (as requested)
      storageLimitKB: Math.round(storageLimitKB),
      storageUsedKB: Math.round(storageUsedKB),
      storageLimitMB: Math.round(storageLimitMB * 100) / 100,
      storageUsedMB: Math.round(storageUsedMB * 100) / 100,
      storagePercent: Math.round(usagePercent * 10) / 10,

      // Limits
      maxUsers: subscription.maxUsers,
      currentUsers: usersCount,

      // Trial
      daysRemaining,
      trialEndDate: subscription.trialEndDate,
      isTrialExpired,
      isStorageFull,
      isBlocked,

      // Warnings
      warningLevel,
      warningMessage,

      // Employee pricing: $2/month per active employee
      employeeCount: employeesCount,
      employeeMonthlyCost: employeesCount * 2,

      // Pricing
      pricePerGbUsd: BASE_PRICE_PER_GB,
      monthlyPriceUsd: Number(subscription.monthlyPriceUsd),
      totalMonthlyCost: Number(subscription.monthlyPriceUsd) + (employeesCount * 2),

      // Records breakdown
      totalRecords: accountsCount + entriesCount + invoicesCount + linesCount +
                    customersCount + vendorsCount + billsCount + employeesCount + productsCount,
      records: {
        accounts: accountsCount,
        entries: entriesCount,
        invoices: invoicesCount,
        lines: linesCount,
        customers: customersCount,
        vendors: vendorsCount,
        bills: billsCount,
        employees: employeesCount,
        products: productsCount,
      },
    };
  }),

  // Check if operation is allowed (call before any create/update)
  checkAllowed: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await ctx.db.subscription.findUnique({
      where: { tenantId: ctx.tenantId },
    });

    if (!subscription) return { allowed: true };

    const now = new Date();
    const daysRemaining = Math.ceil(
      (subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isTrialExpired = subscription.plan === "FREE_TRIAL" && daysRemaining <= 0;
    const storageUsed = Number(subscription.storageUsed);
    const storageLimit = Number(subscription.storageLimit);
    const isStorageFull = storageUsed >= storageLimit;

    if (isTrialExpired) {
      return {
        allowed: false,
        reason: "TRIAL_EXPIRED",
        message: "انتهت الفترة التجريبية. يرجى الاشتراك لمتابعة العمل.",
      };
    }

    if (isStorageFull) {
      return {
        allowed: false,
        reason: "STORAGE_FULL",
        message: "تم استهلاك كامل المساحة. يرجى الترقية لمتابعة العمل.",
      };
    }

    return { allowed: true };
  }),

  // Get pricing calculator
  getPricing: protectedProcedure
    .input(z.object({ gbAmount: z.number().min(1).max(100) }).optional())
    .query(({ input }) => {
      const tiers = [];
      for (let gb = 1; gb <= 50; gb++) {
        const pricing = calculateMonthlyCost(gb);
        tiers.push({
          gb,
          pricePerGB: calculateGBPrice(gb),
          totalMonthly: pricing.totalCost,
          averagePerGB: pricing.perGBPrice,
          discount: pricing.discount,
        });
      }

      const requested = input?.gbAmount
        ? calculateMonthlyCost(input.gbAmount)
        : null;

      return { tiers, requested };
    }),

  // Subscribe / Buy storage
  subscribe: protectedProcedure
    .input(z.object({
      gbAmount: z.number().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { tenantId: ctx.tenantId },
      });

      if (!subscription) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد اشتراك" });

      const pricing = calculateMonthlyCost(input.gbAmount);
      const newLimitBytes = BigInt(input.gbAmount * 1024 * 1024 * 1024);

      await ctx.db.subscription.update({
        where: { tenantId: ctx.tenantId },
        data: {
          plan: "BASIC", // Upgrade from FREE_TRIAL
          status: "ACTIVE",
          storageLimit: newLimitBytes,
          maxUsers: MAX_USERS_PAID,
          maxInvoices: 999999,
          monthlyPriceUsd: pricing.totalCost,
          pricePerGbUsd: pricing.perGBPrice,
          // Reset trial end far into the future
          trialEndDate: new Date(2099, 11, 31),
          // Reset warnings
          warning50Sent: false,
          warning80Sent: false,
          warning95Sent: false,
        },
      });

      return {
        success: true,
        gbAmount: input.gbAmount,
        monthlyCost: pricing.totalCost,
        perGBPrice: pricing.perGBPrice,
        discount: pricing.discount,
        newLimitKB: input.gbAmount * 1024 * 1024,
      };
    }),

  // Add extra storage to existing subscription
  addStorage: protectedProcedure
    .input(z.object({ extraGB: z.number().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await ctx.db.subscription.findUnique({
        where: { tenantId: ctx.tenantId },
      });

      if (!subscription) throw new TRPCError({ code: "NOT_FOUND" });
      if (subscription.plan === "FREE_TRIAL") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "يرجى الاشتراك أولاً" });
      }

      const currentGB = Number(subscription.storageLimit) / (1024 * 1024 * 1024);
      const newTotalGB = Math.round(currentGB + input.extraGB);
      const pricing = calculateMonthlyCost(newTotalGB);

      await ctx.db.subscription.update({
        where: { tenantId: ctx.tenantId },
        data: {
          storageLimit: BigInt(newTotalGB * 1024 * 1024 * 1024),
          monthlyPriceUsd: pricing.totalCost,
          pricePerGbUsd: pricing.perGBPrice,
          warning50Sent: false,
          warning80Sent: false,
          warning95Sent: false,
        },
      });

      return {
        success: true,
        newTotalGB: newTotalGB,
        monthlyCost: pricing.totalCost,
        perGBPrice: pricing.perGBPrice,
        discount: pricing.discount,
      };
    }),
});

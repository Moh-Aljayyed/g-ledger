import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const referralRouter = router({
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.tenant.findUnique({ where: { id: ctx.tenantId } });
    if (!tenant?.referralCode) {
      // Generate unique referral code
      const code = `GL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await ctx.db.tenant.update({ where: { id: ctx.tenantId }, data: { referralCode: code } });
      return { code, referrals: 0, totalRewardKB: 0 };
    }
    // Count referrals
    const referrals = await ctx.db.tenant.count({ where: { referredBy: tenant.referralCode } });
    return { code: tenant.referralCode, referrals, totalRewardKB: referrals * 10000 };
  }),

  applyCode: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findUnique({ where: { id: ctx.tenantId } });
      if (tenant?.referredBy) throw new Error("تم استخدام كود إحالة مسبقاً");
      if (tenant?.referralCode === input.code) throw new Error("لا يمكنك استخدام كودك الخاص");

      // Validate code exists
      const referrer = await ctx.db.tenant.findUnique({ where: { referralCode: input.code } });
      if (!referrer) throw new Error("كود الإحالة غير صالح");

      // Apply referral
      await ctx.db.tenant.update({ where: { id: ctx.tenantId }, data: { referredBy: input.code } });

      // Reward the referrer: +10,000 KB to their storage
      const referrerSub = await ctx.db.subscription.findUnique({ where: { tenantId: referrer.id } });
      if (referrerSub) {
        await ctx.db.subscription.update({
          where: { tenantId: referrer.id },
          data: { storageLimit: referrerSub.storageLimit + BigInt(10000 * 1024) }, // 10,000 KB
        });
      }

      return { success: true, message: "تم تطبيق كود الإحالة! المُحيل حصل على 10,000 KB إضافية" };
    }),
});

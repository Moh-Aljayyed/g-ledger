import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { sendEmailOTP } from "@/server/services/otp.service";

export const usersRouter = router({
  // List users in my tenant
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: { tenantId: ctx.tenantId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Invite a new user to tenant
  invite: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(2),
      role: z.enum(["ADMIN", "ACCOUNTANT", "VIEWER"]),
      password: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check subscription user limit
      const sub = await ctx.db.subscription.findUnique({ where: { tenantId: ctx.tenantId } });
      const currentUsers = await ctx.db.user.count({ where: { tenantId: ctx.tenantId } });
      if (sub && currentUsers >= sub.maxUsers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `الحد الأقصى للمستخدمين ${sub.maxUsers}. يرجى ترقية الباقة.` });
      }

      // Check email uniqueness
      const existing = await ctx.db.user.findUnique({ where: { email: input.email } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "البريد الإلكتروني مسجل بالفعل" });

      const passwordHash = await bcrypt.hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          passwordHash,
          tenantId: ctx.tenantId,
        },
      });

      // Send welcome email
      try {
        await sendEmailOTP(input.email);
      } catch {}

      return { success: true, userId: user.id };
    }),

  // Remove user from tenant
  remove: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({ where: { id: input.userId, tenantId: ctx.tenantId } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.role === "OWNER") throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن حذف المالك" });

      await ctx.db.user.delete({ where: { id: input.userId } });
      return { success: true };
    }),

  // Change user role
  changeRole: protectedProcedure
    .input(z.object({ userId: z.string(), role: z.enum(["ADMIN", "ACCOUNTANT", "VIEWER"]) }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({ where: { id: input.userId, tenantId: ctx.tenantId } });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (user.role === "OWNER") throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن تغيير صلاحية المالك" });

      await ctx.db.user.update({ where: { id: input.userId }, data: { role: input.role } });
      return { success: true };
    }),
});

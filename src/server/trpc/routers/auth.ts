import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "@/server/db";
import { provisionChartOfAccounts } from "@/server/services/chart-of-accounts.service";
import { COUNTRIES, getVatRate } from "@/config/tax/countries";
import { sendEmailOTP, sendWhatsAppOTP, verifyOTP } from "@/server/services/otp.service";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  businessName: z.string().min(2),
  sector: z.enum([
    "INDUSTRIAL", "COMMERCIAL", "SERVICES", "BANKING", "INSURANCE",
    "REAL_ESTATE", "CONTRACTING", "AGRICULTURAL", "TECHNOLOGY",
    "NON_PROFIT", "CROWDFUNDING", "MEDICAL_HOSPITAL", "MEDICAL_PHARMACY",
    "MEDICAL_CLINIC", "MEDICAL_LAB",
  ]),
  country: z.string().default("SA"),
  registrationNumber: z.string().optional(),
  currency: z.string().optional(),
  locale: z.string().default("ar"),
});

export const authRouter = router({
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const existing = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error("البريد الإلكتروني مسجل بالفعل");
    }

    // Check duplicate registration number (tax ID / CR)
    if (input.registrationNumber) {
      const existingReg = await db.tenant.findFirst({
        where: { registrationNumber: input.registrationNumber },
      });
      if (existingReg) throw new Error("رقم السجل التجاري / الرقم الضريبي مسجل بالفعل");
    }

    // Get country config
    const countryConfig = COUNTRIES[input.country];
    const currency = input.currency || countryConfig?.currency || "SAR";
    const vatRate = getVatRate(input.country, input.sector);

    const passwordHash = await bcrypt.hash(input.password, 12);

    // Generate unique slug from business name
    const baseSlug = input.businessName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 25)
      .replace(/-$/, '') || 'company';

    // Ensure uniqueness by appending random suffix
    const suffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${suffix}`;

    const result = await db.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: input.businessName,
          slug,
          sector: input.sector,
          country: input.country,
          currency,
          vatRate,
          registrationNumber: input.registrationNumber,
          locale: input.locale,
        },
      });

      // Create user as owner
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });

      // Create default fiscal period (current year)
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31);

      await tx.fiscalPeriod.create({
        data: {
          name: `${now.getFullYear()}`,
          startDate: yearStart,
          endDate: yearEnd,
          tenantId: tenant.id,
        },
      });

      return { tenant, user };
    });

    // Provision chart of accounts from sector template
    await provisionChartOfAccounts(result.tenant.id, input.sector);

    return {
      success: true,
      tenantId: result.tenant.id,
      userId: result.user.id,
    };
  }),

  // Send OTP via email
  sendEmailOTP: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return sendEmailOTP(input.email);
    }),

  // Send OTP via WhatsApp
  sendWhatsAppOTP: publicProcedure
    .input(z.object({ phone: z.string().min(8) }))
    .mutation(async ({ input }) => {
      return sendWhatsAppOTP(input.phone);
    }),

  // Verify OTP code
  verifyOTP: publicProcedure
    .input(z.object({
      method: z.enum(["email", "whatsapp"]),
      target: z.string().min(1), // email or phone
      code: z.string().length(6),
    }))
    .mutation(async ({ input }) => {
      const key = input.method === "email" ? `email:${input.target}` : `whatsapp:${input.target}`;
      return verifyOTP(key, input.code);
    }),

  // Change sector (only if no data exists)
  changeSector: protectedProcedure
    .input(z.object({
      sector: z.enum([
        "INDUSTRIAL", "COMMERCIAL", "SERVICES", "BANKING", "INSURANCE",
        "REAL_ESTATE", "CONTRACTING", "AGRICULTURAL", "TECHNOLOGY",
        "NON_PROFIT", "CROWDFUNDING", "MEDICAL_HOSPITAL", "MEDICAL_PHARMACY",
        "MEDICAL_CLINIC", "MEDICAL_LAB",
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if tenant has any data
      const [entries, invoices] = await Promise.all([
        ctx.db.journalEntry.count({ where: { tenantId: ctx.tenantId } }),
        ctx.db.invoice.count({ where: { tenantId: ctx.tenantId } }),
      ]);

      if (entries > 0 || invoices > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن تغيير القطاع بعد إدخال قيود أو فواتير. يرجى التواصل مع الدعم.",
        });
      }

      // Delete old chart of accounts
      await ctx.db.account.deleteMany({ where: { tenantId: ctx.tenantId } });

      // Update sector
      const country = (await ctx.db.tenant.findUnique({ where: { id: ctx.tenantId } }))?.country || "SA";
      const vatRate = getVatRate(country, input.sector);

      await ctx.db.tenant.update({
        where: { id: ctx.tenantId },
        data: { sector: input.sector, vatRate },
      });

      // Re-provision chart of accounts
      await provisionChartOfAccounts(ctx.tenantId, input.sector);

      return { success: true, message: "تم تغيير القطاع وإعادة إعداد شجرة الحسابات بنجاح" };
    }),
});

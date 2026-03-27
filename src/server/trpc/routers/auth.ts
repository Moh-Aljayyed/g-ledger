import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, publicProcedure } from "../trpc";
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

    // Get country config
    const countryConfig = COUNTRIES[input.country];
    const currency = input.currency || countryConfig?.currency || "SAR";
    const vatRate = getVatRate(input.country, input.sector);

    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await db.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: input.businessName,
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
});

import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const companyRouter = router({
  // Get company branding settings
  getBranding: protectedProcedure.query(async ({ ctx }) => {
    const tenant = await ctx.db.tenant.findUnique({
      where: { id: ctx.tenantId },
      select: {
        name: true, logoUrl: true, documentColor: true, documentFooter: true,
        phone: true, website: true, addressLine1: true, addressLine2: true,
        country: true, currency: true, registrationNumber: true, vatRate: true,
      },
    });
    return tenant;
  }),

  // Update company branding
  updateBranding: protectedProcedure
    .input(z.object({
      logoUrl: z.string().optional(),
      documentColor: z.string().optional(),
      documentFooter: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.tenant.update({ where: { id: ctx.tenantId }, data: input });
      return { success: true };
    }),

  // Send document by email
  sendDocument: protectedProcedure
    .input(z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
      documentType: z.enum(["INVOICE", "QUOTE", "PURCHASE_ORDER", "RECEIPT"]),
      documentId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get company info
      const tenant = await ctx.db.tenant.findUnique({ where: { id: ctx.tenantId } });
      if (!tenant) throw new Error("Tenant not found");

      // Send email via Resend
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) throw new Error("Email service not configured");

        const fromEmail = process.env.RESEND_FROM_EMAIL || "G-Ledger <onboarding@resend.dev>";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromEmail,
            to: input.to,
            subject: input.subject,
            html: `
              <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${tenant.documentColor || "#021544"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin: 0;">${tenant.name}</h2>
                  ${tenant.phone ? `<p style="margin: 5px 0 0; opacity: 0.8; font-size: 13px;">${tenant.phone}</p>` : ""}
                </div>
                <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                  ${input.body}
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                  <p style="color: #9ca3af; font-size: 11px; text-align: center;">
                    ${tenant.documentFooter || "تم الإرسال عبر G-Ledger — g-ledger.com"}
                  </p>
                </div>
              </div>
            `,
          }),
        });

        return { success: true, message: `تم إرسال المستند إلى ${input.to}` };
      } catch (error: any) {
        throw new Error(`فشل إرسال الإيميل: ${error.message}`);
      }
    }),

  // Check if recipient is on same platform (for inter-company linking)
  checkPlatformUser: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        include: { tenant: { select: { name: true, slug: true } } },
      });

      if (!user || user.tenantId === ctx.tenantId) return { found: false };

      return {
        found: true,
        companyName: user.tenant.name,
        slug: user.tenant.slug,
        canLink: true,
      };
    }),
});

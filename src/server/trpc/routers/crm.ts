import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const crmRouter = router({
  listLeads: protectedProcedure
    .input(
      z.object({
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]).optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { company: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { phone: { contains: input.search } },
        ];
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;

      const [leads, total] = await Promise.all([
        ctx.db.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.lead.count({ where }),
      ]);

      return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  createLead: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
        expectedRevenue: z.number().min(0).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.lead.create({
        data: {
          ...input,
          email: input.email || null,
          expectedRevenue: input.expectedRevenue ?? 0,
          tenantId: ctx.tenantId,
        },
      });
    }),

  updateLead: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]).optional(),
        expectedRevenue: z.number().min(0).optional(),
        notes: z.string().optional(),
        lostReason: z.string().optional(),
        assignedTo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.email === "") updateData.email = null;

      // Set wonDate when status changes to WON
      if (data.status === "WON") {
        updateData.wonDate = new Date();
      }

      return ctx.db.lead.update({
        where: { id, tenantId: ctx.tenantId },
        data: updateData,
      });
    }),

  convertToCustomer: protectedProcedure
    .input(
      z.object({
        leadId: z.string(),
        customerCode: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lead = await ctx.db.lead.findFirst({
        where: { id: input.leadId, tenantId: ctx.tenantId },
      });

      if (!lead) {
        throw new TRPCError({ code: "NOT_FOUND", message: "العميل المحتمل غير موجود" });
      }

      if (lead.status !== "WON") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "يجب أن يكون العميل المحتمل في حالة 'فاز' للتحويل" });
      }

      // Check if code already exists
      const existing = await ctx.db.customer.findFirst({
        where: { tenantId: ctx.tenantId, code: input.customerCode },
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "كود العميل مستخدم بالفعل" });
      }

      const customer = await ctx.db.customer.create({
        data: {
          code: input.customerCode,
          nameAr: lead.name,
          nameEn: lead.company || null,
          email: lead.email,
          phone: lead.phone,
          tenantId: ctx.tenantId,
        },
      });

      await ctx.db.lead.update({
        where: { id: input.leadId },
        data: { customerId: customer.id },
      });

      return customer;
    }),

  getPipeline: protectedProcedure.query(async ({ ctx }) => {
    const leads = await ctx.db.lead.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
    });

    const statuses = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;
    const pipeline = statuses.map((status) => {
      const statusLeads = leads.filter((l) => l.status === status);
      const totalRevenue = statusLeads.reduce((sum, l) => sum + Number(l.expectedRevenue), 0);
      return { status, leads: statusLeads, count: statusLeads.length, totalRevenue };
    });

    return pipeline;
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const leads = await ctx.db.lead.findMany({
      where: { tenantId: ctx.tenantId },
    });

    const total = leads.length;
    const won = leads.filter((l) => l.status === "WON").length;
    const lost = leads.filter((l) => l.status === "LOST").length;
    const conversionRate = total > 0 ? ((won / (won + lost || 1)) * 100) : 0;
    const pipelineValue = leads
      .filter((l) => !["WON", "LOST"].includes(l.status))
      .reduce((sum, l) => sum + Number(l.expectedRevenue), 0);

    return { total, won, lost, conversionRate, pipelineValue };
  }),
});

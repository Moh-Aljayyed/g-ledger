import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/server/db";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "super-admin-secret-change-me";

export const adminRouter = router({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const admin = await db.superAdmin.findUnique({
        where: { email: input.email },
      });

      if (!admin || !admin.isActive) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "بيانات الدخول غير صحيحة",
        });
      }

      const valid = await bcrypt.compare(input.password, admin.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "بيانات الدخول غير صحيحة",
        });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: "SUPER_ADMIN" },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      return {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      };
    }),

  getAllTenants: protectedProcedure.query(async ({ ctx }) => {
    const tenants = await ctx.db.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            invoices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return tenants.map((t) => ({
      id: t.id,
      name: t.name,
      sector: t.sector,
      currency: t.currency,
      locale: t.locale,
      createdAt: t.createdAt,
      userCount: t._count.users,
      invoiceCount: t._count.invoices,
    }));
  }),

  getTenantDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: input.id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              accounts: true,
              journalEntries: true,
              invoices: true,
              customers: true,
              vendors: true,
              bills: true,
              employees: true,
            },
          },
        },
      });

      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنشأة غير موجودة" });
      }

      return {
        ...tenant,
        accountCount: tenant._count.accounts,
        entryCount: tenant._count.journalEntries,
        invoiceCount: tenant._count.invoices,
        customerCount: tenant._count.customers,
        vendorCount: tenant._count.vendors,
        billCount: tenant._count.bills,
        employeeCount: tenant._count.employees,
      };
    }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        tenant: {
          select: { id: true, name: true, sector: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  toggleTenantStatus: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findUnique({ where: { id: input.id } });
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المنشأة غير موجودة" });
      }

      // Deactivate/activate all users in the tenant
      await ctx.db.user.updateMany({
        where: { tenantId: input.id },
        data: { role: input.isActive ? "ACCOUNTANT" : "VIEWER" },
      });

      return { success: true, tenantId: input.id, isActive: input.isActive };
    }),

  toggleUserStatus: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المستخدم غير موجود" });
      }

      // Toggle by changing role to VIEWER (deactivate) or restoring
      return ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.isActive ? "ACCOUNTANT" : "VIEWER" },
      });
    }),

  getSystemStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalTenants,
      totalUsers,
      totalEntries,
      totalInvoices,
      totalCustomers,
      totalVendors,
      totalEmployees,
    ] = await Promise.all([
      ctx.db.tenant.count(),
      ctx.db.user.count(),
      ctx.db.journalEntry.count(),
      ctx.db.invoice.count(),
      ctx.db.customer.count(),
      ctx.db.vendor.count(),
      ctx.db.employee.count(),
    ]);

    // Breakdown by sector
    const tenantsBySector = await ctx.db.tenant.groupBy({
      by: ["sector"],
      _count: { id: true },
    });

    return {
      totalTenants,
      totalUsers,
      totalEntries,
      totalInvoices,
      totalCustomers,
      totalVendors,
      totalEmployees,
      tenantsBySector: tenantsBySector.map((s) => ({
        sector: s.sector,
        count: s._count.id,
      })),
    };
  }),

  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    const [recentSignups, recentEntries, recentInvoices] = await Promise.all([
      ctx.db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          tenant: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      ctx.db.journalEntry.findMany({
        select: {
          id: true,
          entryNumber: true,
          description: true,
          date: true,
          status: true,
          createdAt: true,
          tenant: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      ctx.db.invoice.findMany({
        select: {
          id: true,
          invoiceNumber: true,
          buyerName: true,
          grandTotal: true,
          status: true,
          createdAt: true,
          tenant: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return { recentSignups, recentEntries, recentInvoices };
  }),
});

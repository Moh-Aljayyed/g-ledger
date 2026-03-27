import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const employeesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]).optional(),
        department: z.string().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.department) where.department = input.department;
      if (input?.search) {
        where.OR = [
          { nameAr: { contains: input.search } },
          { nameEn: { contains: input.search, mode: "insensitive" } },
          { employeeNumber: { contains: input.search } },
        ];
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [employees, total] = await Promise.all([
        ctx.db.employee.findMany({
          where,
          orderBy: { employeeNumber: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.employee.count({ where }),
      ]);

      return { employees, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.employee.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          payrollItems: {
            include: {
              payroll: { select: { id: true, period: true, status: true } },
            },
            orderBy: { payroll: { period: "desc" } },
            take: 12,
          },
        },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الموظف غير موجود" });
      }

      return employee;
    }),

  create: protectedProcedure
    .input(
      z.object({
        employeeNumber: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        nationalId: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        hireDate: z.date(),
        basicSalary: z.number().min(0),
        housingAllowance: z.number().min(0).default(0),
        transportAllowance: z.number().min(0).default(0),
        otherAllowances: z.number().min(0).default(0),
        bankName: z.string().optional(),
        bankAccountNo: z.string().optional(),
        iban: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.employee.findFirst({
        where: { tenantId: ctx.tenantId, employeeNumber: input.employeeNumber },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "رقم الموظف مستخدم بالفعل",
        });
      }

      return ctx.db.employee.create({
        data: {
          ...input,
          tenantId: ctx.tenantId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        nationalId: z.string().optional(),
        department: z.string().optional(),
        position: z.string().optional(),
        basicSalary: z.number().min(0).optional(),
        housingAllowance: z.number().min(0).optional(),
        transportAllowance: z.number().min(0).optional(),
        otherAllowances: z.number().min(0).optional(),
        bankName: z.string().optional(),
        bankAccountNo: z.string().optional(),
        iban: z.string().optional(),
        status: z.enum(["ACTIVE", "ON_LEAVE"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.employee.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
    }),

  terminate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        terminationDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.employee.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!employee) {
        throw new TRPCError({ code: "NOT_FOUND", message: "الموظف غير موجود" });
      }

      if (employee.status === "TERMINATED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "الموظف منتهي الخدمة بالفعل",
        });
      }

      return ctx.db.employee.update({
        where: { id: input.id, tenantId: ctx.tenantId },
        data: {
          status: "TERMINATED",
          terminationDate: input.terminationDate,
        },
      });
    }),
});

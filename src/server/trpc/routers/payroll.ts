import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const GOSI_EMPLOYEE_RATE = 0.0975; // 9.75%
const GOSI_EMPLOYER_RATE = 0.1175; // 11.75%

export const payrollRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        year: z.number().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.year) where.year = input.year;

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [payrolls, total] = await Promise.all([
        ctx.db.payroll.findMany({
          where,
          include: { _count: { select: { items: true } } },
          orderBy: { period: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.payroll.count({ where }),
      ]);

      return { payrolls, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const payroll = await ctx.db.payroll.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          items: {
            include: {
              employee: {
                select: {
                  id: true,
                  employeeNumber: true,
                  nameAr: true,
                  nameEn: true,
                  department: true,
                  position: true,
                },
              },
            },
            orderBy: { employee: { employeeNumber: "asc" } },
          },
        },
      });

      if (!payroll) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المسير غير موجود" });
      }

      return payroll;
    }),

  generate: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2020).max(2100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const period = `${input.year}-${String(input.month).padStart(2, "0")}`;

      // Check if payroll already exists for this period
      const existing = await ctx.db.payroll.findFirst({
        where: { tenantId: ctx.tenantId, period },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `مسير الرواتب للفترة ${period} موجود بالفعل`,
        });
      }

      // Get all active employees
      const employees = await ctx.db.employee.findMany({
        where: { tenantId: ctx.tenantId, status: "ACTIVE" },
      });

      if (employees.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يوجد موظفين نشطين",
        });
      }

      // Calculate payroll items
      let totalBasic = 0;
      let totalAllowances = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let totalGosi = 0;

      const payrollItems = employees.map((emp) => {
        const basicSalary = Number(emp.basicSalary);
        const housingAllowance = Number(emp.housingAllowance);
        const transportAllowance = Number(emp.transportAllowance);
        const otherAllowances = Number(emp.otherAllowances);

        const totalEarnings = basicSalary + housingAllowance + transportAllowance + otherAllowances;

        // GOSI is calculated on basic salary + housing allowance (capped at 45,000 SAR)
        const gosiBase = Math.min(basicSalary + housingAllowance, 45000);
        const gosiEmployee = Math.round(gosiBase * GOSI_EMPLOYEE_RATE * 100) / 100;
        const gosiEmployer = Math.round(gosiBase * GOSI_EMPLOYER_RATE * 100) / 100;

        const totalItemDeductions = gosiEmployee;
        const netSalary = totalEarnings - totalItemDeductions;

        totalBasic += basicSalary;
        totalAllowances += housingAllowance + transportAllowance + otherAllowances;
        totalDeductions += totalItemDeductions;
        totalNet += netSalary;
        totalGosi += gosiEmployee + gosiEmployer;

        return {
          employeeId: emp.id,
          basicSalary,
          housingAllowance,
          transportAllowance,
          otherAllowances,
          totalEarnings,
          gosiEmployee,
          gosiEmployer,
          otherDeductions: 0,
          totalDeductions: totalItemDeductions,
          netSalary,
        };
      });

      return ctx.db.payroll.create({
        data: {
          period,
          month: input.month,
          year: input.year,
          status: "DRAFT",
          totalBasic,
          totalAllowances,
          totalDeductions,
          totalNet,
          totalGosi,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          items: { create: payrollItems },
        },
        include: {
          items: {
            include: {
              employee: {
                select: { employeeNumber: true, nameAr: true },
              },
            },
          },
        },
      });
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payroll = await ctx.db.payroll.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { items: true },
      });

      if (!payroll) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المسير غير موجود" });
      }
      if (payroll.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن اعتماد مسير غير مسودة",
        });
      }

      // Determine payroll date (last day of the month)
      const payrollDate = new Date(payroll.year, payroll.month, 0); // last day of month

      // Get next entry number
      const lastEntry = await ctx.db.journalEntry.findFirst({
        where: { tenantId: ctx.tenantId },
        orderBy: { entryNumber: "desc" },
      });
      const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

      // Find open fiscal period
      const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
        where: {
          tenantId: ctx.tenantId,
          startDate: { lte: payrollDate },
          endDate: { gte: payrollDate },
          isClosed: false,
        },
      });

      if (!fiscalPeriod) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا توجد فترة مالية مفتوحة لتاريخ المسير",
        });
      }

      // Calculate totals for journal entry
      const totalGosiEmployer = payroll.items.reduce(
        (sum, item) => sum + Number(item.gosiEmployer),
        0
      );
      const totalGosiEmployee = payroll.items.reduce(
        (sum, item) => sum + Number(item.gosiEmployee),
        0
      );
      const totalSalaryExpense = Number(payroll.totalBasic) + Number(payroll.totalAllowances);
      const totalNetSalary = Number(payroll.totalNet);

      // Find required accounts by code pattern
      // Salary Expense, GOSI Employer Expense, Salary Payable, GOSI Payable
      const findAccountByPattern = async (patterns: string[]) => {
        for (const pattern of patterns) {
          const account = await ctx.db.account.findFirst({
            where: {
              tenantId: ctx.tenantId,
              code: { contains: pattern },
              isActive: true,
            },
          });
          if (account) return account;
        }
        return null;
      };

      const salaryExpenseAcct = await findAccountByPattern(["5100", "salary", "رواتب"]);
      const gosiExpenseAcct = await findAccountByPattern(["5110", "gosi", "تأمينات"]);
      const salaryPayableAcct = await findAccountByPattern(["2200", "salary-payable", "رواتب مستحقة"]);
      const gosiPayableAcct = await findAccountByPattern(["2210", "gosi-payable", "تأمينات مستحقة"]);

      const result = await ctx.db.$transaction(async (tx) => {
        let journalEntryId: string | null = null;

        // Create journal entry if we have the required accounts
        // Dr Salary Expense (total earnings)
        // Dr GOSI Employer Expense (employer share)
        // Cr Salary Payable (net salary)
        // Cr GOSI Payable (employee + employer share)
        const journalLines: Array<{
          accountId: string;
          debit: number;
          credit: number;
          description: string;
        }> = [];

        if (salaryExpenseAcct) {
          journalLines.push({
            accountId: salaryExpenseAcct.id,
            debit: totalSalaryExpense,
            credit: 0,
            description: `رواتب ${payroll.period}`,
          });
        }

        if (gosiExpenseAcct) {
          journalLines.push({
            accountId: gosiExpenseAcct.id,
            debit: totalGosiEmployer,
            credit: 0,
            description: `حصة صاحب العمل في التأمينات ${payroll.period}`,
          });
        }

        if (salaryPayableAcct) {
          journalLines.push({
            accountId: salaryPayableAcct.id,
            debit: 0,
            credit: totalNetSalary,
            description: `رواتب مستحقة ${payroll.period}`,
          });
        }

        if (gosiPayableAcct) {
          journalLines.push({
            accountId: gosiPayableAcct.id,
            debit: 0,
            credit: totalGosiEmployee + totalGosiEmployer,
            description: `تأمينات مستحقة ${payroll.period}`,
          });
        }

        if (journalLines.length >= 2) {
          const je = await tx.journalEntry.create({
            data: {
              entryNumber,
              date: payrollDate,
              description: `قيد رواتب ${payroll.period}`,
              reference: `PAYROLL-${payroll.period}`,
              status: "POSTED",
              fiscalPeriodId: fiscalPeriod.id,
              tenantId: ctx.tenantId,
              createdById: ctx.user.id,
              postedAt: new Date(),
              lines: { create: journalLines },
            },
          });
          journalEntryId = je.id;
        }

        const updatedPayroll = await tx.payroll.update({
          where: { id: input.id },
          data: {
            status: "APPROVED",
            journalEntryId,
          },
          include: { items: true },
        });

        return updatedPayroll;
      });

      return result;
    }),

  markPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payroll = await ctx.db.payroll.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      });

      if (!payroll) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المسير غير موجود" });
      }
      if (payroll.status !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن تصفية مسير غير معتمد",
        });
      }

      return ctx.db.payroll.update({
        where: { id: input.id },
        data: { status: "PAID" },
      });
    }),
});

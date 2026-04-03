import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const hrRouter = router({
  // === ATTENDANCE ===
  markAttendance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        date: z.date(),
        checkIn: z.date().optional(),
        checkOut: z.date().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const hours =
        input.checkIn && input.checkOut
          ? (
              (input.checkOut.getTime() - input.checkIn.getTime()) /
              3600000
            ).toFixed(2)
          : null;
      return ctx.db.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: input.employeeId,
            date: input.date,
          },
        },
        create: {
          ...input,
          hoursWorked: hours ? parseFloat(hours) : null,
          tenantId: ctx.tenantId,
        },
        update: {
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          status: input.status,
          hoursWorked: hours ? parseFloat(hours) : null,
        },
      });
    }),

  getAttendance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        month: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.employeeId) where.employeeId = input.employeeId;
      if (input?.month) {
        const [year, month] = input.month.split("-").map(Number);
        where.date = {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        };
      }
      return ctx.db.attendance.findMany({
        where,
        include: {
          employee: {
            select: { nameAr: true, nameEn: true, employeeNumber: true },
          },
        },
        orderBy: { date: "desc" },
      });
    }),

  // === DOCUMENTS ===
  uploadDocument: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        type: z.string(),
        name: z.string(),
        fileUrl: z.string().optional(),
        expiryDate: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.employeeDocument.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  getDocuments: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.employeeDocument.findMany({
        where: { tenantId: ctx.tenantId, employeeId: input.employeeId },
        orderBy: { createdAt: "desc" },
      });
    }),

  getExpiringDocuments: protectedProcedure.query(async ({ ctx }) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return ctx.db.employeeDocument.findMany({
      where: {
        tenantId: ctx.tenantId,
        expiryDate: { lte: thirtyDaysFromNow, gte: new Date() },
      },
      include: {
        employee: { select: { nameAr: true, employeeNumber: true } },
      },
      orderBy: { expiryDate: "asc" },
    });
  }),

  // === SALARY ADVANCE ===
  requestAdvance: protectedProcedure
    .input(
      z.object({
        employeeId: z.string(),
        amount: z.number().min(1),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAdvance.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  listAdvances: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      return ctx.db.salaryAdvance.findMany({
        where,
        include: {
          employee: { select: { nameAr: true, employeeNumber: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  approveAdvance: protectedProcedure
    .input(z.object({ id: z.string(), deductMonth: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAdvance.update({
        where: { id: input.id },
        data: {
          status: "APPROVED",
          approvedBy: ctx.session?.user?.id,
          approvedAt: new Date(),
          deductMonth: input.deductMonth,
        },
      });
    }),

  rejectAdvance: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.salaryAdvance.update({
        where: { id: input.id },
        data: { status: "REJECTED" },
      });
    }),

  // === CERTIFICATES ===
  requestCertificate: protectedProcedure
    .input(z.object({ employeeId: z.string(), type: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const employee = await ctx.db.employee.findFirst({
        where: { id: input.employeeId, tenantId: ctx.tenantId },
        include: { tenant: true },
      });
      if (!employee) throw new Error("Employee not found");

      const tenant = employee.tenant;
      let content = "";

      if (input.type === "EXPERIENCE") {
        content = `شهادة خبرة\n\nنشهد نحن ${tenant.name} بأن ${employee.nameAr} يعمل/كان يعمل لدينا بوظيفة ${employee.position || "موظف"} في قسم ${employee.department || "الإدارة"} وذلك اعتباراً من تاريخ ${employee.hireDate.toISOString().split("T")[0]}.\n\nأعطيت هذه الشهادة بناءً على طلبه/طلبها دون أن تتحمل الشركة أي مسؤولية.`;
      } else if (input.type === "SALARY") {
        content = `شهادة راتب\n\nنشهد نحن ${tenant.name} بأن ${employee.nameAr} يعمل لدينا براتب أساسي ${employee.basicSalary} ${tenant.currency} شهرياً بالإضافة إلى بدل سكن ${employee.housingAllowance} ${tenant.currency} وبدل نقل ${employee.transportAllowance} ${tenant.currency}.`;
      } else if (input.type === "EMPLOYMENT") {
        content = `تعريف بالراتب\n\nنفيد نحن ${tenant.name} بأن ${employee.nameAr} حامل هوية رقم ${employee.nationalId || "---"} يعمل لدينا بوظيفة ${employee.position || "موظف"} منذ ${employee.hireDate.toISOString().split("T")[0]}.`;
      }

      return ctx.db.employeeCertificate.create({
        data: {
          employeeId: input.employeeId,
          type: input.type,
          content,
          status: "ISSUED",
          issuedAt: new Date(),
          tenantId: ctx.tenantId,
        },
      });
    }),

  listCertificates: protectedProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.employeeCertificate.findMany({
        where: { tenantId: ctx.tenantId, employeeId: input.employeeId },
        orderBy: { requestedAt: "desc" },
      });
    }),

  // === PAYSLIP ===
  getPayslip: protectedProcedure
    .input(z.object({ employeeId: z.string(), period: z.string() }))
    .query(async ({ ctx, input }) => {
      const payrollItem = await ctx.db.payrollItem.findFirst({
        where: {
          employee: { id: input.employeeId, tenantId: ctx.tenantId },
          payroll: { period: input.period },
        },
        include: { employee: true, payroll: true },
      });
      return payrollItem;
    }),

  // === HR DASHBOARD STATS ===
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [
      totalEmployees,
      activeEmployees,
      onLeaveToday,
      presentToday,
      pendingAdvances,
      expiringDocs,
    ] = await Promise.all([
      ctx.db.employee.count({ where: { tenantId: ctx.tenantId } }),
      ctx.db.employee.count({
        where: { tenantId: ctx.tenantId, status: "ACTIVE" },
      }),
      ctx.db.leaveRequest.count({
        where: {
          tenantId: ctx.tenantId,
          status: "APPROVED",
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
      ctx.db.attendance.count({
        where: { tenantId: ctx.tenantId, date: today, status: "PRESENT" },
      }),
      ctx.db.salaryAdvance.count({
        where: { tenantId: ctx.tenantId, status: "PENDING" },
      }),
      ctx.db.employeeDocument.count({
        where: {
          tenantId: ctx.tenantId,
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
    ]);
    return {
      totalEmployees,
      activeEmployees,
      onLeaveToday,
      presentToday,
      pendingAdvances,
      expiringDocs,
    };
  }),
});

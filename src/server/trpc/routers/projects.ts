import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const projectsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId };
      if (input?.status) where.status = input.status;
      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;

      const [projects, total] = await Promise.all([
        ctx.db.project.findMany({
          where,
          include: {
            tasks: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        ctx.db.project.count({ where }),
      ]);

      return { projects, total, page, limit, totalPages: Math.ceil(total / limit) };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        budget: z.number().min(0).optional(),
        managerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description || null,
          status: input.status || "PLANNING",
          startDate: input.startDate || null,
          endDate: input.endDate || null,
          budget: input.budget ?? 0,
          managerId: input.managerId || null,
          tenantId: ctx.tenantId,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          tasks: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      return project;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        budget: z.number().min(0).optional(),
        spent: z.number().min(0).optional(),
        managerId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.project.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
    }),

  addTask: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        assigneeId: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to tenant
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, tenantId: ctx.tenantId },
      });
      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      return ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description || null,
          priority: input.priority || "MEDIUM",
          assigneeId: input.assigneeId || null,
          dueDate: input.dueDate || null,
          projectId: input.projectId,
        },
      });
    }),

  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        assigneeId: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };

      // Set completedAt when task is marked DONE
      if (data.status === "DONE") {
        updateData.completedAt = new Date();
      } else if (data.status) {
        updateData.completedAt = null;
      }

      return ctx.db.task.update({
        where: { id },
        data: updateData,
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.task.delete({
        where: { id: input.id },
      });
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: { tenantId: ctx.tenantId },
      include: { tasks: { select: { status: true } } },
    });

    const total = projects.length;
    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget), 0);
    const totalSpent = projects.reduce((sum, p) => sum + Number(p.spent), 0);

    return { total, active, completed, totalBudget, totalSpent };
  }),
});

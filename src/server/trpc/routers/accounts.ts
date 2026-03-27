import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import {
  getAccountTree,
  createAccount,
  deleteAccount,
} from "@/server/services/chart-of-accounts.service";

export const accountsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]).optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: any = { tenantId: ctx.tenantId, isActive: true };
      if (input?.type) where.type = input.type;
      if (input?.search) {
        where.OR = [
          { nameAr: { contains: input.search } },
          { nameEn: { contains: input.search, mode: "insensitive" } },
          { code: { contains: input.search } },
        ];
      }
      return ctx.session.user.tenantId
        ? ctx.db.account.findMany({
            where,
            orderBy: { code: "asc" },
          })
        : [];
    }),

  getTree: protectedProcedure.query(async ({ ctx }) => {
    return getAccountTree(ctx.tenantId);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.account.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { children: true, parent: true },
      });
    }),

  getLeafAccounts: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.account.findMany({
      where: { tenantId: ctx.tenantId, isLeaf: true, isActive: true },
      orderBy: { code: "asc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1),
        nameAr: z.string().min(1),
        nameEn: z.string().min(1),
        type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
        nature: z.enum(["DEBIT", "CREDIT"]),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createAccount(ctx.tenantId, input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nameAr: z.string().min(1).optional(),
        nameEn: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.account.update({
        where: { id, tenantId: ctx.tenantId },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return deleteAccount(ctx.tenantId, input.id);
    }),
});

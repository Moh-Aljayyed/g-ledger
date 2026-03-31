import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import crypto from "crypto";

export const apiKeysRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.apiKey.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const key = `glk_${crypto.randomBytes(32).toString("hex")}`;
      return ctx.db.apiKey.create({
        data: { key, name: input.name, tenantId: ctx.tenantId },
      });
    }),

  revoke: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.apiKey.update({
        where: { id: input.id },
        data: { isActive: false },
      });
    }),
});

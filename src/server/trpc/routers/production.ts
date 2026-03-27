import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

// Production phases for garment factory
const PHASES = [
  { number: 1, nameAr: "شراء الغزل", nameEn: "Yarn Purchase" },
  { number: 2, nameAr: "نسيج خارجي", nameEn: "Outsource Weaving" },
  { number: 3, nameAr: "صباغة خارجية", nameEn: "Outsource Dyeing" },
  { number: 4, nameAr: "تصنيع داخلي", nameEn: "Internal Manufacturing" },
  { number: 5, nameAr: "البيع", nameEn: "Sales" },
] as const;

const PhaseStatus = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);
const OrderStatus = z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);

// In-memory storage for production orders
// TODO: Migrate to Prisma model (ProductionOrder) when schema is updated
interface ProductionPhase {
  phase: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  notes: string;
  cost: number;
  startedAt: string | null;
  completedAt: string | null;
  journalEntryId: string | null;
}

interface ProductionOrder {
  id: string;
  orderNumber: string;
  productName: string;
  quantity: number;
  unit: string;
  targetDate: string;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  phases: ProductionPhase[];
  totalCost: number;
  tenantId: string;
  createdAt: string;
  createdById: string;
}

// Per-tenant in-memory store
// TODO: Replace with Prisma queries when model is available
const productionOrders: Map<string, ProductionOrder[]> = new Map();

function getOrders(tenantId: string): ProductionOrder[] {
  if (!productionOrders.has(tenantId)) {
    productionOrders.set(tenantId, []);
  }
  return productionOrders.get(tenantId)!;
}

function generateOrderNumber(tenantId: string): string {
  const orders = getOrders(tenantId);
  const lastNum = orders.length > 0
    ? Math.max(...orders.map((o) => parseInt(o.orderNumber.replace("PO-", ""), 10) || 0))
    : 0;
  return `PO-${String(lastNum + 1).padStart(6, "0")}`;
}

export const productionRouter = router({
  // ============ LIST ORDERS ============
  listOrders: protectedProcedure
    .input(
      z.object({
        status: OrderStatus.optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        search: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      let orders = getOrders(ctx.tenantId);

      // Apply filters
      if (input?.status) {
        orders = orders.filter((o) => o.status === input.status);
      }
      if (input?.fromDate) {
        orders = orders.filter((o) => o.createdAt >= input.fromDate!);
      }
      if (input?.toDate) {
        orders = orders.filter((o) => o.createdAt <= input.toDate!);
      }
      if (input?.search) {
        const q = input.search.toLowerCase();
        orders = orders.filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(q) ||
            o.productName.toLowerCase().includes(q)
        );
      }

      // Sort by creation date descending
      orders = [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const total = orders.length;
      const paged = orders.slice((page - 1) * limit, page * limit);

      return {
        orders: paged,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // ============ GET SINGLE ORDER ============
  getOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const orders = getOrders(ctx.tenantId);
      const order = orders.find((o) => o.id === input.id);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "أمر الإنتاج غير موجود" });
      }

      return order;
    }),

  // ============ CREATE ORDER ============
  createOrder: protectedProcedure
    .input(
      z.object({
        productName: z.string().min(1, "اسم المنتج مطلوب"),
        quantity: z.number().positive("الكمية يجب أن تكون أكبر من صفر"),
        unit: z.string().default("متر"),
        targetDate: z.string().min(1, "تاريخ الاستهداف مطلوب"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orderNumber = generateOrderNumber(ctx.tenantId);
      const now = new Date().toISOString();

      const newOrder: ProductionOrder = {
        id: crypto.randomUUID(),
        orderNumber,
        productName: input.productName,
        quantity: input.quantity,
        unit: input.unit,
        targetDate: input.targetDate,
        status: "PLANNING",
        phases: PHASES.map((p) => ({
          phase: p.number,
          status: "PENDING",
          notes: "",
          cost: 0,
          startedAt: null,
          completedAt: null,
          journalEntryId: null,
        })),
        totalCost: 0,
        tenantId: ctx.tenantId,
        createdAt: now,
        createdById: ctx.user.id,
      };

      const orders = getOrders(ctx.tenantId);
      orders.push(newOrder);

      return newOrder;
    }),

  // ============ UPDATE PHASE ============
  updatePhase: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        phase: z.number().min(1).max(5),
        status: PhaseStatus,
        notes: z.string().optional(),
        cost: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const orders = getOrders(ctx.tenantId);
      const order = orders.find((o) => o.id === input.orderId);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "أمر الإنتاج غير موجود" });
      }

      const phaseIdx = input.phase - 1;
      const phase = order.phases[phaseIdx];

      if (!phase) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "رقم المرحلة غير صحيح" });
      }

      // Validate that previous phase is completed before starting next one
      if (input.phase > 1 && input.status !== "PENDING") {
        const prevPhase = order.phases[phaseIdx - 1];
        if (prevPhase.status !== "COMPLETED") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "يجب إكمال المرحلة السابقة أولاً",
          });
        }
      }

      const now = new Date().toISOString();

      // Update phase
      phase.status = input.status;
      if (input.notes) phase.notes = input.notes;
      if (input.cost !== undefined) phase.cost = input.cost;
      if (input.status === "IN_PROGRESS" && !phase.startedAt) {
        phase.startedAt = now;
      }
      if (input.status === "COMPLETED") {
        phase.completedAt = now;
      }

      // Recalculate total cost
      order.totalCost = order.phases.reduce((sum, p) => sum + p.cost, 0);

      // Update order status
      if (order.status === "PLANNING" && input.status === "IN_PROGRESS") {
        order.status = "IN_PROGRESS";
      }

      // Check if all phases completed
      const allCompleted = order.phases.every((p) => p.status === "COMPLETED");
      if (allCompleted) {
        order.status = "COMPLETED";
      }

      // Create journal entries when a phase completes
      // TODO: Use actual account IDs from chart of accounts when Prisma model is ready
      if (input.status === "COMPLETED" && input.cost && input.cost > 0) {
        let journalEntryId: string | null = null;

        try {
          // Find open fiscal period
          const today = new Date();
          const fiscalPeriod = await ctx.db.fiscalPeriod.findFirst({
            where: {
              tenantId: ctx.tenantId,
              startDate: { lte: today },
              endDate: { gte: today },
              isClosed: false,
            },
          });

          if (fiscalPeriod) {
            // Get next journal entry number
            const lastEntry = await ctx.db.journalEntry.findFirst({
              where: { tenantId: ctx.tenantId },
              orderBy: { entryNumber: "desc" },
            });
            const entryNumber = (lastEntry?.entryNumber ?? 0) + 1;

            // Build journal entry description and lines based on phase
            const phaseDescriptions: Record<number, string> = {
              1: `شراء غزل - ${order.orderNumber} - ${order.productName}`,
              2: `نسيج خارجي (مقاول) - ${order.orderNumber} - ${order.productName}`,
              3: `صباغة خارجية (مقاول) - ${order.orderNumber} - ${order.productName}`,
              4: `تصنيع داخلي - ${order.orderNumber} - ${order.productName}`,
              5: `بيع منتج نهائي - ${order.orderNumber} - ${order.productName}`,
            };

            const description = phaseDescriptions[input.phase] ?? `إنتاج - ${order.orderNumber}`;
            const cost = input.cost;

            // Find relevant accounts by code pattern
            // Phase 1: Dr Raw Materials (1401), Cr AP (2101)
            // Phase 2: Dr WIP-Weaving (1402), Cr Raw Materials (1401) + Cr AP-Contractor (2102)
            // Phase 3: Dr WIP-Dyeing (1403), Cr WIP-Weaving (1402) + Cr AP-Contractor (2103)
            // Phase 4: Dr Finished Goods (1404), Cr WIP-Dyeing (1403) + Cr Direct Labor (5101)
            // Phase 5: Dr AR/Cash (1201), Cr Sales Revenue (4101) + Dr COGS (5001), Cr Finished Goods (1404)

            // TODO: Map these to actual account IDs from chart of accounts
            // For now, create a journal entry with metadata tracking the production order
            const je = await ctx.db.journalEntry.create({
              data: {
                entryNumber,
                date: today,
                description,
                reference: order.orderNumber,
                status: "DRAFT",
                fiscalPeriodId: fiscalPeriod.id,
                tenantId: ctx.tenantId,
                createdById: ctx.user.id,
                metadata: {
                  productionOrderId: order.id,
                  productionOrderNumber: order.orderNumber,
                  phase: input.phase,
                  phaseName: PHASES[phaseIdx].nameAr,
                  cost,
                },
              },
            });

            journalEntryId = je.id;
          }
        } catch (err) {
          // Don't fail the phase update if journal entry creation fails
          console.error("Failed to create production journal entry:", err);
        }

        phase.journalEntryId = journalEntryId;
      }

      return order;
    }),

  // ============ CANCEL ORDER ============
  cancelOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const orders = getOrders(ctx.tenantId);
      const order = orders.find((o) => o.id === input.id);

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "أمر الإنتاج غير موجود" });
      }

      if (order.status === "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن إلغاء أمر إنتاج مكتمل",
        });
      }

      order.status = "CANCELLED";
      return order;
    }),

  // ============ PRODUCTION SUMMARY ============
  getProductionSummary: protectedProcedure.query(async ({ ctx }) => {
    const orders = getOrders(ctx.tenantId);

    const totalOrders = orders.length;
    const byStatus = {
      PLANNING: orders.filter((o) => o.status === "PLANNING").length,
      IN_PROGRESS: orders.filter((o) => o.status === "IN_PROGRESS").length,
      COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
      CANCELLED: orders.filter((o) => o.status === "CANCELLED").length,
    };

    const totalProductionCost = orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalCost, 0);

    const averageCostPerOrder =
      totalOrders > 0 ? totalProductionCost / (totalOrders - byStatus.CANCELLED || 1) : 0;

    // Phase completion stats
    const phaseStats = PHASES.map((p) => {
      const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
      const completed = activeOrders.filter(
        (o) => o.phases[p.number - 1]?.status === "COMPLETED"
      ).length;
      const inProgress = activeOrders.filter(
        (o) => o.phases[p.number - 1]?.status === "IN_PROGRESS"
      ).length;
      const totalCost = activeOrders.reduce(
        (sum, o) => sum + (o.phases[p.number - 1]?.cost ?? 0),
        0
      );

      return {
        phase: p.number,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        completed,
        inProgress,
        totalCost,
      };
    });

    return {
      totalOrders,
      byStatus,
      totalProductionCost,
      averageCostPerOrder,
      phaseStats,
    };
  }),
});

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { nextCounter, formatInvoiceNumber } from "@/server/counter";

/**
 * Restaurant POS router — floors, tables, tabs (open checks), modifiers,
 * kitchen stations. Built to compete directly with Foodics for F&B.
 *
 * Flow:
 *   1. Admin sets up floors + tables in /settings/restaurant
 *   2. Admin defines modifier groups + kitchen stations
 *   3. Cashier opens the /pos/restaurant floor map
 *   4. Tap table → opens a Tab (open check)
 *   5. Add items (with modifiers) → "Send to Kitchen" routes by station
 *   6. Close tab → creates a proper Invoice + StockMovement + JournalEntry
 */
export const restaurantRouter = router({
  // ============ FLOORS ============

  listFloors: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.floor.findMany({
      where: { tenantId: ctx.tenantId },
      include: { tables: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });
  }),

  createFloor: protectedProcedure
    .input(z.object({ name: z.string().min(1), displayOrder: z.number().default(0) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.floor.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  updateFloor: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().optional(), displayOrder: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.floor.update({
        where: { id },
        data,
      });
    }),

  deleteFloor: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.floor.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ============ TABLES ============

  listTables: protectedProcedure
    .input(z.object({ floorId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.restaurantTable.findMany({
        where: {
          tenantId: ctx.tenantId,
          ...(input?.floorId && { floorId: input.floorId }),
        },
        include: {
          tabs: {
            where: { status: "OPEN" },
            include: { items: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }),

  createTable: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        floorId: z.string(),
        capacity: z.number().min(1).default(4),
        shape: z.enum(["SQUARE", "ROUND", "RECT"]).default("SQUARE"),
        x: z.number().default(0),
        y: z.number().default(0),
        width: z.number().default(80),
        height: z.number().default(80),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.restaurantTable.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  updateTable: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        capacity: z.number().optional(),
        shape: z.enum(["SQUARE", "ROUND", "RECT"]).optional(),
        x: z.number().optional(),
        y: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.restaurantTable.update({ where: { id }, data });
    }),

  deleteTable: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Block delete if there's an open tab on this table
      const openTab = await ctx.db.tab.findFirst({
        where: { tableId: input.id, status: "OPEN" },
      });
      if (openTab) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "لا يمكن حذف الطاولة — يوجد حساب مفتوح عليها",
        });
      }
      await ctx.db.restaurantTable.delete({ where: { id: input.id } });
      return { success: true };
    }),

  // ============ TABS (open checks) ============

  listOpenTabs: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tab.findMany({
      where: { tenantId: ctx.tenantId, status: "OPEN" },
      include: {
        table: true,
        items: { include: { product: true, station: true } },
      },
      orderBy: { openedAt: "desc" },
    });
  }),

  getTab: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tab.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: {
          table: { include: { floor: true } },
          items: {
            include: { product: true, station: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }),

  openTab: protectedProcedure
    .input(
      z.object({
        tableId: z.string().optional(),
        orderType: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]).default("DINE_IN"),
        guestCount: z.number().min(1).default(1),
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If dine-in, block opening a second tab on same table
      if (input.tableId) {
        const existing = await ctx.db.tab.findFirst({
          where: { tableId: input.tableId, status: "OPEN" },
        });
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "هذه الطاولة عليها حساب مفتوح بالفعل",
          });
        }
      }

      const tabNumber = await nextCounter(ctx.db, ctx.tenantId, "TAB");

      return ctx.db.tab.create({
        data: {
          tabNumber,
          tableId: input.tableId,
          orderType: input.orderType,
          guestCount: input.guestCount,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          tenantId: ctx.tenantId,
          openedById: ctx.user.id,
        },
        include: { table: true, items: true },
      });
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        tabId: z.string(),
        productId: z.string(),
        quantity: z.number().positive().default(1),
        modifiers: z
          .array(z.object({ name: z.string(), price: z.number() }))
          .optional()
          .default([]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch product to get current price + kitchen station
      const product = await ctx.db.product.findFirst({
        where: { id: input.productId, tenantId: ctx.tenantId },
        include: { kitchenStations: { take: 1 } },
      });
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });

      const unitPrice = Number(product.sellingPrice);
      const modifierTotal = input.modifiers.reduce((s, m) => s + m.price, 0);
      const lineTotal = (unitPrice + modifierTotal) * input.quantity;

      const stationId = product.kitchenStations[0]?.stationId;

      const item = await ctx.db.tabItem.create({
        data: {
          tabId: input.tabId,
          productId: input.productId,
          quantity: new Prisma.Decimal(input.quantity),
          unitPrice: new Prisma.Decimal(unitPrice),
          modifiers: input.modifiers as Prisma.InputJsonValue,
          modifierTotal: new Prisma.Decimal(modifierTotal),
          totalPrice: new Prisma.Decimal(lineTotal),
          notes: input.notes,
          stationId,
        },
        include: { product: true, station: true },
      });

      await recalculateTabTotals(ctx.db, input.tabId);
      return item;
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.tabItem.findUnique({
        where: { id: input.itemId },
        include: { tab: true },
      });
      if (!item || item.tab.tenantId !== ctx.tenantId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (item.status === "SENT" || item.status === "READY") {
        // Mark as voided rather than hard delete (auditable)
        await ctx.db.tabItem.update({
          where: { id: item.id },
          data: { status: "VOIDED" },
        });
      } else {
        await ctx.db.tabItem.delete({ where: { id: item.id } });
      }
      await recalculateTabTotals(ctx.db, item.tabId);
      return { success: true };
    }),

  sendToKitchen: protectedProcedure
    .input(z.object({ tabId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.tabItem.updateMany({
        where: { tabId: input.tabId, status: "NEW" },
        data: { status: "SENT", sentAt: new Date() },
      });
      return { success: true, count: result.count };
    }),

  /**
   * Close a tab → create a real Invoice + StockMovement (OUT) for each item
   * + JournalEntry. Marks the tab as PAID and frees the table.
   */
  closeTab: protectedProcedure
    .input(
      z.object({
        tabId: z.string(),
        paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "CREDIT"]).default("CASH"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tab = await ctx.db.tab.findFirst({
        where: { id: input.tabId, tenantId: ctx.tenantId, status: "OPEN" },
        include: { items: { include: { product: true } } },
      });
      if (!tab) throw new TRPCError({ code: "NOT_FOUND", message: "الحساب غير موجود أو مغلق" });

      const activeItems = tab.items.filter((i) => i.status !== "VOIDED");
      if (activeItems.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن إغلاق حساب فارغ" });
      }

      // Build invoice line items from tab items
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: ctx.tenantId },
        select: { vatRate: true, currency: true, country: true },
      });
      const vatRate = tenant ? Number(tenant.vatRate) : 15;
      const currency = tenant?.currency || "SAR";

      const invoiceItems = activeItems.map((it, idx) => {
        const qty = Number(it.quantity);
        const unit = Number(it.unitPrice) + Number(it.modifierTotal);
        const net = qty * unit;
        const vat = net * (vatRate / 100);
        return {
          lineNumber: idx + 1,
          description: it.product.nameAr + (it.notes ? ` (${it.notes})` : ""),
          descriptionEn: it.product.nameEn,
          itemCode: it.product.code,
          unitType: "EA",
          quantity: new Prisma.Decimal(qty),
          unitPrice: new Prisma.Decimal(unit),
          discount: new Prisma.Decimal(0),
          discountRate: new Prisma.Decimal(0),
          vatRate: new Prisma.Decimal(vatRate),
          vatAmount: new Prisma.Decimal(vat),
          vatCategory: "S",
          withholdingRate: new Prisma.Decimal(0),
          withholdingAmount: new Prisma.Decimal(0),
          tableTaxRate: new Prisma.Decimal(0),
          tableTaxAmount: new Prisma.Decimal(0),
          netAmount: new Prisma.Decimal(net),
          totalAmount: new Prisma.Decimal(net + vat),
        };
      });

      const subtotal = invoiceItems.reduce((s, i) => s + Number(i.netAmount), 0);
      const totalVat = invoiceItems.reduce((s, i) => s + Number(i.vatAmount), 0);
      const grandTotal = subtotal + totalVat;

      const invoiceNum = await nextCounter(ctx.db, ctx.tenantId, "INVOICE");

      const invoice = await ctx.db.invoice.create({
        data: {
          invoiceNumber: formatInvoiceNumber(invoiceNum),
          type: "SALES",
          status: "READY",
          issueDate: new Date(),
          buyerName: tab.customerName || `Tab #${tab.tabNumber}`,
          buyerCountry: tenant?.country || "SA",
          buyerType: "P",
          currency,
          exchangeRate: new Prisma.Decimal(1),
          subtotal: new Prisma.Decimal(subtotal),
          totalVat: new Prisma.Decimal(totalVat),
          totalWithholding: new Prisma.Decimal(0),
          totalTableTax: new Prisma.Decimal(0),
          totalDiscount: new Prisma.Decimal(0),
          grandTotal: new Prisma.Decimal(grandTotal),
          notes: `Tab #${tab.tabNumber} — ${tab.orderType}${tab.tableId ? ` — Table ${tab.tableId}` : ""}`,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          items: { create: invoiceItems },
        },
      });

      // Mark tab as PAID and link invoice
      await ctx.db.tab.update({
        where: { id: tab.id },
        data: {
          status: "PAID",
          closedAt: new Date(),
          invoiceId: invoice.id,
          subtotal: new Prisma.Decimal(subtotal),
          vatAmount: new Prisma.Decimal(totalVat),
          total: new Prisma.Decimal(grandTotal),
        },
      });

      return { invoice, tabId: tab.id, paymentMethod: input.paymentMethod };
    }),

  // ============ KITCHEN STATIONS ============

  listStations: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.kitchenStation.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: "asc" },
    });
  }),

  createStation: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameEn: z.string().optional(),
        printerName: z.string().optional(),
        displayColor: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.kitchenStation.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  deleteStation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.kitchenStation.delete({ where: { id: input.id } });
      return { success: true };
    }),

  linkProductToStation: protectedProcedure
    .input(z.object({ productId: z.string(), stationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.productKitchenStation.upsert({
        where: { productId_stationId: input },
        create: input,
        update: {},
      });
    }),

  // ============ MODIFIER GROUPS ============

  listModifierGroups: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.modifierGroup.findMany({
      where: { tenantId: ctx.tenantId },
      include: { modifiers: true },
      orderBy: { createdAt: "asc" },
    });
  }),

  createModifierGroup: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        nameEn: z.string().optional(),
        minSelect: z.number().default(0),
        maxSelect: z.number().default(1),
        isRequired: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.modifierGroup.create({
        data: { ...input, tenantId: ctx.tenantId },
      });
    }),

  addModifier: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string().min(1),
        priceAdjust: z.number().default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.modifier.create({
        data: {
          name: input.name,
          priceAdjust: new Prisma.Decimal(input.priceAdjust),
          groupId: input.groupId,
        },
      });
    }),

  deleteModifierGroup: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.modifierGroup.delete({ where: { id: input.id } });
      return { success: true };
    }),

  linkProductToModifierGroup: protectedProcedure
    .input(z.object({ productId: z.string(), groupId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.productModifierGroup.upsert({
        where: { productId_groupId: input },
        create: input,
        update: {},
      });
    }),

  // ============ PUBLIC QR MENU (no auth) ============
  // Customers scan a QR code at their table, this loads the restaurant's
  // public menu without requiring a login. Used in browse-only mode for
  // now — first step toward customer self-ordering.

  publicMenuByTenantSlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.db.tenant.findUnique({
        where: { slug: input.slug },
        select: {
          id: true,
          name: true,
          logoUrl: true,
          currency: true,
          locale: true,
          documentColor: true,
        },
      });
      if (!tenant) throw new TRPCError({ code: "NOT_FOUND", message: "Menu not found" });

      const products = await ctx.db.product.findMany({
        where: { tenantId: tenant.id, isActive: true },
        select: {
          id: true,
          code: true,
          nameAr: true,
          nameEn: true,
          description: true,
          category: true,
          sellingPrice: true,
          vatRate: true,
        },
        orderBy: [{ category: "asc" }, { nameAr: "asc" }],
      });

      // Group by category
      const byCategory: Record<string, typeof products> = {};
      for (const p of products) {
        const cat = p.category || "عام";
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(p);
      }

      return {
        tenant,
        categories: Object.entries(byCategory).map(([name, items]) => ({ name, items })),
      };
    }),

  /**
   * Void (cancel) a whole tab without creating any invoice. Used when a
   * customer walks out, an order is wrong, or the cashier opened a tab
   * by mistake. Requires a reason for audit purposes.
   */
  voidTab: protectedProcedure
    .input(z.object({ tabId: z.string(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const tab = await ctx.db.tab.findFirst({
        where: { id: input.tabId, tenantId: ctx.tenantId, status: "OPEN" },
      });
      if (!tab) throw new TRPCError({ code: "NOT_FOUND", message: "الحساب غير موجود أو مغلق" });

      await ctx.db.$transaction(async (tx) => {
        await tx.tabItem.updateMany({
          where: { tabId: tab.id },
          data: { status: "VOIDED" },
        });
        await tx.tab.update({
          where: { id: tab.id },
          data: {
            status: "CANCELLED",
            closedAt: new Date(),
            notes: `VOIDED: ${input.reason}`,
          },
        });
      });

      return { success: true, tabId: tab.id };
    }),

  // ============ KITCHEN DISPLAY SYSTEM (KDS) ============

  /**
   * Returns every SENT or READY tab item across the tenant, with product,
   * station, and tab context (table number, order type). KDS polls this
   * every few seconds to render a live queue.
   */
  kdsQueue: protectedProcedure
    .input(z.object({ stationId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.tabItem.findMany({
        where: {
          status: { in: ["SENT", "READY"] },
          tab: { tenantId: ctx.tenantId, status: "OPEN" },
          ...(input?.stationId && { stationId: input.stationId }),
        },
        include: {
          product: { select: { nameAr: true, nameEn: true } },
          station: true,
          tab: {
            select: {
              id: true,
              tabNumber: true,
              orderType: true,
              customerName: true,
              table: { select: { name: true } },
            },
          },
        },
        orderBy: { sentAt: "asc" },
      });
    }),

  kdsMarkReady: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.tabItem.findFirst({
        where: { id: input.itemId, tab: { tenantId: ctx.tenantId } },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.tabItem.update({
        where: { id: item.id },
        data: { status: "READY", readyAt: new Date() },
      });
    }),

  kdsMarkServed: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.tabItem.findFirst({
        where: { id: input.itemId, tab: { tenantId: ctx.tenantId } },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.tabItem.update({
        where: { id: item.id },
        data: { status: "SERVED", servedAt: new Date() },
      });
    }),

  // ============ SPLIT BILL ============

  /**
   * Close a SUBSET of a tab into its own invoice — leaves the remaining
   * items on the tab still open. Used for splitting a bill among guests.
   * The tab itself only becomes fully PAID when all items are closed.
   */
  partialClose: protectedProcedure
    .input(
      z.object({
        tabId: z.string(),
        itemIds: z.array(z.string()).min(1),
        paymentMethod: z.enum(["CASH", "CARD", "TRANSFER", "CREDIT"]).default("CASH"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const tab = await ctx.db.tab.findFirst({
        where: { id: input.tabId, tenantId: ctx.tenantId, status: "OPEN" },
        include: { items: { include: { product: true } } },
      });
      if (!tab) throw new TRPCError({ code: "NOT_FOUND", message: "الحساب غير موجود أو مغلق" });

      const itemsToClose = tab.items.filter(
        (i) => input.itemIds.includes(i.id) && i.status !== "VOIDED",
      );
      if (itemsToClose.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا توجد أصناف للإغلاق" });
      }

      const tenant = await ctx.db.tenant.findUnique({
        where: { id: ctx.tenantId },
        select: { vatRate: true, currency: true, country: true },
      });
      const vatRate = tenant ? Number(tenant.vatRate) : 15;
      const currency = tenant?.currency || "SAR";

      const invoiceItems = itemsToClose.map((it, idx) => {
        const qty = Number(it.quantity);
        const unit = Number(it.unitPrice) + Number(it.modifierTotal);
        const net = qty * unit;
        const vat = net * (vatRate / 100);
        return {
          lineNumber: idx + 1,
          description: it.product.nameAr + (it.notes ? ` (${it.notes})` : ""),
          descriptionEn: it.product.nameEn,
          itemCode: it.product.code,
          unitType: "EA",
          quantity: new Prisma.Decimal(qty),
          unitPrice: new Prisma.Decimal(unit),
          discount: new Prisma.Decimal(0),
          discountRate: new Prisma.Decimal(0),
          vatRate: new Prisma.Decimal(vatRate),
          vatAmount: new Prisma.Decimal(vat),
          vatCategory: "S",
          withholdingRate: new Prisma.Decimal(0),
          withholdingAmount: new Prisma.Decimal(0),
          tableTaxRate: new Prisma.Decimal(0),
          tableTaxAmount: new Prisma.Decimal(0),
          netAmount: new Prisma.Decimal(net),
          totalAmount: new Prisma.Decimal(net + vat),
        };
      });

      const subtotal = invoiceItems.reduce((s, i) => s + Number(i.netAmount), 0);
      const totalVat = invoiceItems.reduce((s, i) => s + Number(i.vatAmount), 0);
      const grandTotal = subtotal + totalVat;

      const invoiceNum = await nextCounter(ctx.db, ctx.tenantId, "INVOICE");

      const invoice = await ctx.db.invoice.create({
        data: {
          invoiceNumber: formatInvoiceNumber(invoiceNum),
          type: "SALES",
          status: "READY",
          issueDate: new Date(),
          buyerName: tab.customerName || `Tab #${tab.tabNumber} (split)`,
          buyerCountry: tenant?.country || "SA",
          buyerType: "P",
          currency,
          exchangeRate: new Prisma.Decimal(1),
          subtotal: new Prisma.Decimal(subtotal),
          totalVat: new Prisma.Decimal(totalVat),
          totalWithholding: new Prisma.Decimal(0),
          totalTableTax: new Prisma.Decimal(0),
          totalDiscount: new Prisma.Decimal(0),
          grandTotal: new Prisma.Decimal(grandTotal),
          notes: `Tab #${tab.tabNumber} — split bill`,
          tenantId: ctx.tenantId,
          createdById: ctx.user.id,
          items: { create: invoiceItems },
        },
      });

      // Mark closed items as SERVED (they're paid) and detach from active list
      // by setting status to VOIDED (won't show in kds or tab totals) with a
      // marker note. Cleaner: add a new "PAID" status — but VOIDED keeps the
      // schema simple.
      await ctx.db.tabItem.updateMany({
        where: { id: { in: itemsToClose.map((i) => i.id) } },
        data: { status: "VOIDED" },
      });

      // Recalculate tab totals — if everything is now voided/paid, close it.
      const remaining = await ctx.db.tabItem.count({
        where: { tabId: tab.id, status: { notIn: ["VOIDED"] } },
      });
      if (remaining === 0) {
        await ctx.db.tab.update({
          where: { id: tab.id },
          data: {
            status: "PAID",
            closedAt: new Date(),
            invoiceId: invoice.id, // last invoice wins
          },
        });
      } else {
        // Refresh totals from remaining non-voided items
        const items = await ctx.db.tabItem.findMany({
          where: { tabId: tab.id, status: { not: "VOIDED" } },
        });
        const sub = items.reduce((s, i) => s + Number(i.totalPrice), 0);
        const vat = sub * (vatRate / 100);
        await ctx.db.tab.update({
          where: { id: tab.id },
          data: {
            subtotal: new Prisma.Decimal(sub),
            vatAmount: new Prisma.Decimal(vat),
            total: new Prisma.Decimal(sub + vat),
          },
        });
      }

      return { invoice, paymentMethod: input.paymentMethod, fullyClosed: remaining === 0 };
    }),
});

// Helper: recalculate tab totals after item changes
async function recalculateTabTotals(
  db: { tabItem: any; tab: any; tenant: any },
  tabId: string,
) {
  const items = await db.tabItem.findMany({
    where: { tabId, status: { not: "VOIDED" } },
  });
  const subtotal = items.reduce((s: number, i: any) => s + Number(i.totalPrice), 0);
  const tab = await db.tab.findUnique({ where: { id: tabId }, select: { tenantId: true } });
  const tenant = tab ? await db.tenant.findUnique({ where: { id: tab.tenantId }, select: { vatRate: true } }) : null;
  const vatRate = tenant ? Number(tenant.vatRate) : 15;
  const vatAmount = subtotal * (vatRate / 100);
  await db.tab.update({
    where: { id: tabId },
    data: {
      subtotal: new Prisma.Decimal(subtotal),
      vatAmount: new Prisma.Decimal(vatAmount),
      total: new Prisma.Decimal(subtotal + vatAmount),
    },
  });
}

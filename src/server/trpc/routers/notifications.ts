import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const notificationsRouter = router({
  // Get all notifications for current tenant
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const notifications: { id: string; type: string; title: string; message: string; severity: "info" | "warning" | "danger"; link?: string }[] = [];

    // 1. Overdue invoices
    const overdueInvoices = await ctx.db.invoice.count({
      where: {
        tenantId: ctx.tenantId,
        status: { in: ["DRAFT", "READY", "SUBMITTED"] },
        issueDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });
    if (overdueInvoices > 0) {
      notifications.push({
        id: "overdue-invoices",
        type: "invoice",
        title: "فواتير متأخرة",
        message: `لديك ${overdueInvoices} فاتورة متأخرة أكثر من 30 يوم`,
        severity: "danger",
        link: "/invoices",
      });
    }

    // 2. Low stock alerts
    const lowStock = await ctx.db.product.count({
      where: {
        tenantId: ctx.tenantId,
        isActive: true,
        currentStock: { lte: ctx.db.product.fields.reorderLevel },
      },
    });
    // Simpler query for low stock
    const products = await ctx.db.product.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      select: { currentStock: true, reorderLevel: true },
    });
    const lowStockCount = products.filter(p => Number(p.currentStock) <= Number(p.reorderLevel) && Number(p.reorderLevel) > 0).length;
    if (lowStockCount > 0) {
      notifications.push({
        id: "low-stock",
        type: "inventory",
        title: "نقص مخزون",
        message: `${lowStockCount} منتج وصل لحد إعادة الطلب`,
        severity: "warning",
        link: "/inventory",
      });
    }

    // 3. Pending leave requests
    const pendingLeaves = await ctx.db.leaveRequest.count({
      where: { tenantId: ctx.tenantId, status: "PENDING" },
    });
    if (pendingLeaves > 0) {
      notifications.push({
        id: "pending-leaves",
        type: "hr",
        title: "طلبات إجازة معلقة",
        message: `${pendingLeaves} طلب إجازة ينتظر الموافقة`,
        severity: "info",
        link: "/leaves",
      });
    }

    // 4. Pending expenses
    const pendingExpenses = await ctx.db.expense.count({
      where: { tenantId: ctx.tenantId, status: "SUBMITTED" },
    });
    if (pendingExpenses > 0) {
      notifications.push({
        id: "pending-expenses",
        type: "expense",
        title: "مصروفات تنتظر الاعتماد",
        message: `${pendingExpenses} مصروف ينتظر الموافقة`,
        severity: "info",
        link: "/expenses",
      });
    }

    // 5. Open tickets
    const openTickets = await ctx.db.ticket.count({
      where: { tenantId: ctx.tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } },
    });
    if (openTickets > 0) {
      notifications.push({
        id: "open-tickets",
        type: "helpdesk",
        title: "تذاكر مفتوحة",
        message: `${openTickets} تذكرة مفتوحة تحتاج متابعة`,
        severity: "info",
        link: "/helpdesk",
      });
    }

    // 6. Subscription warning
    const sub = await ctx.db.subscription.findUnique({ where: { tenantId: ctx.tenantId } });
    if (sub) {
      const daysLeft = Math.ceil((sub.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const storagePercent = Number(sub.storageUsed) / Number(sub.storageLimit) * 100;

      if (sub.plan === "FREE_TRIAL" && daysLeft <= 14 && daysLeft > 0) {
        notifications.push({
          id: "trial-ending",
          type: "subscription",
          title: "التجربة المجانية توشك على الانتهاء",
          message: `متبقي ${daysLeft} يوم. اشترك الآن لمتابعة العمل.`,
          severity: "warning",
          link: "/settings",
        });
      }

      if (storagePercent >= 80) {
        notifications.push({
          id: "storage-warning",
          type: "subscription",
          title: "مساحة التخزين تنفد",
          message: `استهلكت ${Math.round(storagePercent)}% من المساحة المتاحة`,
          severity: storagePercent >= 95 ? "danger" : "warning",
          link: "/settings",
        });
      }
    }

    // 7. Unpaid bills
    const unpaidBills = await ctx.db.bill.count({
      where: { tenantId: ctx.tenantId, status: { in: ["APPROVED", "PARTIALLY_PAID"] } },
    });
    if (unpaidBills > 0) {
      notifications.push({
        id: "unpaid-bills",
        type: "bill",
        title: "فواتير مشتريات غير مدفوعة",
        message: `${unpaidBills} فاتورة وارد تحتاج سداد`,
        severity: "warning",
        link: "/bills",
      });
    }

    return notifications;
  }),

  // Get count only (for badge)
  getCount: protectedProcedure.query(async ({ ctx }) => {
    // Quick count without full details
    const [overdueInvoices, pendingLeaves, pendingExpenses, openTickets, unpaidBills] = await Promise.all([
      ctx.db.invoice.count({ where: { tenantId: ctx.tenantId, status: { in: ["DRAFT", "READY"] } } }),
      ctx.db.leaveRequest.count({ where: { tenantId: ctx.tenantId, status: "PENDING" } }),
      ctx.db.expense.count({ where: { tenantId: ctx.tenantId, status: "SUBMITTED" } }),
      ctx.db.ticket.count({ where: { tenantId: ctx.tenantId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      ctx.db.bill.count({ where: { tenantId: ctx.tenantId, status: { in: ["APPROVED", "PARTIALLY_PAID"] } } }),
    ]);

    return overdueInvoices + pendingLeaves + pendingExpenses + openTickets + unpaidBills;
  }),
});

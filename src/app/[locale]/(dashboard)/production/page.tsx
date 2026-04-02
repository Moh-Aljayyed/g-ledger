"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PHASE_CONFIG = [
  { number: 1, nameAr: "المرحلة 1: شراء الغزل", color: "amber", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-400", dot: "bg-amber-500" },
  { number: 2, nameAr: "المرحلة 2: نسيج خارجي", color: "blue", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", ring: "ring-blue-400", dot: "bg-blue-500" },
  { number: 3, nameAr: "المرحلة 3: صباغة خارجية", color: "purple", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", ring: "ring-purple-400", dot: "bg-purple-500" },
  { number: 4, nameAr: "المرحلة 4: تصنيع داخلي (قص → خياطة → تشطيب → تغليف)", color: "green", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", ring: "ring-green-400", dot: "bg-green-500" },
  { number: 5, nameAr: "المرحلة 5: البيع", color: "cyan", bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", ring: "ring-cyan-400", dot: "bg-cyan-500" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  PLANNING: { bg: "bg-gray-100", text: "text-gray-700", label: "تخطيط" },
  IN_PROGRESS: { bg: "bg-blue-100", text: "text-blue-700", label: "قيد التنفيذ" },
  COMPLETED: { bg: "bg-green-100", text: "text-green-700", label: "مكتمل" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700", label: "ملغي" },
};

const PHASE_STATUS_ICON: Record<string, string> = {
  PENDING: "⏳",
  IN_PROGRESS: "🔄",
  COMPLETED: "✅",
};

export default function ProductionPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<{ orderId: string; phase: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Form state for create order
  const [newOrder, setNewOrder] = useState({
    productName: "",
    quantity: 0,
    unit: "متر",
    targetDate: "",
  });

  // Form state for phase update
  const [phaseUpdate, setPhaseUpdate] = useState({
    status: "IN_PROGRESS" as string,
    notes: "",
    cost: 0,
  });

  const { data: summary, refetch: refetchSummary } = trpc.production.getProductionSummary.useQuery();
  const { data: ordersData, isLoading, refetch: refetchOrders } = trpc.production.listOrders.useQuery(
    {
      status: statusFilter ? (statusFilter as any) : undefined,
      search: searchQuery || undefined,
    }
  );

  const createMutation = trpc.production.createOrder.useMutation({
    onSuccess: () => {
      setShowCreateModal(false);
      setNewOrder({ productName: "", quantity: 0, unit: "متر", targetDate: "" });
      refetchOrders();
      refetchSummary();
    },
  });

  const updatePhaseMutation = trpc.production.updatePhase.useMutation({
    onSuccess: () => {
      setShowPhaseModal(false);
      setSelectedPhase(null);
      setPhaseUpdate({ status: "IN_PROGRESS", notes: "", cost: 0 });
      refetchOrders();
      refetchSummary();
    },
  });

  const cancelMutation = trpc.production.cancelOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchSummary();
    },
  });

  const orders = ordersData?.orders ?? [];

  const handleCreateOrder = () => {
    if (!newOrder.productName || !newOrder.quantity || !newOrder.targetDate) return;
    createMutation.mutate(newOrder);
  };

  const handleUpdatePhase = () => {
    if (!selectedPhase) return;
    updatePhaseMutation.mutate({
      orderId: selectedPhase.orderId,
      phase: selectedPhase.phase,
      status: phaseUpdate.status as any,
      notes: phaseUpdate.notes || undefined,
      cost: phaseUpdate.cost || undefined,
    });
  };

  const openPhaseModal = (orderId: string, phase: number, currentStatus: string) => {
    setSelectedPhase({ orderId, phase });
    setPhaseUpdate({
      status: currentStatus === "PENDING" ? "IN_PROGRESS" : "COMPLETED",
      notes: "",
      cost: 0,
    });
    setShowPhaseModal(true);
  };

  const getCurrentPhase = (phases: any[]) => {
    const inProgress = phases.find((p: any) => p.status === "IN_PROGRESS");
    if (inProgress) return inProgress.phase;
    const firstPending = phases.find((p: any) => p.status === "PENDING");
    if (firstPending) return firstPending.phase;
    return 5;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "الإنتاج" : "Production"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isAr ? "إدارة أوامر إنتاج مصنع الملابس والنسيج" : "Manage garment & textile production orders"}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#021544] text-white rounded-xl text-sm font-medium hover:bg-[#021544]/90 transition-colors"
        >
          <span>+</span>
          <span>{isAr ? "أمر إنتاج جديد" : "New Production Order"}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title={isAr ? "إجمالي الأوامر" : "Total Orders"}
          value={summary?.totalOrders ?? 0}
          icon="📋"
          color="blue"
        />
        <SummaryCard
          title={isAr ? "قيد التنفيذ" : "In Progress"}
          value={summary?.byStatus?.IN_PROGRESS ?? 0}
          icon="🔄"
          color="amber"
        />
        <SummaryCard
          title={isAr ? "مكتملة" : "Completed"}
          value={summary?.byStatus?.COMPLETED ?? 0}
          icon="✅"
          color="green"
        />
        <SummaryCard
          title={isAr ? "إجمالي تكلفة الإنتاج" : "Total Production Cost"}
          value={formatCurrency(summary?.totalProductionCost ?? 0, currency)}
          icon="💰"
          color="purple"
          isText
        />
      </div>

      {/* Phase Stats */}
      {summary && summary.phaseStats && summary.totalOrders > 0 && (
        <div className="mb-6 bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold text-[#021544] mb-3">{isAr ? "إحصائيات المراحل" : "Phase Statistics"}</h3>
          <div className="grid grid-cols-5 gap-3">
            {summary.phaseStats.map((ps: any, idx: number) => {
              const config = PHASE_CONFIG[idx];
              return (
                <div key={ps.phase} className={cn("rounded-lg p-3 border", config.bg, config.border)}>
                  <div className={cn("text-xs font-bold mb-1", config.text)}>
                    المرحلة {ps.phase}
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2">{ps.nameAr}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-600">✅ {ps.completed}</span>
                    <span className="text-blue-600">🔄 {ps.inProgress}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? "بحث برقم الأمر أو اسم المنتج..." : "Search by order number or product..."}
            className="w-full px-4 py-2.5 pr-10 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
        >
          <option value="">{isAr ? "جميع الحالات" : "All Statuses"}</option>
          <option value="PLANNING">{isAr ? "تخطيط" : "Planning"}</option>
          <option value="IN_PROGRESS">{isAr ? "قيد التنفيذ" : "In Progress"}</option>
          <option value="COMPLETED">{isAr ? "مكتمل" : "Completed"}</option>
          <option value="CANCELLED">{isAr ? "ملغي" : "Cancelled"}</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground w-8"></th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "رقم الأمر" : "Order No."}</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المنتج" : "Product"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الكمية" : "Quantity"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المرحلة الحالية" : "Current Phase"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الحالة" : "Status"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التاريخ المستهدف" : "Target Date"}</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التكلفة" : "Cost"}</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  {isAr ? "لا توجد أوامر إنتاج" : "No production orders"}
                </td>
              </tr>
            ) : (
              orders.map((order: any) => {
                const isExpanded = expandedOrderId === order.id;
                const currentPhase = getCurrentPhase(order.phases);
                const statusStyle = STATUS_STYLES[order.status] ?? STATUS_STYLES.PLANNING;

                return (
                  <OrderRow
                    key={order.id}
                    order={order}
                    isExpanded={isExpanded}
                    currentPhase={currentPhase}
                    statusStyle={statusStyle}
                    currency={currency}
                    onToggleExpand={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    onPhaseClick={openPhaseModal}
                    onCancel={() => {
                      if (confirm("هل أنت متأكد من إلغاء أمر الإنتاج؟")) {
                        cancelMutation.mutate({ id: order.id });
                      }
                    }}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)} title={isAr ? "أمر إنتاج جديد" : "New Production Order"}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "اسم المنتج" : "Product Name"}</label>
              <input
                type="text"
                value={newOrder.productName}
                onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                placeholder="مثال: قماش قطني أبيض"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{isAr ? "الكمية" : "Quantity"}</label>
                <input
                  type="number"
                  value={newOrder.quantity || ""}
                  onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{isAr ? "الوحدة" : "Unit"}</label>
                <select
                  value={newOrder.unit}
                  onChange={(e) => setNewOrder({ ...newOrder, unit: e.target.value })}
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
                >
                  <option value="متر">متر</option>
                  <option value="كجم">كجم</option>
                  <option value="قطعة">قطعة</option>
                  <option value="بكرة">بكرة</option>
                  <option value="طن">طن</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "التاريخ المستهدف" : "Target Date"}</label>
              <input
                type="date"
                value={newOrder.targetDate}
                onChange={(e) => setNewOrder({ ...newOrder, targetDate: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreateOrder}
                disabled={createMutation.isPending || !newOrder.productName || !newOrder.quantity || !newOrder.targetDate}
                className="flex-1 px-4 py-2.5 bg-[#021544] text-white rounded-lg text-sm font-medium hover:bg-[#021544]/90 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? (isAr ? "جاري الإنشاء..." : "Creating...") : (isAr ? "إنشاء أمر الإنتاج" : "Create Order")}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
            {createMutation.error && (
              <p className="text-sm text-red-600">{createMutation.error.message}</p>
            )}
          </div>
        </Modal>
      )}

      {/* Phase Update Modal */}
      {showPhaseModal && selectedPhase && (
        <Modal
          onClose={() => { setShowPhaseModal(false); setSelectedPhase(null); }}
          title={`تحديث ${PHASE_CONFIG[selectedPhase.phase - 1]?.nameAr}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "الحالة" : "Status"}</label>
              <select
                value={phaseUpdate.status}
                onChange={(e) => setPhaseUpdate({ ...phaseUpdate, status: e.target.value })}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
              >
                <option value="PENDING">{isAr ? "معلق" : "Pending"}</option>
                <option value="IN_PROGRESS">{isAr ? "قيد التنفيذ" : "In Progress"}</option>
                <option value="COMPLETED">{isAr ? "مكتمل" : "Completed"}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "التكلفة" : "Cost"}</label>
              <input
                type="number"
                value={phaseUpdate.cost || ""}
                onChange={(e) => setPhaseUpdate({ ...phaseUpdate, cost: Number(e.target.value) })}
                placeholder="0.00"
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isAr ? "ملاحظات" : "Notes"}</label>
              <textarea
                value={phaseUpdate.notes}
                onChange={(e) => setPhaseUpdate({ ...phaseUpdate, notes: e.target.value })}
                placeholder="ملاحظات اختيارية..."
                rows={3}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#021544]/20 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpdatePhase}
                disabled={updatePhaseMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-[#021544] text-white rounded-lg text-sm font-medium hover:bg-[#021544]/90 disabled:opacity-50 transition-colors"
              >
                {updatePhaseMutation.isPending ? (isAr ? "جاري التحديث..." : "Updating...") : (isAr ? "تحديث المرحلة" : "Update Phase")}
              </button>
              <button
                onClick={() => { setShowPhaseModal(false); setSelectedPhase(null); }}
                className="px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
            {updatePhaseMutation.error && (
              <p className="text-sm text-red-600">{updatePhaseMutation.error.message}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============ Sub-Components ============

function SummaryCard({
  title,
  value,
  icon,
  color,
  isText,
}: {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  isText?: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10 to-blue-500/5 border-blue-200",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-200",
    green: "from-green-500/10 to-green-500/5 border-green-200",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-200",
  };

  return (
    <div className={cn("rounded-xl border p-5 bg-gradient-to-br", colorMap[color])}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-[#021544] font-mono">
        {isText ? value : (value as number).toLocaleString("ar-SA")}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{title}</div>
    </div>
  );
}

function OrderRow({
  order,
  isExpanded,
  currentPhase,
  statusStyle,
  currency,
  onToggleExpand,
  onPhaseClick,
  onCancel,
}: {
  order: any;
  isExpanded: boolean;
  currentPhase: number;
  statusStyle: { bg: string; text: string; label: string };
  currency: string;
  onToggleExpand: () => void;
  onPhaseClick: (orderId: string, phase: number, status: string) => void;
  onCancel: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={onToggleExpand}>
        <td className="px-4 py-3">
          <span className={cn("text-xs transition-transform inline-block", isExpanded && "rotate-90")}>
            ▶
          </span>
        </td>
        <td className="px-4 py-3 text-sm font-mono font-medium">{order.orderNumber}</td>
        <td className="px-4 py-3 text-sm font-medium">{order.productName}</td>
        <td className="px-4 py-3 text-sm text-center font-mono">
          {order.quantity.toLocaleString("ar-SA")} {order.unit}
        </td>
        <td className="px-4 py-3 text-center">
          <span className={cn(
            "inline-flex px-2 py-0.5 rounded text-xs font-medium",
            PHASE_CONFIG[currentPhase - 1]?.bg,
            PHASE_CONFIG[currentPhase - 1]?.text,
          )}>
            المرحلة {currentPhase}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={cn("inline-flex px-2 py-0.5 rounded text-xs font-medium", statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-center">{order.targetDate}</td>
        <td className="px-4 py-3 text-sm text-end font-mono">{formatCurrency(order.totalCost, currency)}</td>
        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <button
              onClick={onCancel}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
              title="إلغاء"
            >
              إلغاء
            </button>
          )}
        </td>
      </tr>

      {/* Expanded Phase Details */}
      {isExpanded && (
        <tr>
          <td colSpan={9} className="px-6 py-4 bg-muted/10">
            {/* Visual Phase Flow - Horizontal Stepper */}
            <div className="mb-4">
              <div className="flex items-center justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border" />

                {PHASE_CONFIG.map((config, idx) => {
                  const phase = order.phases[idx];
                  const isCompleted = phase?.status === "COMPLETED";
                  const isInProgress = phase?.status === "IN_PROGRESS";

                  return (
                    <div key={config.number} className="flex flex-col items-center relative z-10 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (order.status !== "CANCELLED" && order.status !== "COMPLETED") {
                            onPhaseClick(order.id, config.number, phase?.status ?? "PENDING");
                          }
                        }}
                        disabled={order.status === "CANCELLED" || order.status === "COMPLETED"}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2",
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isInProgress
                            ? cn("bg-white border-2 animate-pulse", `border-${config.color}-500`, config.text)
                            : "bg-white border-gray-300 text-gray-400",
                          order.status !== "CANCELLED" && order.status !== "COMPLETED" && "hover:scale-110 cursor-pointer"
                        )}
                        title={`${config.nameAr} - ${PHASE_STATUS_ICON[phase?.status ?? "PENDING"]}`}
                      >
                        {isCompleted ? "✓" : config.number}
                      </button>
                      <div className={cn(
                        "mt-2 text-[10px] font-medium text-center max-w-[100px] leading-tight",
                        isCompleted ? "text-green-700" : isInProgress ? config.text : "text-gray-400"
                      )}>
                        {config.nameAr.replace(/المرحلة \d: /, "")}
                      </div>
                      {phase?.cost > 0 && (
                        <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                          {formatCurrency(phase.cost, "SAR")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase Detail Cards */}
            <div className="grid grid-cols-5 gap-2">
              {PHASE_CONFIG.map((config, idx) => {
                const phase = order.phases[idx];
                return (
                  <div
                    key={config.number}
                    className={cn(
                      "rounded-lg p-3 border text-xs",
                      phase?.status === "COMPLETED"
                        ? "bg-green-50 border-green-200"
                        : phase?.status === "IN_PROGRESS"
                        ? cn(config.bg, config.border)
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{PHASE_STATUS_ICON[phase?.status ?? "PENDING"]}</span>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        phase?.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        phase?.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-500"
                      )}>
                        {phase?.status === "COMPLETED" ? "مكتمل" : phase?.status === "IN_PROGRESS" ? "قيد التنفيذ" : "معلق"}
                      </span>
                    </div>
                    {phase?.notes && (
                      <p className="text-muted-foreground mt-1 truncate" title={phase.notes}>{phase.notes}</p>
                    )}
                    {phase?.completedAt && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        اكتمل: {new Date(phase.completedAt).toLocaleDateString("ar-SA")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#021544]">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

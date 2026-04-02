"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "منخفض", color: "bg-gray-100 text-gray-600" },
  MEDIUM: { label: "متوسط", color: "bg-blue-100 text-blue-700" },
  HIGH: { label: "عالي", color: "bg-orange-100 text-orange-700" },
  URGENT: { label: "عاجل", color: "bg-red-100 text-red-700 animate-pulse" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  OPEN: { label: "مفتوحة", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "قيد التنفيذ", color: "bg-yellow-100 text-yellow-700" },
  WAITING: { label: "بانتظار الرد", color: "bg-purple-100 text-purple-700" },
  RESOLVED: { label: "تم الحل", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "مغلقة", color: "bg-gray-100 text-gray-700" },
};

const CATEGORIES = [
  { value: "billing", label: "فواتير" },
  { value: "technical", label: "تقني" },
  { value: "feature_request", label: "طلب ميزة" },
  { value: "bug", label: "خطأ برمجي" },
  { value: "other", label: "أخرى" },
];

type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export default function HelpdeskPage() {
  const utils = trpc.useUtils();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "">("");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = trpc.helpdesk.list.useQuery({
    status: filterStatus ? (filterStatus as TicketStatus) : undefined,
    priority: filterPriority ? (filterPriority as TicketPriority) : undefined,
  });
  const { data: stats } = trpc.helpdesk.getStats.useQuery();

  const createMutation = trpc.helpdesk.create.useMutation({
    onSuccess: () => { utils.helpdesk.invalidate(); setShowCreateModal(false); resetForm(); },
  });
  const updateMutation = trpc.helpdesk.update.useMutation({ onSuccess: () => utils.helpdesk.invalidate() });
  const resolveMutation = trpc.helpdesk.resolve.useMutation({ onSuccess: () => utils.helpdesk.invalidate() });
  const closeMutation = trpc.helpdesk.close.useMutation({ onSuccess: () => utils.helpdesk.invalidate() });

  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "MEDIUM" as TicketPriority,
    category: "",
  });

  const resetForm = () => setForm({ subject: "", description: "", priority: "MEDIUM", category: "" });

  const handleCreate = () => {
    if (!form.subject || !form.description) return;
    createMutation.mutate({
      subject: form.subject,
      description: form.description,
      priority: form.priority,
      category: form.category || undefined,
    });
  };

  const formatDate = (d: string | Date) => new Date(d).toLocaleDateString("ar-SA");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "تذاكر الدعم" : "Support Tickets"}</h1>
          <p className="text-sm text-gray-500 mt-1">{isAr ? "إدارة ومتابعة تذاكر الدعم الفني" : "Manage and track support tickets"}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg hover:bg-[#005bc4] text-sm font-medium transition-colors">
          {isAr ? "+ تذكرة جديدة" : "+ New Ticket"}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "تذاكر مفتوحة" : "Open Tickets"}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.openCount}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "قيد التنفيذ" : "In Progress"}</div>
            <div className="text-2xl font-bold text-amber-600">{stats.inProgressCount}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "تم الحل اليوم" : "Resolved Today"}</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "متوسط وقت الحل" : "Avg. Resolution Time"}</div>
            <div className="text-2xl font-bold text-[#021544]">{stats.avgResolutionHours}<span className="text-xs text-gray-400"> {isAr ? "ساعة" : "hrs"}</span></div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">{isAr ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">{isAr ? "كل الأولويات" : "All Priorities"}</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "رقم التذكرة" : "Ticket No."}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الموضوع" : "Subject"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الأولوية" : "Priority"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الحالة" : "Status"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "التصنيف" : "Category"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "تاريخ الإنشاء" : "Created"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {data?.tickets.map((ticket) => {
                const prioConf = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
                const statusConf = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                const catLabel = CATEGORIES.find((c) => c.value === ticket.category)?.label || ticket.category || "-";
                const isExpanded = expandedId === ticket.id;

                return (
                  <>
                    <tr
                      key={ticket.id}
                      className="border-b hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">{ticket.ticketNumber}</td>
                      <td className="px-4 py-3 text-xs font-medium max-w-[200px] truncate">{ticket.subject}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${prioConf.color}`}>{prioConf.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusConf.color}`}>{statusConf.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{catLabel}</td>
                      <td className="px-4 py-3 text-xs">{formatDate(ticket.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {ticket.status === "OPEN" && (
                            <button onClick={() => updateMutation.mutate({ id: ticket.id, status: "IN_PROGRESS" })} className="text-[10px] px-2 py-1 rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-100">{isAr ? "بدء العمل" : "Start"}</button>
                          )}
                          {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS" || ticket.status === "WAITING") && (
                            <button onClick={() => resolveMutation.mutate({ id: ticket.id })} className="text-[10px] px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100">{isAr ? "تم الحل" : "Resolved"}</button>
                          )}
                          {ticket.status === "RESOLVED" && (
                            <button onClick={() => closeMutation.mutate({ id: ticket.id })} className="text-[10px] px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100">{isAr ? "إغلاق" : "Close"}</button>
                          )}
                          {ticket.status === "IN_PROGRESS" && (
                            <button onClick={() => updateMutation.mutate({ id: ticket.id, status: "WAITING" })} className="text-[10px] px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100">{isAr ? "بانتظار الرد" : "Waiting"}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${ticket.id}-detail`} className="border-b bg-gray-50/50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="text-xs text-gray-500 mb-1 font-bold">{isAr ? "تفاصيل التذكرة:" : "Ticket Details:"}</div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{ticket.description}</p>
                          <div className="flex gap-2">
                            {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
                              <>
                                <button onClick={() => updateMutation.mutate({ id: ticket.id, priority: "HIGH" })} className="text-[10px] px-2 py-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100">{isAr ? "رفع الأولوية" : "Raise Priority"}</button>
                                <button onClick={() => updateMutation.mutate({ id: ticket.id, priority: "URGENT" })} className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">{isAr ? "عاجل" : "Urgent"}</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {(!data?.tickets || data.tickets.length === 0) && (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">{isAr ? "لا توجد تذاكر دعم" : "No support tickets"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">{isAr ? "تذكرة دعم جديدة" : "New Support Ticket"}</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الموضوع *</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="موضوع التذكرة" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف *</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} placeholder="وصف المشكلة بالتفصيل" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الأولوية</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">التصنيف</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">اختر التصنيف</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !form.subject || !form.description}
                className="flex-1 px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005bc4] disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "إنشاء التذكرة" : "Create Ticket")}
              </button>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

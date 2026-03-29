"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";

const STATUS_CONFIG = {
  NEW: { label: "جديد", color: "bg-gray-100 text-gray-700 border-gray-300", headerBg: "bg-gray-50", dot: "bg-gray-400" },
  CONTACTED: { label: "تم التواصل", color: "bg-blue-100 text-blue-700 border-blue-300", headerBg: "bg-blue-50", dot: "bg-blue-400" },
  QUALIFIED: { label: "مؤهل", color: "bg-purple-100 text-purple-700 border-purple-300", headerBg: "bg-purple-50", dot: "bg-purple-400" },
  PROPOSAL: { label: "عرض سعر", color: "bg-amber-100 text-amber-700 border-amber-300", headerBg: "bg-amber-50", dot: "bg-amber-400" },
  WON: { label: "فاز", color: "bg-green-100 text-green-700 border-green-300", headerBg: "bg-green-50", dot: "bg-green-400" },
  LOST: { label: "خسر", color: "bg-red-100 text-red-700 border-red-300", headerBg: "bg-red-50", dot: "bg-red-400" },
} as const;

const SOURCES = [
  { value: "website", label: "الموقع الإلكتروني" },
  { value: "referral", label: "إحالة" },
  { value: "social", label: "وسائل التواصل" },
  { value: "cold_call", label: "اتصال مباشر" },
  { value: "exhibition", label: "معرض" },
  { value: "other", label: "أخرى" },
];

type LeadStatus = keyof typeof STATUS_CONFIG;

export default function CRMPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const utils = trpc.useUtils();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data: pipeline, isLoading } = trpc.crm.getPipeline.useQuery();
  const { data: stats } = trpc.crm.getStats.useQuery();

  const createMutation = trpc.crm.createLead.useMutation({
    onSuccess: () => { utils.crm.invalidate(); setShowAddModal(false); },
  });
  const updateMutation = trpc.crm.updateLead.useMutation({
    onSuccess: () => { utils.crm.invalidate(); },
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "", expectedRevenue: "", notes: "" });

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createMutation.mutate({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      source: form.source || undefined,
      expectedRevenue: form.expectedRevenue ? parseFloat(form.expectedRevenue) : undefined,
      notes: form.notes || undefined,
    });
    setForm({ name: "", email: "", phone: "", company: "", source: "", expectedRevenue: "", notes: "" });
  };

  const moveToStatus = (leadId: string, newStatus: LeadStatus) => {
    updateMutation.mutate({ id: leadId, status: newStatus });
  };

  const daysSince = (date: string | Date) => {
    return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatNum = (n: number) => new Intl.NumberFormat("ar-SA").format(Math.round(n));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statuses: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];
  const nextStatus: Record<string, LeadStatus | null> = {
    NEW: "CONTACTED", CONTACTED: "QUALIFIED", QUALIFIED: "PROPOSAL", PROPOSAL: "WON",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021544]">العملاء المحتملين (CRM)</h1>
          <p className="text-sm text-gray-500 mt-1">إدارة العملاء المحتملين ومتابعة المبيعات</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg hover:bg-[#005bc4] text-sm font-medium transition-colors">
          + عميل محتمل جديد
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">إجمالي العملاء المحتملين</div>
            <div className="text-2xl font-bold text-[#021544]">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">قيمة الفرص المفتوحة</div>
            <div className="text-2xl font-bold text-[#0070F2]">{formatNum(stats.pipelineValue)} {currency}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">نسبة التحويل</div>
            <div className="text-2xl font-bold text-green-600">{stats.conversionRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">فاز / خسر</div>
            <div className="text-2xl font-bold">
              <span className="text-green-600">{stats.won}</span>
              <span className="text-gray-300 mx-1">/</span>
              <span className="text-red-500">{stats.lost}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="بحث بالاسم أو الشركة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F2]/20 focus:border-[#0070F2]"
        />
      </div>

      {/* Kanban Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
        {statuses.map((status) => {
          const config = STATUS_CONFIG[status];
          const column = pipeline?.find((p) => p.status === status);
          const leads = (column?.leads ?? []).filter((l) =>
            !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.company?.toLowerCase() || "").includes(search.toLowerCase())
          );

          return (
            <div key={status} className="min-w-[240px]">
              {/* Column Header */}
              <div className={`${config.headerBg} rounded-t-xl border border-b-0 px-3 py-2.5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                    <span className="text-xs font-bold text-gray-700">{config.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-white rounded-full px-2 py-0.5">{leads.length}</span>
                </div>
                {column && column.totalRevenue > 0 && (
                  <div className="text-[10px] text-gray-500 mt-1">{formatNum(column.totalRevenue)} {currency}</div>
                )}
              </div>

              {/* Cards */}
              <div className="border border-t-0 rounded-b-xl bg-gray-50/50 p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-lg border p-3 hover:shadow-md transition-shadow">
                    <div className="font-medium text-sm text-[#021544] mb-1">{lead.name}</div>
                    {lead.company && <div className="text-[10px] text-gray-500 mb-1">{lead.company}</div>}
                    {Number(lead.expectedRevenue) > 0 && (
                      <div className="text-xs font-bold text-[#0070F2] mb-1">{formatNum(Number(lead.expectedRevenue))} {currency}</div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-gray-400">{daysSince(lead.createdAt)} يوم</span>
                      {lead.source && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded">{lead.source}</span>}
                    </div>
                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2">
                      {nextStatus[status] && (
                        <button
                          onClick={() => moveToStatus(lead.id, nextStatus[status]!)}
                          className="flex-1 text-[10px] py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          &larr; {STATUS_CONFIG[nextStatus[status]!].label}
                        </button>
                      )}
                      {status !== "LOST" && status !== "WON" && (
                        <button
                          onClick={() => moveToStatus(lead.id, "LOST")}
                          className="text-[10px] py-1 px-2 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        >
                          خسر
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {leads.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-8">لا توجد بيانات</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">عميل محتمل جديد</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الاسم *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="اسم العميل المحتمل" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الإيميل</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الهاتف</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="05XXXXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الشركة</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="اسم الشركة" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المصدر</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">اختر المصدر</option>
                    {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الإيراد المتوقع</label>
                <input type="number" value={form.expectedRevenue} onChange={(e) => setForm({ ...form, expectedRevenue: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="ملاحظات إضافية" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} disabled={createMutation.isPending || !form.name.trim()} className="flex-1 px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005bc4] disabled:opacity-50 transition-colors">
                {createMutation.isPending ? "جاري الحفظ..." : "إضافة"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

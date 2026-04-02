"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

const LEAVE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  ANNUAL: { label: "إجازة سنوية", color: "bg-blue-100 text-blue-700" },
  SICK: { label: "إجازة مرضية", color: "bg-red-100 text-red-700" },
  UNPAID: { label: "بدون راتب", color: "bg-gray-100 text-gray-700" },
  MATERNITY: { label: "إجازة أمومة", color: "bg-pink-100 text-pink-700" },
  EMERGENCY: { label: "إجازة طارئة", color: "bg-orange-100 text-orange-700" },
  HAJJ: { label: "إجازة حج", color: "bg-green-100 text-green-700" },
  OTHER: { label: "أخرى", color: "bg-gray-100 text-gray-600" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "بانتظار الموافقة", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "موافق عليها", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "مرفوضة", color: "bg-red-100 text-red-700" },
  CANCELLED: { label: "ملغاة", color: "bg-gray-100 text-gray-700" },
};

type LeaveType = "ANNUAL" | "SICK" | "UNPAID" | "MATERNITY" | "EMERGENCY" | "HAJJ" | "OTHER";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export default function LeavesPage() {
  const utils = trpc.useUtils();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | "">("");
  const [filterType, setFilterType] = useState<LeaveType | "">("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = trpc.leaves.list.useQuery({
    status: filterStatus ? (filterStatus as LeaveStatus) : undefined,
    type: filterType ? (filterType as LeaveType) : undefined,
  });
  const { data: stats } = trpc.leaves.getStats.useQuery();
  const { data: employees } = trpc.employees.list.useQuery({ limit: 100 });
  const { data: balance } = trpc.leaves.getBalance.useQuery(
    { employeeId: selectedEmployeeId },
    { enabled: !!selectedEmployeeId }
  );

  const createMutation = trpc.leaves.create.useMutation({
    onSuccess: () => { utils.leaves.invalidate(); setShowCreateModal(false); resetForm(); },
  });
  const approveMutation = trpc.leaves.approve.useMutation({ onSuccess: () => utils.leaves.invalidate() });
  const rejectMutation = trpc.leaves.reject.useMutation({
    onSuccess: () => { utils.leaves.invalidate(); setRejectId(null); setRejectReason(""); },
  });
  const cancelMutation = trpc.leaves.cancel.useMutation({ onSuccess: () => utils.leaves.invalidate() });

  const [form, setForm] = useState({
    employeeId: "",
    type: "" as LeaveType | "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const resetForm = () => setForm({ employeeId: "", type: "", startDate: "", endDate: "", reason: "" });

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end < start) return 0;
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 5 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count || 1;
  };

  const handleCreate = () => {
    if (!form.employeeId || !form.type || !form.startDate || !form.endDate) return;
    createMutation.mutate({
      employeeId: form.employeeId,
      type: form.type as LeaveType,
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      reason: form.reason || undefined,
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
          <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "الإجازات" : "Leaves"}</h1>
          <p className="text-sm text-gray-500 mt-1">{isAr ? "إدارة طلبات الإجازات والأرصدة" : "Manage leave requests and balances"}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg hover:bg-[#005bc4] text-sm font-medium transition-colors">
          {isAr ? "+ طلب إجازة" : "+ Leave Request"}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "بانتظار الموافقة" : "Pending Approval"}</div>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingCount}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "في إجازة اليوم" : "On Leave Today"}</div>
            <div className="text-2xl font-bold text-blue-600">{stats.onLeaveToday}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "موافق عليها هذا الشهر" : "Approved This Month"}</div>
            <div className="text-2xl font-bold text-green-600">{stats.approvedThisMonth}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "إجمالي الأيام هذا العام" : "Total Days This Year"}</div>
            <div className="text-2xl font-bold text-[#021544]">{stats.totalDaysUsed}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">{isAr ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">{isAr ? "كل الأنواع" : "All Types"}</option>
          {Object.entries(LEAVE_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الموظف" : "Employee"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "نوع الإجازة" : "Leave Type"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "من" : "From"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "إلى" : "To"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الأيام" : "Days"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "السبب" : "Reason"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الحالة" : "Status"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {data?.requests.map((req) => {
                const typeConf = LEAVE_TYPE_CONFIG[req.type] || LEAVE_TYPE_CONFIG.OTHER;
                const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                return (
                  <tr key={req.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium">{req.employee.nameAr}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${typeConf.color}`}>{typeConf.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{formatDate(req.startDate)}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(req.endDate)}</td>
                    <td className="px-4 py-3 text-xs font-bold text-center">{req.days}</td>
                    <td className="px-4 py-3 text-xs max-w-[150px] truncate text-gray-500">{req.reason || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {req.status === "PENDING" && (
                          <>
                            <button onClick={() => approveMutation.mutate({ id: req.id })} className="text-[10px] px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100">{isAr ? "موافقة" : "Approve"}</button>
                            <button onClick={() => setRejectId(req.id)} className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">{isAr ? "رفض" : "Reject"}</button>
                          </>
                        )}
                        {(req.status === "PENDING" || req.status === "APPROVED") && (
                          <button onClick={() => cancelMutation.mutate({ id: req.id })} className="text-[10px] px-2 py-1 rounded bg-gray-50 text-gray-600 hover:bg-gray-100">{isAr ? "إلغاء" : "Cancel"}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!data?.requests || data.requests.length === 0) && (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">{isAr ? "لا توجد طلبات إجازة" : "No leave requests"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "سبب الرفض" : "Rejection Reason"}</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4"
              rows={3}
              placeholder="اكتب سبب الرفض (اختياري)"
            />
            <div className="flex gap-2">
              <button
                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason || undefined })}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                {isAr ? "رفض" : "Reject"}
              </button>
              <button onClick={() => { setRejectId(null); setRejectReason(""); }} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">{isAr ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Leave Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">{isAr ? "طلب إجازة جديد" : "New Leave Request"}</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); setSelectedEmployeeId(""); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الموظف *</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => {
                    setForm({ ...form, employeeId: e.target.value });
                    setSelectedEmployeeId(e.target.value);
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">اختر الموظف</option>
                  {employees?.employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.nameAr} ({emp.employeeNumber})</option>
                  ))}
                </select>
              </div>

              {/* Leave Balance */}
              {selectedEmployeeId && balance && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs font-bold text-gray-600 mb-2">{isAr ? "رصيد الإجازات" : "Leave Balance"}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {balance.map((b) => {
                      const conf = LEAVE_TYPE_CONFIG[b.type];
                      return (
                        <div key={b.type} className="text-center">
                          <div className="text-[10px] text-gray-500">{conf?.label}</div>
                          <div className="text-sm font-bold text-[#021544]">{b.remaining}<span className="text-[10px] text-gray-400">/{b.total}</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">نوع الإجازة *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="">اختر النوع</option>
                  {Object.entries(LEAVE_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">من تاريخ *</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">إلى تاريخ *</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              {form.startDate && form.endDate && (
                <div className="text-xs text-gray-500 bg-blue-50 rounded-lg px-3 py-2">
                  {isAr ? "عدد أيام العمل:" : "Working days:"} <span className="font-bold text-[#021544]">{calcDays()} {isAr ? "يوم" : "days"}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">السبب</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="سبب الإجازة (اختياري)" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !form.employeeId || !form.type || !form.startDate || !form.endDate}
                className="flex-1 px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005bc4] disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "تقديم الطلب" : "Submit Request")}
              </button>
              <button onClick={() => { setShowCreateModal(false); resetForm(); setSelectedEmployeeId(""); }} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

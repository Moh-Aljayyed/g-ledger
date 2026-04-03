"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

const ATTENDANCE_STATUS: Record<string, { ar: string; en: string; color: string }> = {
  PRESENT: { ar: "حاضر", en: "Present", color: "bg-green-100 text-green-700" },
  ABSENT: { ar: "غائب", en: "Absent", color: "bg-red-100 text-red-700" },
  LATE: { ar: "متأخر", en: "Late", color: "bg-yellow-100 text-yellow-700" },
  HALF_DAY: { ar: "نصف يوم", en: "Half Day", color: "bg-orange-100 text-orange-700" },
  HOLIDAY: { ar: "إجازة رسمية", en: "Holiday", color: "bg-blue-100 text-blue-700" },
};

const ADVANCE_STATUS: Record<string, { ar: string; en: string; color: string }> = {
  PENDING: { ar: "بانتظار الموافقة", en: "Pending", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { ar: "موافق عليها", en: "Approved", color: "bg-green-100 text-green-700" },
  REJECTED: { ar: "مرفوضة", en: "Rejected", color: "bg-red-100 text-red-700" },
  DEDUCTED: { ar: "تم الخصم", en: "Deducted", color: "bg-gray-100 text-gray-700" },
};

const CERT_TYPES: Record<string, { ar: string; en: string }> = {
  EXPERIENCE: { ar: "شهادة خبرة", en: "Experience Certificate" },
  SALARY: { ar: "شهادة راتب", en: "Salary Certificate" },
  EMPLOYMENT: { ar: "تعريف بالراتب", en: "Employment Letter" },
};

export default function HRDashboardPage() {
  const utils = trpc.useUtils();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const basePath = isAr ? "/ar" : "/en";

  // State
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [approveId, setApproveId] = useState<string | null>(null);
  const [deductMonth, setDeductMonth] = useState("");

  // Forms
  const [attendanceForm, setAttendanceForm] = useState({
    employeeId: "",
    date: new Date().toISOString().split("T")[0],
    checkIn: "",
    checkOut: "",
    status: "PRESENT",
  });
  const [certForm, setCertForm] = useState({ employeeId: "", type: "EXPERIENCE" });
  const [advanceForm, setAdvanceForm] = useState({ employeeId: "", amount: "", reason: "" });
  const [payslipForm, setPayslipForm] = useState({ employeeId: "", period: "" });

  // Queries
  const { data: stats } = trpc.hr.getStats.useQuery();
  const { data: employees } = trpc.employees.list.useQuery({ limit: 200 });
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: attendance } = trpc.hr.getAttendance.useQuery({ month: currentMonth });
  const { data: pendingAdvances } = trpc.hr.listAdvances.useQuery({ status: "PENDING" });
  const { data: expiringDocs } = trpc.hr.getExpiringDocuments.useQuery();
  const { data: payslip } = trpc.hr.getPayslip.useQuery(
    { employeeId: payslipForm.employeeId, period: payslipForm.period },
    { enabled: !!payslipForm.employeeId && !!payslipForm.period }
  );

  // Mutations
  const markAttendance = trpc.hr.markAttendance.useMutation({
    onSuccess: () => {
      utils.hr.getAttendance.invalidate();
      utils.hr.getStats.invalidate();
      setShowAttendanceModal(false);
    },
  });
  const requestCert = trpc.hr.requestCertificate.useMutation({
    onSuccess: () => {
      setShowCertModal(false);
      setCertForm({ employeeId: "", type: "EXPERIENCE" });
    },
  });
  const requestAdvance = trpc.hr.requestAdvance.useMutation({
    onSuccess: () => {
      utils.hr.listAdvances.invalidate();
      utils.hr.getStats.invalidate();
      setShowAdvanceModal(false);
      setAdvanceForm({ employeeId: "", amount: "", reason: "" });
    },
  });
  const approveAdvance = trpc.hr.approveAdvance.useMutation({
    onSuccess: () => {
      utils.hr.listAdvances.invalidate();
      utils.hr.getStats.invalidate();
      setApproveId(null);
      setDeductMonth("");
    },
  });
  const rejectAdvance = trpc.hr.rejectAdvance.useMutation({
    onSuccess: () => {
      utils.hr.listAdvances.invalidate();
      utils.hr.getStats.invalidate();
    },
  });

  const empList = (employees as any)?.employees ?? employees ?? [];

  const statCards = [
    { label: isAr ? "إجمالي الموظفين" : "Total Employees", value: stats?.totalEmployees ?? 0, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: isAr ? "الموظفون النشطون" : "Active", value: stats?.activeEmployees ?? 0, icon: "✅", color: "from-green-500 to-green-600" },
    { label: isAr ? "الحاضرون اليوم" : "Present Today", value: stats?.presentToday ?? 0, icon: "🏢", color: "from-emerald-500 to-emerald-600" },
    { label: isAr ? "في إجازة" : "On Leave", value: stats?.onLeaveToday ?? 0, icon: "🏖️", color: "from-orange-500 to-orange-600" },
    { label: isAr ? "سلف معلقة" : "Pending Advances", value: stats?.pendingAdvances ?? 0, icon: "💰", color: "from-yellow-500 to-yellow-600" },
    { label: isAr ? "وثائق تنتهي قريبا" : "Expiring Docs", value: stats?.expiringDocs ?? 0, icon: "⚠️", color: "from-red-500 to-red-600" },
  ];

  const quickActions = [
    { label: isAr ? "تسجيل حضور" : "Mark Attendance", icon: "🕐", onClick: () => setShowAttendanceModal(true) },
    { label: isAr ? "طلب شهادة" : "Request Certificate", icon: "📜", onClick: () => setShowCertModal(true) },
    { label: isAr ? "سلفة راتب" : "Salary Advance", icon: "💸", onClick: () => setShowAdvanceModal(true) },
    { label: isAr ? "كشف راتب" : "My Payslip", icon: "📄", onClick: () => setShowPayslipModal(true) },
    { label: isAr ? "الموظفون" : "Employees", icon: "🧑‍💼", href: `${basePath}/employees` },
    { label: isAr ? "الإجازات" : "Leaves", icon: "🏖️", href: `${basePath}/leaves` },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAr ? "الموارد البشرية" : "Human Resources"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAr ? "لوحة تحكم شاملة لإدارة شؤون الموظفين" : "Comprehensive HR management dashboard"}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
            <div className={`absolute top-0 ${isAr ? "right-0" : "left-0"} w-1 h-full bg-gradient-to-b ${s.color}`} />
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {isAr ? "إجراءات سريعة" : "Quick Actions"}
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {quickActions.map((action, i) =>
            action.href ? (
              <Link
                key={i}
                href={action.href}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md transition-all min-w-[120px]"
              >
                <span className="text-3xl">{action.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
              </Link>
            ) : (
              <button
                key={i}
                onClick={action.onClick}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 hover:shadow-md transition-all min-w-[120px]"
              >
                <span className="text-3xl">{action.icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {isAr ? "سجل الحضور الأخير" : "Recent Attendance"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b dark:border-white/10">
                  <th className="text-start pb-2 font-medium">{isAr ? "الموظف" : "Employee"}</th>
                  <th className="text-start pb-2 font-medium">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="text-start pb-2 font-medium">{isAr ? "الحالة" : "Status"}</th>
                  <th className="text-start pb-2 font-medium">{isAr ? "ساعات" : "Hours"}</th>
                </tr>
              </thead>
              <tbody>
                {(attendance ?? []).slice(0, 10).map((a: any) => (
                  <tr key={a.id} className="border-b dark:border-white/5">
                    <td className="py-2 text-gray-900 dark:text-white">{a.employee?.nameAr ?? a.employeeId}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{new Date(a.date).toLocaleDateString(isAr ? "ar-SA" : "en-US")}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_STATUS[a.status]?.color ?? "bg-gray-100 text-gray-700"}`}>
                        {isAr ? ATTENDANCE_STATUS[a.status]?.ar : ATTENDANCE_STATUS[a.status]?.en ?? a.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{a.hoursWorked ? Number(a.hoursWorked).toFixed(1) : "-"}</td>
                  </tr>
                ))}
                {(!attendance || attendance.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-gray-400">{isAr ? "لا توجد سجلات حضور" : "No attendance records"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Salary Advances */}
        <div className="rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            {isAr ? "السلف المعلقة" : "Pending Salary Advances"}
          </h3>
          <div className="space-y-3">
            {(pendingAdvances ?? []).map((adv: any) => (
              <div key={adv.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{adv.employee?.nameAr}</div>
                  <div className="text-xs text-gray-500">
                    {isAr ? "المبلغ:" : "Amount:"} {Number(adv.amount).toLocaleString()} | {adv.reason || (isAr ? "بدون سبب" : "No reason")}
                  </div>
                </div>
                <div className="flex gap-2">
                  {approveId === adv.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        value={deductMonth}
                        onChange={(e) => setDeductMonth(e.target.value)}
                        className="text-xs border rounded px-2 py-1 dark:bg-white/10 dark:border-white/20 dark:text-white"
                        placeholder={isAr ? "شهر الخصم" : "Deduct month"}
                      />
                      <button
                        onClick={() => approveAdvance.mutate({ id: adv.id, deductMonth })}
                        disabled={!deductMonth}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {isAr ? "تأكيد" : "Confirm"}
                      </button>
                      <button onClick={() => setApproveId(null)} className="text-xs text-gray-500 hover:text-gray-700">
                        {isAr ? "إلغاء" : "Cancel"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setApproveId(adv.id)}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                      >
                        {isAr ? "قبول" : "Approve"}
                      </button>
                      <button
                        onClick={() => rejectAdvance.mutate({ id: adv.id })}
                        className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                      >
                        {isAr ? "رفض" : "Reject"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {(!pendingAdvances || pendingAdvances.length === 0) && (
              <div className="py-8 text-center text-gray-400 text-sm">{isAr ? "لا توجد سلف معلقة" : "No pending advances"}</div>
            )}
          </div>
        </div>
      </div>

      {/* Expiring Documents */}
      {expiringDocs && expiringDocs.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-white/5 border border-red-200 dark:border-red-500/20 p-5">
          <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            {isAr ? "وثائق تنتهي خلال 30 يوم" : "Documents Expiring Within 30 Days"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringDocs.map((doc: any) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                <div className="text-xl">📄</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">{doc.name}</div>
                  <div className="text-xs text-gray-500">{doc.employee?.nameAr} ({doc.employee?.employeeNumber})</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {isAr ? "تنتهي:" : "Expires:"} {new Date(doc.expiryDate).toLocaleDateString(isAr ? "ar-SA" : "en-US")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MODALS === */}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAttendanceModal(false)}>
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{isAr ? "تسجيل حضور" : "Mark Attendance"}</h3>
            <div className="space-y-3">
              <select
                value={attendanceForm.employeeId}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, employeeId: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                <option value="">{isAr ? "اختر الموظف" : "Select Employee"}</option>
                {empList.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.nameAr} ({emp.employeeNumber})</option>
                ))}
              </select>
              <input
                type="date"
                value={attendanceForm.date}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{isAr ? "وقت الحضور" : "Check In"}</label>
                  <input
                    type="time"
                    value={attendanceForm.checkIn}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{isAr ? "وقت الانصراف" : "Check Out"}</label>
                  <input
                    type="time"
                    value={attendanceForm.checkOut}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
                  />
                </div>
              </div>
              <select
                value={attendanceForm.status}
                onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                {Object.entries(ATTENDANCE_STATUS).map(([key, val]) => (
                  <option key={key} value={key}>{isAr ? val.ar : val.en}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  const d = new Date(attendanceForm.date);
                  const checkIn = attendanceForm.checkIn ? new Date(`${attendanceForm.date}T${attendanceForm.checkIn}:00`) : undefined;
                  const checkOut = attendanceForm.checkOut ? new Date(`${attendanceForm.date}T${attendanceForm.checkOut}:00`) : undefined;
                  markAttendance.mutate({
                    employeeId: attendanceForm.employeeId,
                    date: d,
                    checkIn,
                    checkOut,
                    status: attendanceForm.status,
                  });
                }}
                disabled={!attendanceForm.employeeId || markAttendance.isPending}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {markAttendance.isPending ? (isAr ? "جاري..." : "Saving...") : (isAr ? "حفظ" : "Save")}
              </button>
              <button onClick={() => setShowAttendanceModal(false)} className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCertModal(false)}>
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{isAr ? "طلب شهادة" : "Request Certificate"}</h3>
            <div className="space-y-3">
              <select
                value={certForm.employeeId}
                onChange={(e) => setCertForm({ ...certForm, employeeId: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                <option value="">{isAr ? "اختر الموظف" : "Select Employee"}</option>
                {empList.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.nameAr} ({emp.employeeNumber})</option>
                ))}
              </select>
              <select
                value={certForm.type}
                onChange={(e) => setCertForm({ ...certForm, type: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                {Object.entries(CERT_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{isAr ? val.ar : val.en}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => requestCert.mutate({ employeeId: certForm.employeeId, type: certForm.type })}
                disabled={!certForm.employeeId || requestCert.isPending}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {requestCert.isPending ? (isAr ? "جاري..." : "Processing...") : (isAr ? "إصدار الشهادة" : "Issue Certificate")}
              </button>
              <button onClick={() => setShowCertModal(false)} className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
            {requestCert.data && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans leading-relaxed" dir="rtl">
                  {(requestCert.data as any).content}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Salary Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdvanceModal(false)}>
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{isAr ? "طلب سلفة راتب" : "Request Salary Advance"}</h3>
            <div className="space-y-3">
              <select
                value={advanceForm.employeeId}
                onChange={(e) => setAdvanceForm({ ...advanceForm, employeeId: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                <option value="">{isAr ? "اختر الموظف" : "Select Employee"}</option>
                {empList.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.nameAr} ({emp.employeeNumber})</option>
                ))}
              </select>
              <input
                type="number"
                value={advanceForm.amount}
                onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                placeholder={isAr ? "المبلغ" : "Amount"}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              />
              <textarea
                value={advanceForm.reason}
                onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                placeholder={isAr ? "السبب (اختياري)" : "Reason (optional)"}
                rows={3}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() =>
                  requestAdvance.mutate({
                    employeeId: advanceForm.employeeId,
                    amount: parseFloat(advanceForm.amount),
                    reason: advanceForm.reason || undefined,
                  })
                }
                disabled={!advanceForm.employeeId || !advanceForm.amount || requestAdvance.isPending}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {requestAdvance.isPending ? (isAr ? "جاري..." : "Submitting...") : (isAr ? "تقديم الطلب" : "Submit Request")}
              </button>
              <button onClick={() => setShowAdvanceModal(false)} className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPayslipModal(false)}>
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{isAr ? "كشف الراتب" : "Payslip"}</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select
                value={payslipForm.employeeId}
                onChange={(e) => setPayslipForm({ ...payslipForm, employeeId: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              >
                <option value="">{isAr ? "اختر الموظف" : "Select Employee"}</option>
                {empList.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.nameAr} ({emp.employeeNumber})</option>
                ))}
              </select>
              <input
                type="month"
                value={payslipForm.period}
                onChange={(e) => setPayslipForm({ ...payslipForm, period: e.target.value })}
                className="w-full border rounded-lg p-2.5 text-sm dark:bg-white/10 dark:border-white/20 dark:text-white"
              />
            </div>
            {payslip ? (
              <div className="space-y-3 border-t dark:border-white/10 pt-4">
                <div className="text-center font-bold text-gray-900 dark:text-white mb-3">
                  {(payslip as any).employee?.nameAr} - {(payslip as any).payroll?.period}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <div className="text-xs text-gray-500">{isAr ? "الراتب الأساسي" : "Basic Salary"}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{Number(payslip.basicSalary).toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <div className="text-xs text-gray-500">{isAr ? "بدل سكن" : "Housing"}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{Number(payslip.housingAllowance).toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <div className="text-xs text-gray-500">{isAr ? "بدل نقل" : "Transport"}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{Number(payslip.transportAllowance).toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg">
                    <div className="text-xs text-gray-500">{isAr ? "إجمالي المستحقات" : "Total Earnings"}</div>
                    <div className="font-bold text-gray-900 dark:text-white">{Number(payslip.totalEarnings).toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    <div className="text-xs text-gray-500">{isAr ? "التأمينات" : "GOSI"}</div>
                    <div className="font-bold text-red-600">{Number(payslip.gosiEmployee).toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                    <div className="text-xs text-gray-500">{isAr ? "إجمالي الخصومات" : "Total Deductions"}</div>
                    <div className="font-bold text-red-600">{Number(payslip.totalDeductions).toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-center">
                  <div className="text-xs text-gray-500">{isAr ? "صافي الراتب" : "Net Salary"}</div>
                  <div className="text-xl font-bold text-blue-600">{Number(payslip.netSalary).toLocaleString()}</div>
                </div>
              </div>
            ) : payslipForm.employeeId && payslipForm.period ? (
              <div className="py-8 text-center text-gray-400 text-sm">{isAr ? "لا يوجد كشف راتب لهذه الفترة" : "No payslip found for this period"}</div>
            ) : null}
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowPayslipModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800">
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

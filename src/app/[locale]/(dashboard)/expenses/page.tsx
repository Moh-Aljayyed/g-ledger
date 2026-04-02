"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "مسودة", color: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "مقدم", color: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "معتمد", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "مرفوض", color: "bg-red-100 text-red-700" },
  PAID: { label: "مدفوع", color: "bg-emerald-100 text-emerald-700" },
};

const CATEGORIES = [
  { value: "travel", label: "سفر" },
  { value: "meals", label: "وجبات" },
  { value: "supplies", label: "مستلزمات" },
  { value: "transport", label: "مواصلات" },
  { value: "communication", label: "اتصالات" },
  { value: "maintenance", label: "صيانة" },
  { value: "other", label: "أخرى" },
];

type ExpenseStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID";

export default function ExpensesPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const utils = trpc.useUtils();
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "">("");
  const [filterCategory, setFilterCategory] = useState("");

  const { data, isLoading } = trpc.expenses.list.useQuery({
    status: filterStatus ? (filterStatus as ExpenseStatus) : undefined,
    category: filterCategory || undefined,
  });
  const { data: stats } = trpc.expenses.getStats.useQuery();

  const createMutation = trpc.expenses.create.useMutation({
    onSuccess: () => { utils.expenses.invalidate(); setShowCreateModal(false); },
  });
  const submitMutation = trpc.expenses.submit.useMutation({ onSuccess: () => utils.expenses.invalidate() });
  const approveMutation = trpc.expenses.approve.useMutation({ onSuccess: () => utils.expenses.invalidate() });
  const rejectMutation = trpc.expenses.reject.useMutation({ onSuccess: () => utils.expenses.invalidate() });
  const markPaidMutation = trpc.expenses.markPaid.useMutation({ onSuccess: () => utils.expenses.invalidate() });

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: "",
    vatAmount: "",
    notes: "",
  });

  const handleCreate = () => {
    if (!form.category || !form.description || !form.amount) return;
    createMutation.mutate({
      date: new Date(form.date),
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      vatAmount: form.vatAmount ? parseFloat(form.vatAmount) : undefined,
      notes: form.notes || undefined,
    });
    setForm({ date: new Date().toISOString().split("T")[0], category: "", description: "", amount: "", vatAmount: "", notes: "" });
  };

  const formatNum = (n: number) => new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2 }).format(n);
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
          <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "المصروفات" : "Expenses"}</h1>
          <p className="text-sm text-gray-500 mt-1">{isAr ? "إدارة واعتماد المصروفات" : "Manage and approve expenses"}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg hover:bg-[#005bc4] text-sm font-medium transition-colors">
          {isAr ? "+ مصروف جديد" : "+ New Expense"}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "بانتظار الاعتماد" : "Pending Approval"}</div>
            <div className="text-2xl font-bold text-amber-600">{formatNum(stats.pending)} <span className="text-xs text-gray-400">{currency}</span></div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "معتمد" : "Approved"}</div>
            <div className="text-2xl font-bold text-green-600">{formatNum(stats.approved)} <span className="text-xs text-gray-400">{currency}</span></div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "مدفوع هذا الشهر" : "Paid This Month"}</div>
            <div className="text-2xl font-bold text-[#0070F2]">{formatNum(stats.paid)} <span className="text-xs text-gray-400">{currency}</span></div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-xs text-gray-500 mb-1">{isAr ? "إجمالي الشهر" : "Monthly Total"}</div>
            <div className="text-2xl font-bold text-[#021544]">{formatNum(stats.total)} <span className="text-xs text-gray-400">{currency}</span></div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">{isAr ? "كل الحالات" : "All Statuses"}</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
          <option value="">{isAr ? "كل التصنيفات" : "All Categories"}</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الرقم" : "No."}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "التاريخ" : "Date"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "التصنيف" : "Category"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الوصف" : "Description"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الموظف" : "Employee"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "المبلغ" : "Amount"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الضريبة" : "VAT"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الإجمالي" : "Total"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "الحالة" : "Status"}</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {data?.expenses.map((expense) => {
                const statusConf = STATUS_CONFIG[expense.status] || STATUS_CONFIG.DRAFT;
                const catLabel = CATEGORIES.find((c) => c.value === expense.category)?.label || expense.category;
                return (
                  <tr key={expense.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{expense.expenseNumber}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3 text-xs">{catLabel}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px] truncate">{expense.description}</td>
                    <td className="px-4 py-3 text-xs">{expense.employee?.nameAr ?? "-"}</td>
                    <td className="px-4 py-3 text-xs font-medium">{formatNum(Number(expense.amount))}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatNum(Number(expense.vatAmount))}</td>
                    <td className="px-4 py-3 text-xs font-bold">{formatNum(Number(expense.totalAmount))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusConf.color}`}>{statusConf.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {expense.status === "DRAFT" && (
                          <button onClick={() => submitMutation.mutate({ id: expense.id })} className="text-[10px] px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100">{isAr ? "تقديم" : "Submit"}</button>
                        )}
                        {expense.status === "SUBMITTED" && (
                          <>
                            <button onClick={() => approveMutation.mutate({ id: expense.id })} className="text-[10px] px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100">{isAr ? "اعتماد" : "Approve"}</button>
                            <button onClick={() => rejectMutation.mutate({ id: expense.id })} className="text-[10px] px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">{isAr ? "رفض" : "Reject"}</button>
                          </>
                        )}
                        {expense.status === "APPROVED" && (
                          <button onClick={() => markPaidMutation.mutate({ id: expense.id })} className="text-[10px] px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100">{isAr ? "صرف" : "Pay"}</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!data?.expenses || data.expenses.length === 0) && (
                <tr><td colSpan={10} className="text-center py-12 text-sm text-gray-400">{isAr ? "لا توجد مصروفات" : "No expenses"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#021544]">{isAr ? "مصروف جديد" : "New Expense"}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">التاريخ *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">التصنيف *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                    <option value="">اختر التصنيف</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الوصف *</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="وصف المصروف" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ *</label>
                  <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">ضريبة القيمة المضافة</label>
                  <input type="number" step="0.01" value={form.vatAmount} onChange={(e) => setForm({ ...form, vatAmount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
                </div>
              </div>
              {form.amount && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  الإجمالي: <span className="font-bold text-[#021544]">{formatNum((parseFloat(form.amount) || 0) + (parseFloat(form.vatAmount) || 0))} {currency}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="ملاحظات إضافية" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} disabled={createMutation.isPending || !form.category || !form.description || !form.amount} className="flex-1 px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005bc4] disabled:opacity-50 transition-colors">
                {createMutation.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "إضافة" : "Add")}
              </button>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

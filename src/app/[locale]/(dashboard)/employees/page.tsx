"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function EmployeesPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading, refetch } = trpc.employees.list.useQuery({
    search: searchTerm || undefined,
  });

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-50 text-green-700",
    ON_LEAVE: "bg-yellow-50 text-yellow-700",
    TERMINATED: "bg-red-50 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "نشط",
    ON_LEAVE: "في إجازة",
    TERMINATED: "منتهي",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">الموظفون</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + إضافة موظف
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="بحث بالاسم أو رقم الموظف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">رقم الموظف</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">الاسم</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">القسم</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">المنصب</th>
              <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">تاريخ التعيين</th>
              <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">الراتب</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tc("loading")}
                </td>
              </tr>
            ) : data?.employees && data.employees.length > 0 ? (
              data.employees.map((emp: any) => (
                <tr key={emp.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-sm font-mono">{emp.employeeNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium">{emp.nameAr || emp.nameEn}</td>
                  <td className="px-4 py-3 text-sm">{emp.department || "—"}</td>
                  <td className="px-4 py-3 text-sm">{emp.position || "—"}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(emp.hireDate)}</td>
                  <td className="px-4 py-3 text-sm text-end font-mono font-medium">
                    {formatCurrency(Number(emp.basicSalary ?? 0), currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        statusColors[emp.status] ?? ""
                      }`}
                    >
                      {statusLabels[emp.status] ?? emp.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  {tc("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

function AddEmployeeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    nameAr: "",
    nameEn: "",
    department: "",
    position: "",
    hireDate: new Date().toISOString().split("T")[0],
    basicSalary: "",
    housingAllowance: "",
    transportAllowance: "",
    bankName: "",
    bankAccountNo: "",
    iban: "",
  });

  const createEmployee = trpc.employees.create.useMutation({
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate({
      employeeNumber: formData.employeeNumber,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      department: formData.department || undefined,
      position: formData.position || undefined,
      hireDate: new Date(formData.hireDate),
      basicSalary: parseFloat(formData.basicSalary),
      housingAllowance: formData.housingAllowance ? parseFloat(formData.housingAllowance) : undefined,
      transportAllowance: formData.transportAllowance ? parseFloat(formData.transportAllowance) : undefined,
      bankName: formData.bankName || undefined,
      bankAccountNo: formData.bankAccountNo || undefined,
      iban: formData.iban || undefined,
    });
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-[#021544] mb-4">إضافة موظف جديد</h2>

        {createEmployee.error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {createEmployee.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">رقم الموظف</label>
            <input
              type="text"
              value={formData.employeeNumber}
              onChange={(e) => updateField("employeeNumber", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالعربية</label>
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => updateField("nameAr", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الاسم بالإنجليزية</label>
            <input
              type="text"
              value={formData.nameEn}
              onChange={(e) => updateField("nameEn", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">القسم</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => updateField("department", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المنصب</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => updateField("position", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">تاريخ التعيين</label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => updateField("hireDate", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الراتب الأساسي</label>
              <input
                type="number"
                value={formData.basicSalary}
                onChange={(e) => updateField("basicSalary", e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">بدل السكن</label>
              <input
                type="number"
                value={formData.housingAllowance}
                onChange={(e) => updateField("housingAllowance", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">بدل النقل</label>
              <input
                type="number"
                value={formData.transportAllowance}
                onChange={(e) => updateField("transportAllowance", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-sm font-medium text-[#021544] mb-3">المعلومات البنكية</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم البنك</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => updateField("bankName", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">رقم الحساب</label>
                  <input
                    type="text"
                    value={formData.bankAccountNo}
                    onChange={(e) => updateField("bankAccountNo", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IBAN</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => updateField("iban", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={createEmployee.isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {createEmployee.isPending ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

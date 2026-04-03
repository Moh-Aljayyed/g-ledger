"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

export default function BudgetPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  // Budget items (user can edit these)
  const [budgetItems, setBudgetItems] = useState([
    { category: isAr ? "المبيعات" : "Sales", budget: 100000, actual: 0 },
    { category: isAr ? "تكلفة المبيعات" : "COGS", budget: 40000, actual: 0 },
    { category: isAr ? "الرواتب" : "Salaries", budget: 30000, actual: 0 },
    { category: isAr ? "الإيجار" : "Rent", budget: 5000, actual: 0 },
    { category: isAr ? "كهرباء ومياه" : "Utilities", budget: 2000, actual: 0 },
    { category: isAr ? "تسويق" : "Marketing", budget: 5000, actual: 0 },
    { category: isAr ? "مصروفات أخرى" : "Other Expenses", budget: 3000, actual: 0 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ category: "", budget: 0 });

  const updateBudget = (index: number, value: number) => {
    const updated = [...budgetItems];
    updated[index].budget = value;
    setBudgetItems(updated);
  };

  const addItem = () => {
    if (newItem.category) {
      setBudgetItems([...budgetItems, { ...newItem, actual: 0 }]);
      setNewItem({ category: "", budget: 0 });
      setShowAddModal(false);
    }
  };

  const totalBudget = budgetItems.reduce((s, i) => s + i.budget, 0);
  const totalActual = budgetItems.reduce((s, i) => s + i.actual, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "الموازنة التقديرية" : "Budget vs Actual"}</h1>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium">
          + {isAr ? "إضافة بند" : "Add Item"}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 border-b">
            <tr>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isAr ? "البند" : "Category"}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isAr ? "الموازنة" : "Budget"}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isAr ? "الفعلي" : "Actual"}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{isAr ? "الفرق" : "Variance"}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody>
            {budgetItems.map((item, i) => {
              const variance = item.budget - item.actual;
              const pct = item.budget > 0 ? ((item.actual / item.budget) * 100).toFixed(0) : "0";
              return (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/10">
                  <td className="px-4 py-3 text-sm font-medium">{item.category}</td>
                  <td className="px-4 py-3">
                    <input type="number" value={item.budget} onChange={(e) => updateBudget(i, parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 rounded border border-input bg-background text-sm text-center" dir="ltr" />
                  </td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(item.actual, currency)}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(variance, currency)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${parseInt(pct) > 100 ? "bg-red-400" : parseInt(pct) > 80 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${Math.min(100, parseInt(pct))}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-muted/30 border-t-2 border-border">
            <tr>
              <td className="px-4 py-3 font-bold text-sm text-[#021544]">{isAr ? "الإجمالي" : "Total"}</td>
              <td className="px-4 py-3 font-bold text-sm">{formatCurrency(totalBudget, currency)}</td>
              <td className="px-4 py-3 font-bold text-sm">{formatCurrency(totalActual, currency)}</td>
              <td className={`px-4 py-3 font-bold text-sm ${totalBudget - totalActual >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(totalBudget - totalActual, currency)}
              </td>
              <td className="px-4 py-3 text-sm">{totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(0) : 0}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إضافة بند" : "Add Budget Item"}</h2>
            <div className="space-y-3">
              <input type="text" value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder={isAr ? "اسم البند" : "Category name"} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              <input type="number" value={newItem.budget || ""} onChange={(e) => setNewItem({ ...newItem, budget: parseFloat(e.target.value) || 0 })} placeholder={isAr ? "المبلغ المقدر" : "Budget amount"} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" dir="ltr" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-border rounded-lg text-sm">{isAr ? "إلغاء" : "Cancel"}</button>
              <button onClick={addItem} className="flex-1 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium">{isAr ? "إضافة" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

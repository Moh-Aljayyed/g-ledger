"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

export default function BankPage() {
  const tc = useTranslations("common");
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = trpc.bank.listAccounts.useQuery();
  const { data: accountDetails, isLoading: detailsLoading, refetch: refetchDetails } = trpc.bank.getAccountDetails.useQuery({ id: selectedAccountId! }, { enabled: !!selectedAccountId });
  const reconcileTransaction = trpc.bank.reconcile.useMutation({ onSuccess: () => refetchDetails() });

  const typeLabels: Record<string, string> = {
    BANK: isAr ? "حساب بنكي" : "Bank Account",
    CASH: isAr ? "صندوق نقدي" : "Cash Box",
    CREDIT_CARD: isAr ? "بطاقة ائتمان" : "Credit Card",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "البنوك والنقدية" : "Banks & Cash"}</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowTransferModal(true)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
            {isAr ? "تحويل بين الحسابات" : "Transfer Between Accounts"}
          </button>
          <button onClick={() => setShowAddAccountModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            {isAr ? "+ إضافة حساب" : "+ Add Account"}
          </button>
        </div>
      </div>

      {accountsLoading ? (
        <div className="text-center py-8 text-muted-foreground">{tc("loading")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accountsData && accountsData.length > 0 ? (
            accountsData.map((account: any) => (
              <div key={account.id} onClick={() => setSelectedAccountId(account.id)} className={`bg-card rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${selectedAccountId === account.id ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[#021544]">{account.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{typeLabels[account.type] ?? account.type}</span>
                </div>
                {account.bankName && <p className="text-sm text-muted-foreground mb-2">{account.bankName}</p>}
                <div className="text-xl font-bold font-mono text-[#021544]">{formatCurrency(Number(account.balance ?? 0), currency)}</div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">{isAr ? "لا توجد حسابات بنكية" : "No bank accounts"}</div>
          )}
        </div>
      )}

      {selectedAccountId && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#021544]">{isAr ? "العمليات" : "Transactions"}</h2>
            <button onClick={() => setShowAddTransactionModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              {isAr ? "+ إضافة عملية" : "+ Add Transaction"}
            </button>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "التاريخ" : "Date"}</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "النوع" : "Type"}</th>
                  <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الوصف" : "Description"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="text-end px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "الرصيد" : "Balance"}</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground">{isAr ? "مطابق" : "Reconciled"}</th>
                </tr>
              </thead>
              <tbody>
                {detailsLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("loading")}</td></tr>
                ) : accountDetails?.transactions && accountDetails.transactions.length > 0 ? (
                  accountDetails.transactions.map((txn: any) => (
                    <tr key={txn.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-3 text-sm">{formatDate(txn.date)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${txn.type === "DEPOSIT" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {txn.type === "DEPOSIT" ? (isAr ? "إيداع" : "Deposit") : (isAr ? "سحب" : "Withdrawal")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{txn.description || "—"}</td>
                      <td className={`px-4 py-3 text-sm text-end font-mono font-medium ${txn.type === "DEPOSIT" ? "text-green-700" : "text-red-700"}`}>
                        {txn.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(Number(txn.amount), currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-end font-mono">{txn.balance != null ? formatCurrency(Number(txn.balance), currency) : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => reconcileTransaction.mutate({ transactionIds: [txn.id], isReconciled: !txn.isReconciled })} className={`w-5 h-5 rounded border inline-flex items-center justify-center text-xs transition-colors ${txn.isReconciled ? "bg-green-500 border-green-500 text-white" : "border-border hover:bg-muted"}`}>
                          {txn.isReconciled ? "✓" : ""}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">{tc("noData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddAccountModal && <AddAccountModal isAr={isAr} onClose={() => setShowAddAccountModal(false)} onSuccess={() => { setShowAddAccountModal(false); refetchAccounts(); }} />}
      {showAddTransactionModal && selectedAccountId && <AddTransactionModal accountId={selectedAccountId} currency={currency} isAr={isAr} onClose={() => setShowAddTransactionModal(false)} onSuccess={() => { setShowAddTransactionModal(false); refetchAccounts(); refetchDetails(); }} />}
      {showTransferModal && <TransferModal accounts={accountsData ?? []} currency={currency} isAr={isAr} onClose={() => setShowTransferModal(false)} onSuccess={() => { setShowTransferModal(false); refetchAccounts(); if (selectedAccountId) refetchDetails(); }} />}
    </div>
  );
}

function AddAccountModal({ isAr, onClose, onSuccess }: { isAr: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ name: "", bankName: "", accountNumber: "", type: "CHECKING" as "CHECKING" | "SAVINGS" | "CASH" | "CREDIT_CARD_ACCOUNT", openingBalance: "" });
  const createAccount = trpc.bank.createAccount.useMutation({ onSuccess: () => onSuccess() });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); createAccount.mutate({ name: formData.name, bankName: formData.bankName || undefined, accountNumber: formData.accountNumber || undefined, type: formData.type, openingBalance: formData.openingBalance ? parseFloat(formData.openingBalance) : undefined }); };
  const updateField = (field: string, value: any) => { setFormData((prev) => ({ ...prev, [field]: value })); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إضافة حساب بنكي" : "Add Bank Account"}</h2>
        {createAccount.error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{createAccount.error.message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{isAr ? "اسم الحساب" : "Account Name"}</label><input type="text" value={formData.name} onChange={(e) => updateField("name", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "النوع" : "Type"}</label><select value={formData.type} onChange={(e) => updateField("type", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value="BANK">{isAr ? "حساب بنكي" : "Bank Account"}</option><option value="CASH">{isAr ? "صندوق نقدي" : "Cash Box"}</option><option value="CREDIT_CARD">{isAr ? "بطاقة ائتمان" : "Credit Card"}</option></select></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "اسم البنك" : "Bank Name"}</label><input type="text" value={formData.bankName} onChange={(e) => updateField("bankName", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "رقم الحساب" : "Account Number"}</label><input type="text" value={formData.accountNumber} onChange={(e) => updateField("accountNumber", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "الرصيد الافتتاحي" : "Opening Balance"}</label><input type="number" value={formData.openingBalance} onChange={(e) => updateField("openingBalance", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
            <button type="submit" disabled={createAccount.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{createAccount.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddTransactionModal({ accountId, currency, isAr, onClose, onSuccess }: { accountId: string; currency: string; isAr: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ type: "DEPOSIT" as "DEPOSIT" | "WITHDRAWAL", date: new Date().toISOString().split("T")[0], amount: "", description: "", reference: "" });
  const addTransaction = trpc.bank.addTransaction.useMutation({ onSuccess: () => onSuccess() });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); addTransaction.mutate({ bankAccountId: accountId, type: formData.type as "DEPOSIT" | "WITHDRAWAL", date: new Date(formData.date), amount: parseFloat(formData.amount), description: formData.description || "", reference: formData.reference || undefined }); };
  const updateField = (field: string, value: any) => { setFormData((prev) => ({ ...prev, [field]: value })); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إضافة عملية" : "Add Transaction"}</h2>
        {addTransaction.error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{addTransaction.error.message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{isAr ? "النوع" : "Type"}</label><select value={formData.type} onChange={(e) => updateField("type", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value="DEPOSIT">{isAr ? "إيداع" : "Deposit"}</option><option value="WITHDRAWAL">{isAr ? "سحب" : "Withdrawal"}</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "التاريخ" : "Date"}</label><input type="date" value={formData.date} onChange={(e) => updateField("date", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "المبلغ" : "Amount"}</label><input type="number" value={formData.amount} onChange={(e) => updateField("amount", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "الوصف" : "Description"}</label><input type="text" value={formData.description} onChange={(e) => updateField("description", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "المرجع" : "Reference"}</label><input type="text" value={formData.reference} onChange={(e) => updateField("reference", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
            <button type="submit" disabled={addTransaction.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{addTransaction.isPending ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "حفظ" : "Save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransferModal({ accounts, currency, isAr, onClose, onSuccess }: { accounts: any[]; currency: string; isAr: boolean; onClose: () => void; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ fromAccountId: "", toAccountId: "", amount: "", date: new Date().toISOString().split("T")[0], description: "" });
  const transfer = trpc.bank.transfer.useMutation({ onSuccess: () => onSuccess() });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); transfer.mutate({ fromAccountId: formData.fromAccountId, toAccountId: formData.toAccountId, amount: parseFloat(formData.amount), date: new Date(formData.date), description: formData.description || undefined }); };
  const updateField = (field: string, value: any) => { setFormData((prev) => ({ ...prev, [field]: value })); };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "تحويل بين الحسابات" : "Transfer Between Accounts"}</h2>
        {transfer.error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{transfer.error.message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">{isAr ? "من حساب" : "From Account"}</label><select value={formData.fromAccountId} onChange={(e) => updateField("fromAccountId", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">{isAr ? "اختر الحساب..." : "Select account..."}</option>{accounts.map((acc: any) => <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(Number(acc.balance ?? 0), currency)})</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "إلى حساب" : "To Account"}</label><select value={formData.toAccountId} onChange={(e) => updateField("toAccountId", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"><option value="">{isAr ? "اختر الحساب..." : "Select account..."}</option>{accounts.filter((acc: any) => acc.id !== formData.fromAccountId).map((acc: any) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">{isAr ? "المبلغ" : "Amount"}</label><input type="number" value={formData.amount} onChange={(e) => updateField("amount", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" min="0" step="0.01" /></div>
            <div><label className="block text-sm font-medium mb-1">{isAr ? "التاريخ" : "Date"}</label><input type="date" value={formData.date} onChange={(e) => updateField("date", e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" dir="ltr" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">{isAr ? "الوصف" : "Description"}</label><input type="text" value={formData.description} onChange={(e) => updateField("description", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">{isAr ? "إلغاء" : "Cancel"}</button>
            <button type="submit" disabled={transfer.isPending} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">{transfer.isPending ? (isAr ? "جاري التحويل..." : "Transferring...") : (isAr ? "تحويل" : "Transfer")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

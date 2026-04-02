"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function UsersPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "ACCOUNTANT" as string, password: "" });
  const [msg, setMsg] = useState("");

  const { data: users, refetch } = trpc.users.list.useQuery();
  const invite = trpc.users.invite.useMutation({
    onSuccess: () => { setMsg(isAr ? "✓ تم إضافة المستخدم" : "✓ User added"); setShowInvite(false); setForm({ name: "", email: "", role: "ACCOUNTANT", password: "" }); refetch(); },
    onError: (err) => setMsg(err.message),
  });
  const remove = trpc.users.remove.useMutation({ onSuccess: () => refetch() });
  const changeRole = trpc.users.changeRole.useMutation({ onSuccess: () => refetch() });

  const roles: Record<string, string> = { OWNER: isAr ? "مالك" : "Owner", ADMIN: isAr ? "مدير" : "Admin", ACCOUNTANT: isAr ? "محاسب" : "Accountant", VIEWER: isAr ? "مشاهد" : "Viewer" };
  const roleBg: Record<string, string> = { OWNER: "bg-purple-100 text-purple-700", ADMIN: "bg-blue-100 text-blue-700", ACCOUNTANT: "bg-green-100 text-green-700", VIEWER: "bg-gray-100 text-gray-600" };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{isAr ? "إدارة المستخدمين" : "User Management"}</h1>
        <button onClick={() => setShowInvite(true)} className="px-4 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium hover:bg-[#005ed4]">
          + {isAr ? "إضافة مستخدم" : "Add User"}
        </button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msg.includes("✓") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg}</div>}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 border-b">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-start">{isAr ? "الاسم" : "Name"}</th>
              <th className="px-4 py-3 text-sm font-medium text-start">{isAr ? "الإيميل" : "Email"}</th>
              <th className="px-4 py-3 text-sm font-medium text-start">{isAr ? "الصلاحية" : "Role"}</th>
              <th className="px-4 py-3 text-sm font-medium text-start">{isAr ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-muted/10">
                <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground" dir="ltr">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBg[u.role] || ""}`}>{roles[u.role] || u.role}</span>
                </td>
                <td className="px-4 py-3">
                  {u.role !== "OWNER" && (
                    <div className="flex items-center gap-2">
                      <select value={u.role} onChange={(e) => changeRole.mutate({ userId: u.id, role: e.target.value as any })} className="text-xs px-2 py-1 rounded border border-input bg-background">
                        <option value="ADMIN">{roles.ADMIN}</option>
                        <option value="ACCOUNTANT">{roles.ACCOUNTANT}</option>
                        <option value="VIEWER">{roles.VIEWER}</option>
                      </select>
                      <button onClick={() => { if (confirm(isAr ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Delete this user?")) remove.mutate({ userId: u.id }); }} className="text-xs text-red-500 hover:text-red-700">✕</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl border p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-[#021544] mb-4">{isAr ? "إضافة مستخدم جديد" : "Add New User"}</h2>
            <div className="space-y-3">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isAr ? "الاسم" : "Name"} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={isAr ? "البريد الإلكتروني" : "Email"} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={isAr ? "كلمة المرور (8+ حروف)" : "Password (8+ chars)"} minLength={8} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none" dir="ltr" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                <option value="ADMIN">{roles.ADMIN} — {isAr ? "كل الصلاحيات" : "Full access"}</option>
                <option value="ACCOUNTANT">{roles.ACCOUNTANT} — {isAr ? "محاسبة وتقارير" : "Accounting & reports"}</option>
                <option value="VIEWER">{roles.VIEWER} — {isAr ? "عرض فقط" : "View only"}</option>
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2 border border-border rounded-lg text-sm">{isAr ? "إلغاء" : "Cancel"}</button>
              <button onClick={() => { setMsg(""); invite.mutate(form as any); }} disabled={!form.name || !form.email || !form.password || invite.isPending} className="flex-1 py-2 bg-[#0070F2] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {invite.isPending ? "..." : (isAr ? "إضافة" : "Add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

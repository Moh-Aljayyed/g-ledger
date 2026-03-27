"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const adminLogin = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      // Store admin token in localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminName", data.admin.name);
      router.push("/ar/admin");
    },
    onError: (err) => {
      setError(err.message || "بيانات الدخول غير صحيحة");
      setLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    adminLogin.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a1628, #121e38)" }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#021544] to-[#0070F2] mx-auto flex items-center justify-center mb-4 shadow-lg">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[#021544]">لوحة تحكم المدير</h1>
            <p className="text-sm text-muted-foreground mt-1">G-Ledger Admin Panel</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#021544]">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#0070F2] focus:border-transparent outline-none transition-all"
                placeholder="admin@g-ledger.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[#021544]">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#0070F2] focus:border-transparent outline-none transition-all"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#021544] to-[#0070F2] text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? "جاري الدخول..." : "دخول لوحة التحكم"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

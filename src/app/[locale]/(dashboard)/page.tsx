"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const ts = useTranslations("sectors");
  const { data: session } = useSession();
  const { data, isLoading } = trpc.reports.dashboard.useQuery();

  const currency = (session?.user as any)?.currency ?? "SAR";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {t("welcome")}، {session?.user?.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("overview")} — {ts((session?.user as any)?.sector ?? "COMMERCIAL")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t("totalRevenue")}
          value={formatCurrency(data?.totalRevenue ?? 0, currency)}
          icon="💰"
          color="text-success"
        />
        <StatCard
          title={t("totalExpenses")}
          value={formatCurrency(data?.totalExpenses ?? 0, currency)}
          icon="📉"
          color="text-destructive"
        />
        <StatCard
          title={t("netProfit")}
          value={formatCurrency(data?.netProfit ?? 0, currency)}
          icon="📊"
          color={(data?.netProfit ?? 0) >= 0 ? "text-success" : "text-destructive"}
        />
        <StatCard
          title={t("accountsCount")}
          value={String(data?.accountsCount ?? 0)}
          icon="🌳"
          color="text-primary"
        />
      </div>

      {/* Recent Entries */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">{t("recentEntries")}</h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : data?.recentEntries && data.recentEntries.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="text-start pb-3 font-medium">رقم القيد</th>
                <th className="text-start pb-3 font-medium">التاريخ</th>
                <th className="text-start pb-3 font-medium">الوصف</th>
                <th className="text-start pb-3 font-medium">الحالة</th>
                <th className="text-end pb-3 font-medium">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEntries.map((entry) => {
                const total = entry.lines.reduce(
                  (sum, l) => sum + Number(l.debit),
                  0
                );
                return (
                  <tr key={entry.id} className="border-b border-border/50">
                    <td className="py-3 text-sm">{entry.entryNumber}</td>
                    <td className="py-3 text-sm">
                      {new Date(entry.date).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="py-3 text-sm">{entry.description}</td>
                    <td className="py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="py-3 text-sm text-end font-mono">
                      {formatCurrency(total, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد قيود بعد. ابدأ بإنشاء أول قيد يومي.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    DRAFT: "bg-muted text-muted-foreground",
    POSTED: "bg-success/10 text-success",
    REVERSED: "bg-destructive/10 text-destructive",
  };
  const labels = {
    DRAFT: "مسودة",
    POSTED: "مرحّل",
    REVERSED: "معكوس",
  };
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
        styles[status as keyof typeof styles] ?? ""
      }`}
    >
      {labels[status as keyof typeof labels] ?? status}
    </span>
  );
}

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

// Define which modules are available in each plan
const MODULE_PLANS: Record<string, string[]> = {
  // Free + Basic: core accounting
  "/chart-of-accounts": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/journal-entries": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/ledger": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/trial-balance": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/financial-statements": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/invoices": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/customers": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/vendors": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/bills": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/payments": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/inventory": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/bank": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/tax-settings": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/settings": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/dashboard": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/users": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/branding": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/referral": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],
  "/blog": ["FREE_TRIAL", "BASIC", "PROFESSIONAL", "ENTERPRISE"],

  // Professional+: advanced modules
  "/crm": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/expenses": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/projects": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/employees": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/payroll": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/leaves": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/fixed-assets": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/production": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/helpdesk": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/report-builder": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],
  "/audit-log": ["FREE_TRIAL", "PROFESSIONAL", "ENTERPRISE"],

  // Enterprise only
  "/hr": ["FREE_TRIAL", "ENTERPRISE"],
  "/pos": ["FREE_TRIAL", "ENTERPRISE"],
  "/api-docs": ["FREE_TRIAL", "ENTERPRISE"],
};

export function PlanGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAr = pathname?.startsWith("/ar");
  const basePath = isAr ? "/ar" : "/en";

  const { data: usage } = trpc.subscription.getUsage.useQuery();

  if (!usage) return <>{children}</>; // Loading — show content

  // Extract the module path (remove /ar or /en prefix)
  const modulePath = pathname?.replace(/^\/(ar|en)/, "") || "/dashboard";

  // Find matching module
  const matchedModule = Object.keys(MODULE_PLANS).find(m => modulePath.startsWith(m));
  if (!matchedModule) return <>{children}</>; // Not a restricted module

  const allowedPlans = MODULE_PLANS[matchedModule];
  if (allowedPlans.includes(usage.plan)) return <>{children}</>; // Allowed

  // Blocked — show upgrade message
  const requiredPlan = allowedPlans.includes("PROFESSIONAL") ? (isAr ? "الاحترافي" : "Professional") : (isAr ? "المؤسسي" : "Enterprise");

  return (
    <div className="max-w-lg mx-auto text-center py-20">
      <div className="text-6xl mb-4">🔒</div>
      <h1 className="text-2xl font-bold text-[#021544] mb-2">
        {isAr ? "هذه الميزة غير متاحة في باقتك" : "Feature not available in your plan"}
      </h1>
      <p className="text-muted-foreground mb-2">
        {isAr ? `هذا الموديول متاح في الباقة ${requiredPlan} أو أعلى.` : `This module is available on the ${requiredPlan} plan or higher.`}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        {isAr ? "قم بالترقية للوصول لكل المميزات." : "Upgrade to access all features."}
      </p>
      <div className="space-y-3">
        <Link href={`${basePath}/settings`} className="block w-full max-w-xs mx-auto py-3 bg-[#0070F2] text-white rounded-xl font-bold hover:bg-[#005ed4]">
          {isAr ? "ترقية الآن" : "Upgrade Now"}
        </Link>
        <Link href={`${basePath}/dashboard`} className="block text-sm text-muted-foreground hover:text-foreground">
          {isAr ? "العودة للداشبورد" : "Back to Dashboard"}
        </Link>
      </div>
    </div>
  );
}

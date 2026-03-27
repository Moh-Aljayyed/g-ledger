import type { SectorConfig } from "./types";

export const crowdfundingConfig: SectorConfig = {
  sector: "CROWDFUNDING",
  nameAr: "تمويل جماعي",
  nameEn: "Crowdfunding",
  chartOfAccounts: [
    {
      code: "1",
      nameAr: "الأصول",
      nameEn: "Assets",
      type: "ASSET",
      nature: "DEBIT",
      isSystem: true,
      children: [
        {
          code: "11",
          nameAr: "الأصول المتداولة",
          nameEn: "Current Assets",
          type: "ASSET",
          nature: "DEBIT",
          isSystem: true,
          children: [
            { code: "1101", nameAr: "الصندوق", nameEn: "Cash on Hand", type: "ASSET", nature: "DEBIT", isSystem: true, sectorTag: "cash" },
            { code: "1102", nameAr: "البنك", nameEn: "Bank", type: "ASSET", nature: "DEBIT", isSystem: true, sectorTag: "bank" },
            { code: "1103", nameAr: "حسابات الضمان", nameEn: "Escrow Accounts", type: "ASSET", nature: "DEBIT", sectorTag: "escrow" },
            { code: "1104", nameAr: "مستحقات المنصة", nameEn: "Platform Receivables", type: "ASSET", nature: "DEBIT", sectorTag: "platform_receivables" },
          ],
        },
        {
          code: "12",
          nameAr: "الأصول غير المتداولة",
          nameEn: "Non-Current Assets",
          type: "ASSET",
          nature: "DEBIT",
          isSystem: true,
          children: [
            { code: "1201", nameAr: "المعدات", nameEn: "Equipment", type: "ASSET", nature: "DEBIT", sectorTag: "ppe" },
            { code: "1202", nameAr: "مجمع الإهلاك", nameEn: "Accumulated Depreciation", type: "ASSET", nature: "CREDIT", sectorTag: "acc_dep" },
          ],
        },
      ],
    },
    {
      code: "2",
      nameAr: "الخصوم (الالتزامات)",
      nameEn: "Liabilities",
      type: "LIABILITY",
      nature: "CREDIT",
      isSystem: true,
      children: [
        {
          code: "21",
          nameAr: "الخصوم المتداولة",
          nameEn: "Current Liabilities",
          type: "LIABILITY",
          nature: "CREDIT",
          isSystem: true,
          children: [
            { code: "2101", nameAr: "أموال المستثمرين المحتجزة", nameEn: "Investor Funds Held", type: "LIABILITY", nature: "CREDIT", sectorTag: "investor_funds" },
            { code: "2102", nameAr: "مدفوعات معلقة", nameEn: "Pending Disbursements", type: "LIABILITY", nature: "CREDIT", sectorTag: "pending_disbursements" },
            { code: "2103", nameAr: "مخصص التعثر", nameEn: "Default Provisions", type: "LIABILITY", nature: "CREDIT", sectorTag: "default_provisions" },
          ],
        },
      ],
    },
    {
      code: "3",
      nameAr: "حقوق الملكية",
      nameEn: "Equity",
      type: "EQUITY",
      nature: "CREDIT",
      isSystem: true,
      children: [
        { code: "3101", nameAr: "رأس المال", nameEn: "Capital", type: "EQUITY", nature: "CREDIT", isSystem: true, sectorTag: "capital" },
        { code: "3102", nameAr: "أرباح مبقاة", nameEn: "Retained Earnings", type: "EQUITY", nature: "CREDIT", isSystem: true, sectorTag: "retained_earnings" },
      ],
    },
    {
      code: "4",
      nameAr: "الإيرادات",
      nameEn: "Revenue",
      type: "REVENUE",
      nature: "CREDIT",
      isSystem: true,
      children: [
        { code: "4101", nameAr: "عمولات المنصة", nameEn: "Platform Commissions", type: "REVENUE", nature: "CREDIT", isSystem: true, sectorTag: "platform_commissions" },
        { code: "4102", nameAr: "رسوم الخدمة", nameEn: "Service Fees", type: "REVENUE", nature: "CREDIT", sectorTag: "service_fees" },
        { code: "4103", nameAr: "رسوم التأخر في السداد", nameEn: "Late Payment Fees", type: "REVENUE", nature: "CREDIT", sectorTag: "late_payment_fees" },
      ],
    },
    {
      code: "5",
      nameAr: "المصروفات",
      nameEn: "Expenses",
      type: "EXPENSE",
      nature: "DEBIT",
      isSystem: true,
      children: [
        {
          code: "51",
          nameAr: "تكاليف مباشرة",
          nameEn: "Direct Costs",
          type: "EXPENSE",
          nature: "DEBIT",
          isSystem: true,
          children: [
            { code: "5101", nameAr: "تكاليف معالجة المدفوعات", nameEn: "Payment Processing Costs", type: "EXPENSE", nature: "DEBIT", sectorTag: "payment_processing" },
            { code: "5102", nameAr: "مصاريف مخصص التعثر", nameEn: "Default Provisions Expense", type: "EXPENSE", nature: "DEBIT", sectorTag: "default_provision_expense" },
          ],
        },
        {
          code: "52",
          nameAr: "المصروفات التشغيلية",
          nameEn: "Operating Expenses",
          type: "EXPENSE",
          nature: "DEBIT",
          children: [
            { code: "5201", nameAr: "مصاريف التسويق", nameEn: "Marketing Expenses", type: "EXPENSE", nature: "DEBIT", sectorTag: "marketing" },
            { code: "5202", nameAr: "مصاريف التقنية", nameEn: "Technology Expenses", type: "EXPENSE", nature: "DEBIT", sectorTag: "technology" },
            { code: "5203", nameAr: "الرواتب والأجور", nameEn: "Salaries & Wages", type: "EXPENSE", nature: "DEBIT", sectorTag: "salaries" },
            { code: "5204", nameAr: "الإيجار", nameEn: "Rent", type: "EXPENSE", nature: "DEBIT", sectorTag: "rent" },
            { code: "5205", nameAr: "مصاريف الإهلاك", nameEn: "Depreciation Expense", type: "EXPENSE", nature: "DEBIT", sectorTag: "depreciation" },
            { code: "5206", nameAr: "مصاريف متنوعة", nameEn: "Miscellaneous Expenses", type: "EXPENSE", nature: "DEBIT" },
          ],
        },
      ],
    },
  ],
  financialStatementMapping: {
    incomeStatement: [
      { key: "platform_revenue", nameAr: "إيرادات المنصة", nameEn: "Platform Revenue", sectorTags: ["platform_commissions", "service_fees", "late_payment_fees"] },
      { key: "direct_costs", nameAr: "تكاليف مباشرة", nameEn: "Direct Costs", accountCodes: ["51"] },
      { key: "operating_expenses", nameAr: "المصروفات التشغيلية", nameEn: "Operating Expenses", accountCodes: ["52"] },
    ],
    balanceSheet: [
      { key: "current_assets", nameAr: "الأصول المتداولة", nameEn: "Current Assets", accountCodes: ["11"] },
      { key: "non_current_assets", nameAr: "الأصول غير المتداولة", nameEn: "Non-Current Assets", accountCodes: ["12"] },
      { key: "current_liabilities", nameAr: "الخصوم المتداولة", nameEn: "Current Liabilities", accountCodes: ["21"] },
      { key: "equity", nameAr: "حقوق الملكية", nameEn: "Equity", accountCodes: ["3"] },
    ],
  },
};

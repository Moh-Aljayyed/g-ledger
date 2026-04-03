import type { SectorConfig } from "./types";

export const restaurantConfig: SectorConfig = {
  sector: "RESTAURANT",
  nameAr: "مطاعم وكافيهات",
  nameEn: "Restaurants & Cafes",
  chartOfAccounts: [
    // Assets
    { code: "1", nameAr: "الأصول", nameEn: "Assets", type: "ASSET", nature: "DEBIT", isSystem: true, children: [
      { code: "11", nameAr: "الأصول المتداولة", nameEn: "Current Assets", type: "ASSET", nature: "DEBIT", isSystem: true, children: [
        { code: "1101", nameAr: "الصندوق", nameEn: "Cash", type: "ASSET", nature: "DEBIT", isSystem: true, sectorTag: "cash" },
        { code: "1102", nameAr: "البنك", nameEn: "Bank", type: "ASSET", nature: "DEBIT", isSystem: true, sectorTag: "bank" },
        { code: "1103", nameAr: "العملاء", nameEn: "Accounts Receivable", type: "ASSET", nature: "DEBIT", sectorTag: "ar" },
        { code: "1110", nameAr: "مخزون مواد غذائية", nameEn: "Food Inventory", type: "ASSET", nature: "DEBIT", sectorTag: "food_inventory" },
        { code: "1111", nameAr: "مخزون مشروبات", nameEn: "Beverage Inventory", type: "ASSET", nature: "DEBIT", sectorTag: "beverage_inventory" },
        { code: "1112", nameAr: "مخزون مواد تغليف", nameEn: "Packaging Inventory", type: "ASSET", nature: "DEBIT", sectorTag: "packaging" },
        { code: "1113", nameAr: "مخزون مستلزمات نظافة", nameEn: "Cleaning Supplies", type: "ASSET", nature: "DEBIT" },
        { code: "1140", nameAr: "مصروفات مدفوعة مقدماً", nameEn: "Prepaid Expenses", type: "ASSET", nature: "DEBIT" },
        { code: "1150", nameAr: "ض.ق.م مدينة", nameEn: "VAT Receivable", type: "ASSET", nature: "DEBIT", sectorTag: "vat_input" },
      ]},
      { code: "12", nameAr: "الأصول غير المتداولة", nameEn: "Non-Current Assets", type: "ASSET", nature: "DEBIT", isSystem: true, children: [
        { code: "1201", nameAr: "معدات المطبخ", nameEn: "Kitchen Equipment", type: "ASSET", nature: "DEBIT" },
        { code: "1202", nameAr: "أثاث وديكور", nameEn: "Furniture & Decor", type: "ASSET", nature: "DEBIT" },
        { code: "1203", nameAr: "أجهزة كاشير ونقاط بيع", nameEn: "POS & Cash Registers", type: "ASSET", nature: "DEBIT" },
        { code: "1204", nameAr: "سيارات توصيل", nameEn: "Delivery Vehicles", type: "ASSET", nature: "DEBIT" },
        { code: "1205", nameAr: "تجهيزات المحل", nameEn: "Leasehold Improvements", type: "ASSET", nature: "DEBIT" },
        { code: "1290", nameAr: "مجمع الإهلاك", nameEn: "Accumulated Depreciation", type: "ASSET", nature: "CREDIT" },
      ]},
    ]},
    // Liabilities
    { code: "2", nameAr: "الخصوم", nameEn: "Liabilities", type: "LIABILITY", nature: "CREDIT", isSystem: true, children: [
      { code: "21", nameAr: "الخصوم المتداولة", nameEn: "Current Liabilities", type: "LIABILITY", nature: "CREDIT", isSystem: true, children: [
        { code: "2101", nameAr: "موردون مواد غذائية", nameEn: "Food Suppliers", type: "LIABILITY", nature: "CREDIT", sectorTag: "ap" },
        { code: "2102", nameAr: "موردون مشروبات", nameEn: "Beverage Suppliers", type: "LIABILITY", nature: "CREDIT" },
        { code: "2103", nameAr: "رواتب مستحقة", nameEn: "Salaries Payable", type: "LIABILITY", nature: "CREDIT" },
        { code: "2104", nameAr: "ض.ق.م دائنة", nameEn: "VAT Payable", type: "LIABILITY", nature: "CREDIT", sectorTag: "vat_output" },
        { code: "2105", nameAr: "تطبيقات توصيل مستحقة", nameEn: "Delivery Apps Payable", type: "LIABILITY", nature: "CREDIT" },
      ]},
    ]},
    // Equity
    { code: "3", nameAr: "حقوق الملكية", nameEn: "Equity", type: "EQUITY", nature: "CREDIT", isSystem: true, children: [
      { code: "3101", nameAr: "رأس المال", nameEn: "Capital", type: "EQUITY", nature: "CREDIT", isSystem: true },
      { code: "3102", nameAr: "أرباح مبقاة", nameEn: "Retained Earnings", type: "EQUITY", nature: "CREDIT", isSystem: true },
    ]},
    // Revenue
    { code: "4", nameAr: "الإيرادات", nameEn: "Revenue", type: "REVENUE", nature: "CREDIT", isSystem: true, children: [
      { code: "4101", nameAr: "مبيعات مأكولات — داين إن", nameEn: "Dine-In Food Sales", type: "REVENUE", nature: "CREDIT", sectorTag: "sales_dinein" },
      { code: "4102", nameAr: "مبيعات مأكولات — تيك أواي", nameEn: "Takeaway Food Sales", type: "REVENUE", nature: "CREDIT", sectorTag: "sales_takeaway" },
      { code: "4103", nameAr: "مبيعات مأكولات — توصيل", nameEn: "Delivery Food Sales", type: "REVENUE", nature: "CREDIT", sectorTag: "sales_delivery" },
      { code: "4104", nameAr: "مبيعات مشروبات", nameEn: "Beverage Sales", type: "REVENUE", nature: "CREDIT", sectorTag: "sales_beverage" },
      { code: "4105", nameAr: "مبيعات حلويات", nameEn: "Dessert Sales", type: "REVENUE", nature: "CREDIT" },
      { code: "4110", nameAr: "إيرادات كاترنج/تموين", nameEn: "Catering Revenue", type: "REVENUE", nature: "CREDIT" },
      { code: "4120", nameAr: "مردودات مبيعات", nameEn: "Sales Returns", type: "REVENUE", nature: "DEBIT" },
    ]},
    // Expenses
    { code: "5", nameAr: "المصروفات", nameEn: "Expenses", type: "EXPENSE", nature: "DEBIT", isSystem: true, children: [
      { code: "51", nameAr: "تكلفة المبيعات", nameEn: "Cost of Sales", type: "EXPENSE", nature: "DEBIT", isSystem: true, children: [
        { code: "5101", nameAr: "تكلفة مواد غذائية", nameEn: "Food Cost", type: "EXPENSE", nature: "DEBIT" },
        { code: "5102", nameAr: "تكلفة مشروبات", nameEn: "Beverage Cost", type: "EXPENSE", nature: "DEBIT" },
        { code: "5103", nameAr: "تكلفة تغليف", nameEn: "Packaging Cost", type: "EXPENSE", nature: "DEBIT" },
        { code: "5104", nameAr: "هالك وتالف", nameEn: "Waste & Spoilage", type: "EXPENSE", nature: "DEBIT" },
      ]},
      { code: "52", nameAr: "مصروفات تشغيلية", nameEn: "Operating Expenses", type: "EXPENSE", nature: "DEBIT", children: [
        { code: "5201", nameAr: "رواتب طاقم المطبخ", nameEn: "Kitchen Staff Wages", type: "EXPENSE", nature: "DEBIT" },
        { code: "5202", nameAr: "رواتب طاقم الخدمة", nameEn: "Service Staff Wages", type: "EXPENSE", nature: "DEBIT" },
        { code: "5203", nameAr: "رواتب الإدارة", nameEn: "Admin Salaries", type: "EXPENSE", nature: "DEBIT" },
        { code: "5204", nameAr: "إيجار المحل", nameEn: "Rent", type: "EXPENSE", nature: "DEBIT" },
        { code: "5205", nameAr: "كهرباء ومياه وغاز", nameEn: "Utilities (Elec/Water/Gas)", type: "EXPENSE", nature: "DEBIT" },
        { code: "5206", nameAr: "صيانة معدات", nameEn: "Equipment Maintenance", type: "EXPENSE", nature: "DEBIT" },
        { code: "5207", nameAr: "مصاريف تسويق وإعلان", nameEn: "Marketing & Advertising", type: "EXPENSE", nature: "DEBIT" },
        { code: "5208", nameAr: "عمولات تطبيقات التوصيل", nameEn: "Delivery App Commissions", type: "EXPENSE", nature: "DEBIT" },
        { code: "5209", nameAr: "مستلزمات نظافة", nameEn: "Cleaning Supplies", type: "EXPENSE", nature: "DEBIT" },
        { code: "5210", nameAr: "تأمين", nameEn: "Insurance", type: "EXPENSE", nature: "DEBIT" },
        { code: "5211", nameAr: "إهلاك", nameEn: "Depreciation", type: "EXPENSE", nature: "DEBIT" },
        { code: "5212", nameAr: "مصاريف بنكية", nameEn: "Bank Charges", type: "EXPENSE", nature: "DEBIT" },
      ]},
    ]},
  ],
  financialStatementMapping: {
    incomeStatement: [
      { key: "sales", nameAr: "المبيعات", nameEn: "Sales", sectorTags: ["sales_dinein", "sales_takeaway", "sales_delivery", "sales_beverage"] },
      { key: "cogs", nameAr: "تكلفة المبيعات", nameEn: "Cost of Sales", accountCodes: ["51"] },
      { key: "operating", nameAr: "مصروفات تشغيلية", nameEn: "Operating Expenses", accountCodes: ["52"] },
    ],
    balanceSheet: [
      { key: "current_assets", nameAr: "أصول متداولة", nameEn: "Current Assets", accountCodes: ["11"] },
      { key: "non_current", nameAr: "أصول غير متداولة", nameEn: "Non-Current Assets", accountCodes: ["12"] },
      { key: "liabilities", nameAr: "الخصوم", nameEn: "Liabilities", accountCodes: ["21"] },
      { key: "equity", nameAr: "حقوق الملكية", nameEn: "Equity", accountCodes: ["3"] },
    ],
  },
};

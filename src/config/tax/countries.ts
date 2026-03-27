/**
 * Country & Tax Configuration
 * إعدادات الدول والضرائب حسب القطاع
 */

export interface CountryConfig {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  currency: string;
  currencyNameAr: string;
  currencySymbol: string;
  hasEInvoice: boolean;
  eInvoiceSystem?: string;
  defaultVatRate: number;
  // Sector-specific VAT rates (override default)
  sectorVatRates?: Record<string, SectorTaxConfig>;
  // Tax types available
  taxTypes: TaxType[];
  // Registration number format
  registrationFormat?: {
    label: string;
    placeholder: string;
    pattern: string;
    length: number;
  };
  notes?: string;
}

export interface SectorTaxConfig {
  vatRate: number;
  vatRateLabel: string;
  additionalTaxes?: { name: string; rate: number; nameAr: string }[];
  exemptions?: string[];
  notes?: string;
}

export interface TaxType {
  code: string;
  nameAr: string;
  nameEn: string;
  rate: number;
  isOptional?: boolean;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  SA: {
    code: "SA",
    nameAr: "المملكة العربية السعودية",
    nameEn: "Saudi Arabia",
    flag: "🇸🇦",
    currency: "SAR",
    currencyNameAr: "ريال سعودي",
    currencySymbol: "ر.س",
    hasEInvoice: true,
    eInvoiceSystem: "ZATCA - فاتورة",
    defaultVatRate: 15,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 15 },
    ],
    sectorVatRates: {
      // كل القطاعات في السعودية 15% موحدة مع استثناءات محددة
      MEDICAL_HOSPITAL: {
        vatRate: 15,
        vatRateLabel: "15%",
        exemptions: ["الأدوية والمستلزمات الطبية المحددة بقرار مجلس الوزراء"],
        notes: "بعض الخدمات الصحية للمواطنين معفاة",
      },
      MEDICAL_PHARMACY: {
        vatRate: 15,
        vatRateLabel: "15%",
        exemptions: ["الأدوية والمعدات الطبية المدرجة في القائمة"],
      },
      REAL_ESTATE: {
        vatRate: 5,
        vatRateLabel: "5% (ضريبة التصرفات العقارية)",
        additionalTaxes: [
          { name: "RETT", rate: 5, nameAr: "ضريبة التصرفات العقارية" },
        ],
        notes: "التوريد العقاري معفى من ض.ق.م ويخضع لضريبة التصرفات العقارية 5%",
      },
      BANKING: {
        vatRate: 15,
        vatRateLabel: "15%",
        exemptions: ["هامش الربح في التمويل الإسلامي"],
        notes: "الخدمات المالية الإسلامية: هامش الربح معفى، الرسوم خاضعة لـ 15%",
      },
      INSURANCE: {
        vatRate: 15,
        vatRateLabel: "15%",
        notes: "التأمين التعاوني خاضع بالكامل لـ 15%",
      },
      NON_PROFIT: {
        vatRate: 15,
        vatRateLabel: "15%",
        exemptions: ["التبرعات بدون مقابل"],
        notes: "الجمعيات المرخصة: التبرعات خارج نطاق الضريبة، الخدمات المقدمة خاضعة",
      },
      TECHNOLOGY: {
        vatRate: 15,
        vatRateLabel: "15%",
        notes: "الصادرات الرقمية تخضع لضريبة صفرية",
      },
    },
    registrationFormat: {
      label: "رقم السجل التجاري",
      placeholder: "1234567890",
      pattern: "^\\d{10}$",
      length: 10,
    },
  },

  EG: {
    code: "EG",
    nameAr: "جمهورية مصر العربية",
    nameEn: "Egypt",
    flag: "🇪🇬",
    currency: "EGP",
    currencyNameAr: "جنيه مصري",
    currencySymbol: "ج.م",
    hasEInvoice: true,
    eInvoiceSystem: "ETA - الفاتورة الإلكترونية",
    defaultVatRate: 14,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 14 },
      { code: "WHT", nameAr: "ضريبة الخصم من المنبع", nameEn: "Withholding Tax", rate: 0, isOptional: true },
      { code: "TABLE", nameAr: "ضريبة الجدول", nameEn: "Table Tax", rate: 0, isOptional: true },
      { code: "STAMP", nameAr: "ضريبة الدمغة", nameEn: "Stamp Duty", rate: 0, isOptional: true },
    ],
    sectorVatRates: {
      // مصر: الضريبة تختلف حسب القطاع
      COMMERCIAL: {
        vatRate: 14,
        vatRateLabel: "14%",
        additionalTaxes: [
          { name: "WHT_SUPPLY", rate: 0.5, nameAr: "خصم منبع توريدات 0.5%" },
        ],
      },
      INDUSTRIAL: {
        vatRate: 14,
        vatRateLabel: "14%",
        additionalTaxes: [
          { name: "WHT_SUPPLY", rate: 0.5, nameAr: "خصم منبع توريدات 0.5%" },
        ],
        notes: "السلع الرأسمالية: رد الضريبة خلال 6 فترات",
      },
      SERVICES: {
        vatRate: 14,
        vatRateLabel: "14%",
        additionalTaxes: [
          { name: "WHT_SERVICES", rate: 3, nameAr: "خصم منبع خدمات 3%" },
          { name: "WHT_PROFESSIONS", rate: 5, nameAr: "خصم منبع مهن حرة 5%" },
        ],
      },
      MEDICAL_HOSPITAL: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["الخدمات الصحية والأدوية معفاة من ض.ق.م"],
        notes: "القطاع الصحي معفى بالكامل من ض.ق.م — لكن الأجهزة الطبية المستوردة تخضع لضريبة الجدول",
        additionalTaxes: [
          { name: "TABLE_MEDICAL_EQUIPMENT", rate: 5, nameAr: "ضريبة جدول أجهزة طبية 5%" },
        ],
      },
      MEDICAL_PHARMACY: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["الأدوية والمستحضرات الطبية معفاة"],
        additionalTaxes: [
          { name: "TABLE_COSMETICS", rate: 8, nameAr: "ضريبة جدول مستحضرات تجميل 8%" },
        ],
        notes: "الأدوية معفاة، مستحضرات التجميل والمكملات تخضع لضريبة الجدول",
      },
      MEDICAL_CLINIC: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["الخدمات الصحية معفاة"],
        additionalTaxes: [
          { name: "WHT_PROFESSIONS", rate: 5, nameAr: "خصم منبع مهن حرة 5%" },
        ],
        notes: "الكشف والعلاج معفى — التعاقدات مع الأطباء تخضع لخصم منبع 5%",
      },
      MEDICAL_LAB: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["التحاليل الطبية معفاة"],
        additionalTaxes: [
          { name: "WHT_SUPPLY", rate: 0.5, nameAr: "خصم منبع مستلزمات 0.5%" },
        ],
      },
      BANKING: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["الخدمات المصرفية والمالية معفاة"],
        notes: "البنوك والخدمات المالية معفاة من ض.ق.م — لكن الرسوم الإدارية تخضع للضريبة",
      },
      INSURANCE: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["خدمات التأمين معفاة"],
        additionalTaxes: [
          { name: "STAMP_INSURANCE", rate: 1, nameAr: "ضريبة دمغة تأمين 1%" },
        ],
        notes: "التأمين معفى من ض.ق.م — يخضع لضريبة الدمغة 1%",
      },
      REAL_ESTATE: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["بيع وتأجير العقارات السكنية معفاة"],
        notes: "العقارات السكنية معفاة — العقارات التجارية والإدارية تخضع لـ 14%",
        additionalTaxes: [
          { name: "STAMP_REALESTATE", rate: 0.4, nameAr: "ضريبة دمغة عقارية 0.4%" },
        ],
      },
      CONTRACTING: {
        vatRate: 14,
        vatRateLabel: "14%",
        additionalTaxes: [
          { name: "WHT_CONTRACTORS", rate: 3, nameAr: "خصم منبع مقاولات 3%" },
          { name: "WHT_SUBCONTRACTORS", rate: 5, nameAr: "خصم منبع مقاولي باطن 5%" },
        ],
        notes: "المقاولات تخضع لـ 14% ض.ق.م + خصم منبع 3% (5% لمقاولي الباطن)",
      },
      AGRICULTURAL: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["المنتجات الزراعية في حالتها الطبيعية معفاة"],
        notes: "المنتجات الزراعية الخام معفاة — المنتجات المصنعة تخضع لـ 14%",
      },
      TECHNOLOGY: {
        vatRate: 14,
        vatRateLabel: "14%",
        additionalTaxes: [
          { name: "WHT_SERVICES", rate: 3, nameAr: "خصم منبع خدمات 3%" },
          { name: "WHT_ROYALTIES", rate: 20, nameAr: "خصم منبع إتاوات (لغير المقيمين) 20%" },
        ],
        notes: "خدمات التكنولوجيا 14% — الإتاوات لشركات أجنبية تخضع لخصم 20%",
      },
      NON_PROFIT: {
        vatRate: 0,
        vatRateLabel: "معفاة",
        exemptions: ["الجمعيات والمؤسسات الأهلية المسجلة"],
        notes: "الأنشطة غير الهادفة للربح معفاة — الأنشطة التجارية التابعة تخضع للضريبة",
      },
      CROWDFUNDING: {
        vatRate: 14,
        vatRateLabel: "14%",
        additionalTaxes: [
          { name: "WHT_SERVICES", rate: 3, nameAr: "خصم منبع خدمات 3%" },
        ],
      },
    },
    registrationFormat: {
      label: "الرقم الضريبي",
      placeholder: "123456789",
      pattern: "^\\d{9}$",
      length: 9,
    },
  },

  AE: {
    code: "AE",
    nameAr: "الإمارات العربية المتحدة",
    nameEn: "United Arab Emirates",
    flag: "🇦🇪",
    currency: "AED",
    currencyNameAr: "درهم إماراتي",
    currencySymbol: "د.إ",
    hasEInvoice: false,
    defaultVatRate: 5,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 5 },
      { code: "CIT", nameAr: "ضريبة الشركات", nameEn: "Corporate Tax", rate: 9, isOptional: true },
    ],
    registrationFormat: {
      label: "رقم التسجيل الضريبي (TRN)",
      placeholder: "100123456789012",
      pattern: "^\\d{15}$",
      length: 15,
    },
  },

  KW: {
    code: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    flag: "🇰🇼",
    currency: "KWD",
    currencyNameAr: "دينار كويتي",
    currencySymbol: "د.ك",
    hasEInvoice: false,
    defaultVatRate: 0,
    taxTypes: [],
    notes: "لا توجد ضريبة قيمة مضافة حالياً",
  },

  BH: {
    code: "BH",
    nameAr: "البحرين",
    nameEn: "Bahrain",
    flag: "🇧🇭",
    currency: "BHD",
    currencyNameAr: "دينار بحريني",
    currencySymbol: "د.ب",
    hasEInvoice: false,
    defaultVatRate: 10,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 10 },
    ],
  },

  OM: {
    code: "OM",
    nameAr: "سلطنة عمان",
    nameEn: "Oman",
    flag: "🇴🇲",
    currency: "OMR",
    currencyNameAr: "ريال عماني",
    currencySymbol: "ر.ع",
    hasEInvoice: false,
    defaultVatRate: 5,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 5 },
    ],
  },

  QA: {
    code: "QA",
    nameAr: "قطر",
    nameEn: "Qatar",
    flag: "🇶🇦",
    currency: "QAR",
    currencyNameAr: "ريال قطري",
    currencySymbol: "ر.ق",
    hasEInvoice: false,
    defaultVatRate: 0,
    taxTypes: [],
  },

  JO: {
    code: "JO",
    nameAr: "الأردن",
    nameEn: "Jordan",
    flag: "🇯🇴",
    currency: "JOD",
    currencyNameAr: "دينار أردني",
    currencySymbol: "د.أ",
    hasEInvoice: true,
    eInvoiceSystem: "JOFOTARA",
    defaultVatRate: 16,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة المبيعات", nameEn: "Sales Tax", rate: 16 },
    ],
  },

  IQ: {
    code: "IQ",
    nameAr: "العراق",
    nameEn: "Iraq",
    flag: "🇮🇶",
    currency: "IQD",
    currencyNameAr: "دينار عراقي",
    currencySymbol: "د.ع",
    hasEInvoice: false,
    defaultVatRate: 0,
    taxTypes: [],
  },

  LB: {
    code: "LB",
    nameAr: "لبنان",
    nameEn: "Lebanon",
    flag: "🇱🇧",
    currency: "LBP",
    currencyNameAr: "ليرة لبنانية",
    currencySymbol: "ل.ل",
    hasEInvoice: false,
    defaultVatRate: 11,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 11 },
    ],
  },

  MA: {
    code: "MA",
    nameAr: "المغرب",
    nameEn: "Morocco",
    flag: "🇲🇦",
    currency: "MAD",
    currencyNameAr: "درهم مغربي",
    currencySymbol: "د.م",
    hasEInvoice: false,
    defaultVatRate: 20,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "TVA", rate: 20 },
    ],
  },

  TN: {
    code: "TN",
    nameAr: "تونس",
    nameEn: "Tunisia",
    flag: "🇹🇳",
    currency: "TND",
    currencyNameAr: "دينار تونسي",
    currencySymbol: "د.ت",
    hasEInvoice: false,
    defaultVatRate: 19,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "TVA", rate: 19 },
    ],
  },

  SD: {
    code: "SD",
    nameAr: "السودان",
    nameEn: "Sudan",
    flag: "🇸🇩",
    currency: "SDG",
    currencyNameAr: "جنيه سوداني",
    currencySymbol: "ج.س",
    hasEInvoice: false,
    defaultVatRate: 17,
    taxTypes: [
      { code: "VAT", nameAr: "ضريبة القيمة المضافة", nameEn: "VAT", rate: 17 },
    ],
  },

  LY: {
    code: "LY",
    nameAr: "ليبيا",
    nameEn: "Libya",
    flag: "🇱🇾",
    currency: "LYD",
    currencyNameAr: "دينار ليبي",
    currencySymbol: "د.ل",
    hasEInvoice: false,
    defaultVatRate: 0,
    taxTypes: [],
  },
};

// Get VAT rate for a specific country + sector
export function getVatRate(countryCode: string, sectorCode?: string): number {
  const country = COUNTRIES[countryCode];
  if (!country) return 0;

  if (sectorCode && country.sectorVatRates?.[sectorCode]) {
    return country.sectorVatRates[sectorCode].vatRate;
  }

  return country.defaultVatRate;
}

// Get full tax config for country + sector
export function getSectorTaxConfig(countryCode: string, sectorCode: string): SectorTaxConfig | null {
  const country = COUNTRIES[countryCode];
  if (!country) return null;

  return country.sectorVatRates?.[sectorCode] || {
    vatRate: country.defaultVatRate,
    vatRateLabel: `${country.defaultVatRate}%`,
  };
}

// Get all countries as array
export function getAllCountries() {
  return Object.values(COUNTRIES).sort((a, b) => {
    // SA and EG first, then alphabetical
    if (a.code === "SA") return -1;
    if (b.code === "SA") return 1;
    if (a.code === "EG") return -1;
    if (b.code === "EG") return 1;
    return a.nameAr.localeCompare(b.nameAr);
  });
}

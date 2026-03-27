// ============ Egypt ETA Tax Codes ============

// ETA Tax Types
export const ETA_TAX_TYPES = {
  T1: { nameAr: "ضريبة القيمة المضافة", nameEn: "Value Added Tax", code: "T1" },
  T2: { nameAr: "ضريبة الجدول (نسبية)", nameEn: "Table Tax (Percentage)", code: "T2" },
  T3: { nameAr: "ضريبة الجدول (قيمة ثابتة)", nameEn: "Table Tax (Fixed Amount)", code: "T3" },
  T4: { nameAr: "ضريبة خصم تحت حساب الضريبة", nameEn: "Withholding Tax (WHT)", code: "T4" },
} as const;

// ETA Tax Subtypes for VAT (T1)
export const ETA_VAT_SUBTYPES = {
  V001: { rate: 14, nameAr: "ض.ق.م 14%", nameEn: "VAT 14%" },
  V002: { rate: 0, nameAr: "ض.ق.م صفرية", nameEn: "Zero Rate" },
  V003: { rate: 0, nameAr: "معفاة", nameEn: "Exempt" },
  V004: { rate: 5, nameAr: "ض.ق.م 5%", nameEn: "VAT 5%" },
} as const;

// ETA Withholding Tax Subtypes (T4)
export const ETA_WHT_SUBTYPES = {
  W001: { rate: 1, nameAr: "خصم 1%", nameEn: "WHT 1%" },
  W002: { rate: 3, nameAr: "خصم 3%", nameEn: "WHT 3%" },
  W003: { rate: 5, nameAr: "خصم 5%", nameEn: "WHT 5%" },
  W004: { rate: 10, nameAr: "خصم 10%", nameEn: "WHT 10%" },
  W005: { rate: 20, nameAr: "خصم 20%", nameEn: "WHT 20%" },
} as const;

// ETA Document Types
export const ETA_DOCUMENT_TYPES = {
  I: { nameAr: "فاتورة", nameEn: "Invoice" },
  C: { nameAr: "إشعار دائن", nameEn: "Credit Note" },
  D: { nameAr: "إشعار مدين", nameEn: "Debit Note" },
} as const;

// ETA Unit Types
export const ETA_UNIT_TYPES = [
  { code: "EA", nameAr: "وحدة", nameEn: "Each" },
  { code: "KGM", nameAr: "كيلوجرام", nameEn: "Kilogram" },
  { code: "MTR", nameAr: "متر", nameEn: "Metre" },
  { code: "LTR", nameAr: "لتر", nameEn: "Litre" },
  { code: "HR", nameAr: "ساعة", nameEn: "Hour" },
  { code: "DAY", nameAr: "يوم", nameEn: "Day" },
  { code: "MON", nameAr: "شهر", nameEn: "Month" },
  { code: "C62", nameAr: "قطعة", nameEn: "Piece" },
  { code: "KWH", nameAr: "كيلوواط ساعة", nameEn: "Kilowatt Hour" },
  { code: "MTK", nameAr: "متر مربع", nameEn: "Square Metre" },
] as const;

// ============ Saudi ZATCA Tax Codes ============

// ZATCA Invoice Types
export const ZATCA_INVOICE_TYPES = {
  "388": { nameAr: "فاتورة ضريبية", nameEn: "Tax Invoice" },
  "381": { nameAr: "إشعار دائن", nameEn: "Credit Note" },
  "383": { nameAr: "إشعار مدين", nameEn: "Debit Note" },
} as const;

// ZATCA Invoice Subtypes
export const ZATCA_INVOICE_SUBTYPES = {
  STANDARD: "0100000",   // فاتورة ضريبية قياسية
  SIMPLIFIED: "0200000", // فاتورة ضريبية مبسطة
} as const;

// ZATCA VAT Categories
export const ZATCA_VAT_CATEGORIES = {
  S: { rate: 15, nameAr: "ض.ق.م 15%", nameEn: "Standard Rate 15%" },
  Z: { rate: 0, nameAr: "ض.ق.م صفرية", nameEn: "Zero Rated" },
  E: { rate: 0, nameAr: "معفاة", nameEn: "Exempt" },
  O: { rate: 0, nameAr: "خارج النطاق", nameEn: "Out of Scope" },
} as const;

// ZATCA VAT Exemption Reason Codes
export const ZATCA_EXEMPTION_REASONS = {
  "VATEX-SA-29": "Financial services mentioned in Article 29 of the VAT Regulations",
  "VATEX-SA-29-7": "Life insurance services mentioned in Article 29 of the VAT Regulations",
  "VATEX-SA-30": "Real estate transactions mentioned in Article 30 of the VAT Regulations",
  "VATEX-SA-32": "Export of goods",
  "VATEX-SA-33": "Export of services",
  "VATEX-SA-34-1": "International transportation of Goods",
  "VATEX-SA-34-2": "International transportation of passengers",
  "VATEX-SA-34-4": "Services directly connected and incidental to a supply of international passenger transport",
  "VATEX-SA-34-5": "Supply of a qualifying means of transport",
  "VATEX-SA-35": "Medicines and medical equipment",
  "VATEX-SA-36": "Qualifying metals",
  "VATEX-SA-EDU": "Private education to citizen",
  "VATEX-SA-HEA": "Private healthcare to citizen",
} as const;

// Common currencies
export const CURRENCIES = {
  EGP: { nameAr: "جنيه مصري", nameEn: "Egyptian Pound", symbol: "ج.م" },
  SAR: { nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbol: "ر.س" },
  USD: { nameAr: "دولار أمريكي", nameEn: "US Dollar", symbol: "$" },
  EUR: { nameAr: "يورو", nameEn: "Euro", symbol: "€" },
  AED: { nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbol: "د.إ" },
} as const;

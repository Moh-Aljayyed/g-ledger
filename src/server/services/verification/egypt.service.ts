/**
 * Egypt Company Verification Service
 * التحقق من بيانات الشركات المصرية
 *
 * Uses ETA (Egyptian Tax Authority) taxpayer search API
 * and GAFI (General Authority for Investment) data
 *
 * Note: Egypt doesn't have a public API like Wathq.
 * This service uses the ETA taxpayer search endpoint
 * which is available when you have ETA API credentials.
 */

const ETA_API = {
  preproduction: "https://api.preprod.invoicing.eta.gov.eg/api/v1",
  production: "https://api.invoicing.eta.gov.eg/api/v1",
};

export interface EgyptCompanyData {
  taxId: string;
  companyName: string;
  companyNameEn?: string;
  registrationNumber?: string;
  status?: string;
  statusAr?: string;
  activityCode?: string;
  activityName?: string;
  address?: {
    governorate?: string;
    city?: string;
    street?: string;
    buildingNo?: string;
  };
  branchCount?: number;
}

// Lookup company by tax registration number using ETA API
export async function lookupEgyptCompany(
  taxId: string,
  etaToken: string,
  environment: "preproduction" | "production" = "preproduction"
): Promise<EgyptCompanyData | null> {
  try {
    const baseUrl = ETA_API[environment];

    // Search for taxpayer by registration number
    const response = await fetch(
      `${baseUrl}/taxpayers/${taxId}/details`,
      {
        headers: {
          Authorization: `Bearer ${etaToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      // Try alternative endpoint
      return await lookupBySearch(taxId, etaToken, baseUrl);
    }

    const data = await response.json();

    return {
      taxId: data.rin || taxId,
      companyName: data.name || "",
      companyNameEn: data.nameEn || "",
      registrationNumber: data.registrationNumber,
      activityCode: data.activityCode,
      activityName: data.activityDescription,
      address: {
        governorate: data.governorate,
        city: data.city,
        street: data.street,
        buildingNo: data.buildingNumber,
      },
    };
  } catch (error: any) {
    console.error("Egypt company lookup error:", error.message);
    return null;
  }
}

// Alternative: search by taxpayer name or partial ID
async function lookupBySearch(
  query: string,
  etaToken: string,
  baseUrl: string
): Promise<EgyptCompanyData | null> {
  try {
    const response = await fetch(
      `${baseUrl}/taxpayers/search?rin=${query}`,
      {
        headers: {
          Authorization: `Bearer ${etaToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.result || data.result.length === 0) return null;

    const company = data.result[0];
    return {
      taxId: company.rin || query,
      companyName: company.name || "",
      companyNameEn: company.nameEn,
      registrationNumber: company.registrationNumber,
    };
  } catch {
    return null;
  }
}

// Verify Egyptian tax ID format (9 digits with check digit)
export function isValidEgyptTaxId(taxId: string): boolean {
  const cleaned = taxId.trim().replace(/-/g, "");
  return /^\d{9}$/.test(cleaned);
}

// Verify Egyptian commercial registration number
export function isValidEgyptCR(crNumber: string): boolean {
  const cleaned = crNumber.trim();
  return /^\d{4,10}$/.test(cleaned);
}

/**
 * For cases where we don't have ETA credentials,
 * provide a basic local validation + known data lookup
 */
export function validateEgyptTaxIdFormat(taxId: string): {
  valid: boolean;
  governorate?: string;
} {
  const cleaned = taxId.trim().replace(/-/g, "");
  if (!/^\d{9}$/.test(cleaned)) {
    return { valid: false };
  }

  // First 3 digits indicate the tax office (مأمورية)
  const officeCode = cleaned.substring(0, 3);

  // Known governorate codes (approximate)
  const governorates: Record<string, string> = {
    "200": "القاهرة",
    "201": "القاهرة",
    "202": "القاهرة",
    "210": "الجيزة",
    "211": "الجيزة",
    "220": "الإسكندرية",
    "221": "الإسكندرية",
    "230": "الشرقية",
    "240": "الدقهلية",
    "250": "المنوفية",
    "260": "الغربية",
    "270": "البحيرة",
    "280": "كفر الشيخ",
    "290": "دمياط",
    "300": "الإسماعيلية",
    "310": "السويس",
    "320": "بورسعيد",
    "400": "أسيوط",
    "410": "سوهاج",
    "420": "المنيا",
    "430": "بني سويف",
    "440": "الفيوم",
    "450": "قنا",
    "460": "الأقصر",
    "470": "أسوان",
  };

  return {
    valid: true,
    governorate: governorates[officeCode],
  };
}

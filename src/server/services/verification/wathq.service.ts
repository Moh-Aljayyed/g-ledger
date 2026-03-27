/**
 * Wathq API Service - Saudi Commercial Registration Lookup
 * واثق — الاستعلام عن السجل التجاري السعودي
 *
 * API: https://developer.wathq.sa
 * Free trial: 100 queries / 30 days
 */

const WATHQ_API_BASE = "https://api.wathq.sa/v5/commercialregistration";

export interface WathqCompanyData {
  crNumber: string;
  companyName: string;
  companyNameEn?: string;
  status: string;
  statusAr: string;
  issueDate?: string;
  expiryDate?: string;
  businessType?: string;
  businessTypeAr?: string;
  activities?: { code: string; nameAr: string; nameEn?: string }[];
  capital?: number;
  location?: {
    city?: string;
    cityAr?: string;
    region?: string;
    regionAr?: string;
  };
  partners?: { name: string; nationality?: string }[];
}

export async function lookupSaudiCR(
  crNumber: string,
  apiKey: string
): Promise<WathqCompanyData | null> {
  try {
    const response = await fetch(`${WATHQ_API_BASE}/info/${crNumber}`, {
      headers: {
        apiKey: apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Wathq API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      crNumber: data.crNumber || crNumber,
      companyName: data.crName || "",
      companyNameEn: data.crEntityNumber || "",
      status: data.status?.id || "",
      statusAr: data.status?.name || "",
      issueDate: data.issueDate,
      expiryDate: data.expiryDate,
      businessType: data.businessType?.id,
      businessTypeAr: data.businessType?.name,
      activities: data.activities?.isic?.map((a: any) => ({
        code: a.id,
        nameAr: a.name,
      })) || [],
      capital: data.capital ? parseFloat(data.capital) : undefined,
      location: {
        cityAr: data.location?.name,
      },
      partners: data.parties?.map((p: any) => ({
        name: p.name,
        nationality: p.nationality?.name,
      })) || [],
    };
  } catch (error: any) {
    console.error("Wathq lookup error:", error.message);
    return null;
  }
}

// Verify if CR number format is valid (10 digits)
export function isValidSaudiCR(crNumber: string): boolean {
  return /^\d{10}$/.test(crNumber.trim());
}

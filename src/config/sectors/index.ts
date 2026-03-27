import type { Sector } from "@prisma/client";
import type { SectorConfig } from "./types";
import { commercialConfig } from "./commercial";

// Lazy-load sector configs to avoid loading all at startup
const sectorConfigMap: Record<Sector, () => Promise<SectorConfig>> = {
  COMMERCIAL: async () => commercialConfig,
  INDUSTRIAL: async () => (await import("./industrial")).industrialConfig,
  SERVICES: async () => (await import("./services")).servicesConfig,
  BANKING: async () => (await import("./banking")).bankingConfig,
  INSURANCE: async () => (await import("./insurance")).insuranceConfig,
  REAL_ESTATE: async () => (await import("./real-estate")).realEstateConfig,
  CONTRACTING: async () => (await import("./contracting")).contractingConfig,
  AGRICULTURAL: async () => (await import("./agricultural")).agriculturalConfig,
  TECHNOLOGY: async () => (await import("./technology")).technologyConfig,
  NON_PROFIT: async () => (await import("./non-profit")).nonProfitConfig,
  CROWDFUNDING: async () => (await import("./crowdfunding")).crowdfundingConfig,
  MEDICAL_HOSPITAL: async () => (await import("./medical-hospital")).medicalHospitalConfig,
  MEDICAL_PHARMACY: async () => (await import("./medical-pharmacy")).medicalPharmacyConfig,
  MEDICAL_CLINIC: async () => (await import("./medical-clinic")).medicalClinicConfig,
  MEDICAL_LAB: async () => (await import("./medical-lab")).medicalLabConfig,
};

export async function getSectorConfig(sector: Sector): Promise<SectorConfig> {
  const loader = sectorConfigMap[sector];
  if (!loader) {
    throw new Error(`Unknown sector: ${sector}`);
  }
  return loader();
}

export const ALL_SECTORS: Sector[] = [
  "INDUSTRIAL",
  "COMMERCIAL",
  "SERVICES",
  "BANKING",
  "INSURANCE",
  "REAL_ESTATE",
  "CONTRACTING",
  "AGRICULTURAL",
  "TECHNOLOGY",
  "NON_PROFIT",
  "CROWDFUNDING",
  "MEDICAL_HOSPITAL",
  "MEDICAL_PHARMACY",
  "MEDICAL_CLINIC",
  "MEDICAL_LAB",
];

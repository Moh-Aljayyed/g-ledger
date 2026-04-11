import type { Sector } from "@prisma/client";
import type { SectorConfig } from "./types";
import { commercialConfig } from "./commercial";

// Lazy-load sector configs to avoid loading all at startup.
// New sectors that don't yet have a dedicated config file fall back to
// the closest existing one (services/commercial). A dedicated config
// per sector will be added in a future session — the base config works
// well enough for chart-of-accounts bootstrap.
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
  RESTAURANT: async () => (await import("./restaurant")).restaurantConfig,

  // New sectors — reuse the closest existing config as a bootstrap
  HOTEL: async () => (await import("./services")).servicesConfig,
  EDUCATION: async () => (await import("./services")).servicesConfig,
  GYM_FITNESS: async () => (await import("./services")).servicesConfig,
  BEAUTY_SALON: async () => (await import("./services")).servicesConfig,
  TRANSPORT_LOGISTICS: async () => (await import("./services")).servicesConfig,
  AUTO_SERVICE: async () => commercialConfig,

  // Medical Suite — health centers reuse the clinic config for now
  MEDICAL_HEALTH_CENTER: async () => (await import("./medical-clinic")).medicalClinicConfig,

  // Bespoke — falls back to commercial; real setup happens during
  // the custom-quote onboarding process with the customer
  CUSTOM: async () => commercialConfig,
};

export async function getSectorConfig(sector: Sector): Promise<SectorConfig> {
  const loader = sectorConfigMap[sector];
  if (!loader) {
    throw new Error(`Unknown sector: ${sector}`);
  }
  return loader();
}

export const ALL_SECTORS: Sector[] = [
  // Standard pricing
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
  "MEDICAL_PHARMACY",
  "RESTAURANT",
  "HOTEL",
  "EDUCATION",
  "GYM_FITNESS",
  "BEAUTY_SALON",
  "TRANSPORT_LOGISTICS",
  "AUTO_SERVICE",
  // Medical Suite (custom pricing)
  "MEDICAL_HOSPITAL",
  "MEDICAL_HEALTH_CENTER",
  "MEDICAL_CLINIC",
  "MEDICAL_LAB",
  // Bespoke
  "CUSTOM",
];

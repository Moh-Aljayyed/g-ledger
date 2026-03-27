import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { lookupSaudiCR, isValidSaudiCR } from "@/server/services/verification/wathq.service";
import { validateEgyptTaxIdFormat, isValidEgyptTaxId, isValidEgyptCR } from "@/server/services/verification/egypt.service";

// Wathq API key (would be in env in production)
const WATHQ_API_KEY = process.env.WATHQ_API_KEY || "";

export const verificationRouter = router({
  // Lookup Saudi company by CR number
  lookupSaudiCR: publicProcedure
    .input(z.object({ crNumber: z.string().min(1) }))
    .query(async ({ input }) => {
      const { crNumber } = input;

      if (!isValidSaudiCR(crNumber)) {
        return {
          found: false,
          error: "رقم السجل التجاري يجب أن يكون 10 أرقام",
          country: "SA" as const,
        };
      }

      // If we have Wathq API key, use it
      if (WATHQ_API_KEY) {
        const data = await lookupSaudiCR(crNumber, WATHQ_API_KEY);
        if (data) {
          return {
            found: true,
            country: "SA" as const,
            data: {
              registrationNumber: data.crNumber,
              companyName: data.companyName,
              companyNameEn: data.companyNameEn,
              status: data.statusAr,
              activities: data.activities,
              capital: data.capital,
              city: data.location?.cityAr,
              region: data.location?.regionAr,
              issueDate: data.issueDate,
              expiryDate: data.expiryDate,
            },
          };
        }
        return { found: false, country: "SA" as const, error: "لم يتم العثور على السجل التجاري" };
      }

      // Fallback: basic validation without API
      return {
        found: false,
        country: "SA" as const,
        validated: true,
        message: "تم التحقق من صيغة الرقم — لتفعيل البحث التلقائي، أضف مفتاح واثق API",
      };
    }),

  // Lookup Egyptian company by tax ID
  lookupEgyptCompany: publicProcedure
    .input(z.object({
      taxId: z.string().optional(),
      crNumber: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { taxId, crNumber } = input;

      if (taxId) {
        if (!isValidEgyptTaxId(taxId)) {
          return {
            found: false,
            error: "الرقم الضريبي يجب أن يكون 9 أرقام",
            country: "EG" as const,
          };
        }

        const validation = validateEgyptTaxIdFormat(taxId);
        if (validation.valid) {
          return {
            found: true,
            country: "EG" as const,
            data: {
              taxId,
              governorate: validation.governorate,
            },
            message: validation.governorate
              ? `رقم ضريبي صالح — مأمورية ${validation.governorate}`
              : "رقم ضريبي صالح",
          };
        }
      }

      if (crNumber) {
        if (!isValidEgyptCR(crNumber)) {
          return {
            found: false,
            error: "رقم السجل التجاري غير صالح",
            country: "EG" as const,
          };
        }
        return {
          found: true,
          country: "EG" as const,
          validated: true,
          message: "صيغة رقم السجل التجاري صالحة",
        };
      }

      return { found: false, country: "EG" as const, error: "يرجى إدخال الرقم الضريبي أو رقم السجل التجاري" };
    }),

  // Universal lookup - detects country from number format
  lookup: publicProcedure
    .input(z.object({
      registrationNumber: z.string().min(1),
      country: z.enum(["SA", "EG"]).optional(),
    }))
    .query(async ({ input }) => {
      const { registrationNumber } = input;
      const cleaned = registrationNumber.trim().replace(/-/g, "");

      // Auto-detect country if not specified
      let country = input.country;
      if (!country) {
        if (/^\d{10}$/.test(cleaned)) country = "SA"; // 10 digits = Saudi CR
        else if (/^\d{9}$/.test(cleaned)) country = "EG"; // 9 digits = Egypt Tax ID
        else if (/^\d{4,8}$/.test(cleaned)) country = "EG"; // shorter = Egypt CR
      }

      if (country === "SA") {
        if (!isValidSaudiCR(cleaned)) {
          return { found: false, error: "رقم السجل التجاري السعودي يجب أن يكون 10 أرقام", country: "SA" };
        }

        if (WATHQ_API_KEY) {
          const data = await lookupSaudiCR(cleaned, WATHQ_API_KEY);
          if (data) {
            return {
              found: true,
              country: "SA",
              companyName: data.companyName,
              companyNameEn: data.companyNameEn,
              status: data.statusAr,
              city: data.location?.cityAr,
              activities: data.activities?.map((a) => a.nameAr).join("، "),
              issueDate: data.issueDate,
              expiryDate: data.expiryDate,
            };
          }
        }

        return {
          found: false,
          country: "SA",
          validated: true,
          message: "صيغة الرقم صحيحة ✓",
        };
      }

      if (country === "EG") {
        const validation = validateEgyptTaxIdFormat(cleaned);
        if (validation.valid) {
          return {
            found: true,
            country: "EG",
            validated: true,
            governorate: validation.governorate,
            message: validation.governorate
              ? `رقم ضريبي صالح — ${validation.governorate} ✓`
              : "رقم ضريبي صالح ✓",
          };
        }

        if (isValidEgyptCR(cleaned)) {
          return {
            found: true,
            country: "EG",
            validated: true,
            message: "رقم سجل تجاري صالح ✓",
          };
        }

        return { found: false, country: "EG", error: "رقم غير صالح" };
      }

      return { found: false, error: "يرجى إدخال رقم السجل التجاري (10 أرقام للسعودية) أو الرقم الضريبي (9 أرقام لمصر)" };
    }),
});

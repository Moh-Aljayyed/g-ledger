/**
 * Saudi ZATCA E-Invoice Service
 * هيئة الزكاة والضريبة والجمارك — الفوترة الإلكترونية
 *
 * Handles:
 * - CSID onboarding (compliance & production)
 * - Invoice XML generation (UBL 2.1)
 * - QR code generation (TLV format)
 * - Digital signing
 * - Clearance (standard invoices) & Reporting (simplified invoices)
 */

import { db } from "@/server/db";
import crypto from "crypto";

// ZATCA API Endpoints
const ZATCA_ENDPOINTS = {
  sandbox: {
    compliance: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
    api: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal",
  },
  simulation: {
    compliance: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
    api: "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
  },
  production: {
    compliance: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
    api: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
  },
};

// Generate UUID v4
function generateUUID(): string {
  return crypto.randomUUID();
}

// Generate invoice hash (SHA-256)
function generateInvoiceHash(xmlContent: string): string {
  return crypto.createHash("sha256").update(xmlContent).digest("base64");
}

// Build QR code TLV (Tag-Length-Value) for ZATCA
export function buildZATCAQRCode(data: {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
  invoiceHash?: string;
  signature?: string;
  publicKey?: string;
  csidSignature?: string;
}): string {
  const tlvEncode = (tag: number, value: string): Buffer => {
    const valueBytes = Buffer.from(value, "utf-8");
    return Buffer.concat([
      Buffer.from([tag]),
      Buffer.from([valueBytes.length]),
      valueBytes,
    ]);
  };

  const tlvParts = [
    tlvEncode(1, data.sellerName),      // Seller Name
    tlvEncode(2, data.vatNumber),        // VAT Registration Number
    tlvEncode(3, data.timestamp),        // Timestamp (ISO 8601)
    tlvEncode(4, data.totalWithVat),     // Invoice Total (with VAT)
    tlvEncode(5, data.vatAmount),        // VAT Total
  ];

  // Phase 2 additional fields
  if (data.invoiceHash) tlvParts.push(tlvEncode(6, data.invoiceHash));
  if (data.signature) tlvParts.push(tlvEncode(7, data.signature));
  if (data.publicKey) tlvParts.push(tlvEncode(8, data.publicKey));
  if (data.csidSignature) tlvParts.push(tlvEncode(9, data.csidSignature));

  return Buffer.concat(tlvParts).toString("base64");
}

// Build UBL 2.1 XML for ZATCA
export async function buildZATCAInvoiceXML(invoiceId: string): Promise<string> {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      tenant: { include: { taxConfig: true } },
    },
  });

  if (!invoice || !invoice.tenant.taxConfig) {
    throw new Error("الفاتورة أو إعدادات الضرائب غير موجودة");
  }

  const config = invoice.tenant.taxConfig;
  const uuid = invoice.uuid || generateUUID();

  // Invoice type code
  const typeCodeMap: Record<string, string> = {
    SALES: "388",
    CREDIT_NOTE: "381",
    DEBIT_NOTE: "383",
    SALES_RETURN: "381",
  };

  // Determine if standard or simplified
  const isSimplified = !invoice.buyerTaxId;
  const invoiceSubtype = isSimplified ? "0200000" : "0100000";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${invoice.issueDate.toISOString().split("T")[0]}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.issueDate.toISOString().split("T")[1]?.split(".")[0] || "00:00:00"}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="${invoiceSubtype}">${typeCodeMap[invoice.type] || "388"}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${invoice.currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  ${invoice.notes ? `<cbc:Note>${invoice.notes}</cbc:Note>` : ""}

  <!-- Seller -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${config.taxRegistrationNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${config.addressStreet || ""}</cbc:StreetName>
        <cbc:BuildingNumber>${config.addressBuildingNo || ""}</cbc:BuildingNumber>
        <cbc:CitySubdivisionName>${config.addressDistrict || ""}</cbc:CitySubdivisionName>
        <cbc:CityName>${config.addressCity || ""}</cbc:CityName>
        <cbc:PostalZone>${config.addressPostalCode || ""}</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${config.taxRegistrationNumber}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${config.companyNameAr}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Buyer -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${invoice.buyerTaxId ? `
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${invoice.buyerTaxId}</cbc:ID>
      </cac:PartyIdentification>` : ""}
      <cac:PostalAddress>
        <cbc:StreetName>${invoice.buyerAddress || ""}</cbc:StreetName>
        <cbc:CityName>${invoice.buyerCity || ""}</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>${invoice.buyerCountry || "SA"}</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.buyerTaxId || ""}</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoice.buyerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Payment Means -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>10</cbc:PaymentMeansCode>
  </cac:PaymentMeans>

  ${Number(invoice.totalDiscount) > 0 ? `
  <!-- Document Level Discount -->
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>Discount</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="${invoice.currency}">${Number(invoice.totalDiscount).toFixed(2)}</cbc:Amount>
  </cac:AllowanceCharge>` : ""}

  <!-- Tax Total -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currency}">${Number(invoice.totalVat).toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${invoice.currency}">${Number(invoice.subtotal).toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${invoice.currency}">${Number(invoice.totalVat).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${Number(config.vatRate)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${Number(invoice.totalVat).toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>

  <!-- Legal Monetary Total -->
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${Number(invoice.subtotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currency}">${(Number(invoice.subtotal) - Number(invoice.totalDiscount)).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currency}">${Number(invoice.grandTotal).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${invoice.currency}">${Number(invoice.totalDiscount).toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${invoice.currency}">${Number(invoice.grandTotal).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Invoice Lines -->
${invoice.items.map((item, idx) => `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${item.unitType || "PCE"}">${Number(item.quantity)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${Number(item.netAmount).toFixed(2)}</cbc:LineExtensionAmount>
    ${Number(item.discount) > 0 ? `
    <cac:AllowanceCharge>
      <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
      <cbc:AllowanceChargeReason>Discount</cbc:AllowanceChargeReason>
      <cbc:Amount currencyID="${invoice.currency}">${Number(item.discount).toFixed(2)}</cbc:Amount>
    </cac:AllowanceCharge>` : ""}
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${invoice.currency}">${Number(item.vatAmount).toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${invoice.currency}">${Number(item.totalAmount).toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${item.description}</cbc:Name>
      ${item.itemCode ? `
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${item.vatCategory || "S"}</cbc:ID>
        <cbc:Percent>${Number(item.vatRate)}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>` : ""}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${invoice.currency}">${Number(item.unitPrice).toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join("\n")}

</Invoice>`;

  // Update invoice with UUID
  if (!invoice.uuid) {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { uuid },
    });
  }

  return xml;
}

// Submit invoice to ZATCA (Clearance for standard, Reporting for simplified)
export async function submitToZATCA(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: { include: { taxConfig: true } } },
  });

  if (!invoice || !invoice.tenant.taxConfig) {
    throw new Error("الفاتورة أو إعدادات الضرائب غير موجودة");
  }

  const config = invoice.tenant.taxConfig;

  if (!config.zatcaCsid || !config.zatcaSecretKey) {
    throw new Error("بيانات التكامل مع هيئة الزكاة غير مكتملة - يلزم CSID و Secret Key");
  }

  const env = (config.zatcaEnvironment as "sandbox" | "simulation" | "production") ?? "sandbox";

  try {
    // 1. Build XML
    const xml = await buildZATCAInvoiceXML(invoiceId);
    const invoiceHash = generateInvoiceHash(xml);
    const encodedXml = Buffer.from(xml).toString("base64");

    // 2. Generate QR Code
    const qrCode = buildZATCAQRCode({
      sellerName: config.companyNameAr,
      vatNumber: config.taxRegistrationNumber,
      timestamp: invoice.issueDate.toISOString(),
      totalWithVat: Number(invoice.grandTotal).toFixed(2),
      vatAmount: Number(invoice.totalVat).toFixed(2),
      invoiceHash,
    });

    // 3. Determine endpoint (clearance for standard, reporting for simplified)
    const isSimplified = !invoice.buyerTaxId;
    const endpoint = isSimplified
      ? `${ZATCA_ENDPOINTS[env].api}/invoices/reporting/single`
      : `${ZATCA_ENDPOINTS[env].api}/invoices/clearance/single`;

    // 4. Log submission
    const submission = await db.invoiceSubmission.create({
      data: {
        invoiceId,
        country: "SA",
        status: "PENDING",
        requestPayload: xml,
        attemptNumber: 1,
      },
    });

    // 5. Submit to ZATCA
    const authHeader = Buffer.from(
      `${config.zatcaCsid}:${config.zatcaSecretKey}`
    ).toString("base64");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "V2",
        "Accept-Language": "ar",
        Authorization: `Basic ${authHeader}`,
        "Clearance-Status": isSimplified ? "0" : "1",
      },
      body: JSON.stringify({
        invoiceHash,
        uuid: invoice.uuid || generateUUID(),
        invoice: encodedXml,
      }),
    });

    const result = await response.json();

    if (response.ok && result.clearanceStatus === "CLEARED" || result.reportingStatus === "REPORTED") {
      await db.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "ACCEPTED",
          hashKey: invoiceHash,
          qrCode,
          signedXml: result.clearedInvoice || encodedXml,
          submissionUuid: result.requestId,
        },
      });

      await db.invoiceSubmission.update({
        where: { id: submission.id },
        data: {
          status: "SUCCESS",
          responsePayload: JSON.stringify(result),
          responseCode: String(response.status),
          submissionUuid: result.requestId,
        },
      });

      return { success: true, qrCode, requestId: result.requestId };
    } else {
      const errorMsg = result.validationResults?.errorMessages?.[0]?.message
        || result.errors?.[0]?.message
        || "فشل إرسال الفاتورة إلى هيئة الزكاة";

      await db.invoiceSubmission.update({
        where: { id: submission.id },
        data: {
          status: "FAILED",
          responsePayload: JSON.stringify(result),
          responseCode: String(response.status),
          errorMessage: errorMsg,
        },
      });

      await db.invoice.update({
        where: { id: invoiceId },
        data: { status: "REJECTED" },
      });

      return { success: false, error: errorMsg, details: result.validationResults };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ZATCA Onboarding - Get Compliance CSID
export async function zatcaOnboarding(tenantId: string, otp: string) {
  const config = await db.taxConfig.findUnique({ where: { tenantId } });
  if (!config || config.country !== "SA") {
    throw new Error("إعدادات هيئة الزكاة غير موجودة");
  }

  const env = (config.zatcaEnvironment as "sandbox" | "simulation" | "production") ?? "sandbox";

  // Step 1: Generate CSR (Certificate Signing Request)
  // In production, this would use the actual crypto operations
  const csr = generateCSR(config);

  // Step 2: Get Compliance CSID
  const response = await fetch(
    `${ZATCA_ENDPOINTS[env].compliance}/compliance`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        OTP: otp,
        "Accept-Version": "V2",
      },
      body: JSON.stringify({ csr: Buffer.from(csr).toString("base64") }),
    }
  );

  if (!response.ok) {
    throw new Error("فشل الحصول على شهادة التوافق من هيئة الزكاة");
  }

  const result = await response.json();

  // Save CSID
  await db.taxConfig.update({
    where: { tenantId },
    data: {
      zatcaCsid: result.binarySecurityToken,
      zatcaSecretKey: result.secret,
    },
  });

  return { success: true, requestId: result.requestID };
}

// Generate CSR (simplified - in production use proper X.509)
function generateCSR(config: any): string {
  // This is a placeholder. In production, you would:
  // 1. Generate EC key pair (secp256k1)
  // 2. Create proper X.509 CSR with ZATCA-required fields
  // 3. Include organization details, serial number, etc.
  return `-----BEGIN CERTIFICATE REQUEST-----
CN=${config.companyNameAr}
O=${config.companyNameAr}
OU=${config.branchId || "1"}
SERIALNUMBER=1-${config.taxRegistrationNumber}|2-${config.branchId || "1"}|3-${new Date().toISOString()}
C=SA
-----END CERTIFICATE REQUEST-----`;
}

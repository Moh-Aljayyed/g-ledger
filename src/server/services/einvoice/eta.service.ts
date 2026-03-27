/**
 * Egypt Tax Authority (ETA) E-Invoice Service
 * مصلحة الضرائب المصرية — الفاتورة الإلكترونية
 *
 * Handles:
 * - Authentication with ETA (OAuth2 token)
 * - Document submission (single & batch)
 * - Document status queries
 * - Document cancellation
 * - Item code registration (EGS/GS1)
 */

import { db } from "@/server/db";

// ETA API Endpoints
const ETA_ENDPOINTS = {
  preproduction: {
    auth: "https://id.preprod.eta.gov.eg/connect/token",
    api: "https://api.preprod.invoicing.eta.gov.eg/api/v1",
  },
  production: {
    auth: "https://id.eta.gov.eg/connect/token",
    api: "https://api.invoicing.eta.gov.eg/api/v1",
  },
};

// Get auth token from ETA
export async function getETAToken(tenantId: string): Promise<string> {
  const config = await db.taxConfig.findUnique({
    where: { tenantId },
  });

  if (!config || config.country !== "EG") {
    throw new Error("لم يتم إعداد تكوين الفاتورة الإلكترونية المصرية");
  }

  if (!config.etaClientId || !config.etaClientSecret) {
    throw new Error("بيانات التكامل مع مصلحة الضرائب غير مكتملة");
  }

  const env = (config.etaEnvironment as "preproduction" | "production") ?? "preproduction";
  const endpoint = ETA_ENDPOINTS[env].auth;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.etaClientId,
      client_secret: config.etaClientSecret,
      scope: "InvoicingAPI",
    }),
  });

  if (!response.ok) {
    throw new Error(`فشل الحصول على رمز الدخول: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Build ETA document from invoice
export async function buildETADocument(invoiceId: string) {
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

  // Map invoice type to ETA document type
  const documentTypeMap: Record<string, string> = {
    SALES: "I",
    SALES_RETURN: "C",
    CREDIT_NOTE: "C",
    DEBIT_NOTE: "D",
  };

  // Build ETA document structure
  const document = {
    issuer: {
      address: {
        branchID: config.branchId || "0",
        country: "EG",
        governate: config.addressState || "",
        regionCity: config.addressCity || "",
        street: config.addressStreet || "",
        buildingNumber: config.addressBuildingNo || "",
      },
      type: "B", // Business
      id: config.taxRegistrationNumber,
      name: config.companyNameAr,
    },
    receiver: {
      address: {
        country: invoice.buyerCountry || "EG",
        governate: "",
        regionCity: invoice.buyerCity || "",
        street: invoice.buyerAddress || "",
        buildingNumber: "",
      },
      type: invoice.buyerType || "B",
      id: invoice.buyerTaxId || "",
      name: invoice.buyerName,
    },
    documentType: documentTypeMap[invoice.type] || "I",
    documentTypeVersion: "1.0",
    dateTimeIssued: invoice.issueDate.toISOString(),
    taxpayerActivityCode: config.activityCode || "",
    internalID: invoice.invoiceNumber,
    invoiceLines: invoice.items.map((item, idx) => ({
      description: item.description,
      itemType: item.itemCodeType || "EGS",
      itemCode: item.itemCode || "",
      unitType: item.unitType || "EA",
      quantity: Number(item.quantity),
      internalCode: item.internalCode || "",
      salesTotal: Number(item.netAmount),
      total: Number(item.totalAmount),
      valueDifference: 0,
      totalTaxableFees: 0,
      netTotal: Number(item.netAmount),
      itemsDiscount: Number(item.discount),
      unitValue: {
        currencySold: invoice.currency,
        amountEGP: Number(item.unitPrice) * Number(invoice.exchangeRate),
        amountSold: Number(item.unitPrice),
        currencyExchangeRate: Number(invoice.exchangeRate),
      },
      discount: {
        rate: Number(item.discountRate),
        amount: Number(item.discount),
      },
      taxableItems: buildETATaxItems(item),
    })),
    totalDiscountAmount: Number(invoice.totalDiscount),
    totalSalesAmount: Number(invoice.subtotal),
    netAmount: Number(invoice.subtotal) - Number(invoice.totalDiscount),
    totalAmount: Number(invoice.grandTotal),
    extraDiscountAmount: 0,
    totalItemsDiscountAmount: Number(invoice.totalDiscount),
  };

  return document;
}

// Build tax items for ETA format
function buildETATaxItems(item: any) {
  const taxes: any[] = [];

  // VAT (T1)
  if (Number(item.vatRate) > 0 || true) {
    const subType = Number(item.vatRate) === 14 ? "V001"
      : Number(item.vatRate) === 0 ? "V003"
      : Number(item.vatRate) === 5 ? "V004" : "V001";

    taxes.push({
      taxType: "T1",
      amount: Number(item.vatAmount),
      subType,
      rate: Number(item.vatRate),
    });
  }

  // Withholding Tax (T4) - Egypt specific
  if (Number(item.withholdingRate) > 0) {
    taxes.push({
      taxType: "T4",
      amount: Number(item.withholdingAmount),
      subType: `W${String(Number(item.withholdingRate)).padStart(3, "0")}`,
      rate: Number(item.withholdingRate),
    });
  }

  // Table Tax (T2)
  if (Number(item.tableTaxRate) > 0) {
    taxes.push({
      taxType: "T2",
      amount: Number(item.tableTaxAmount),
      subType: "Tbl01",
      rate: Number(item.tableTaxRate),
    });
  }

  return taxes;
}

// Submit document to ETA
export async function submitToETA(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: { include: { taxConfig: true } } },
  });

  if (!invoice || !invoice.tenant.taxConfig) {
    throw new Error("الفاتورة أو إعدادات الضرائب غير موجودة");
  }

  const config = invoice.tenant.taxConfig;
  const env = (config.etaEnvironment as "preproduction" | "production") ?? "preproduction";

  try {
    // 1. Get token
    const token = await getETAToken(invoice.tenantId);

    // 2. Build document
    const document = await buildETADocument(invoiceId);

    // 3. Log submission attempt
    const submission = await db.invoiceSubmission.create({
      data: {
        invoiceId,
        country: "EG",
        status: "PENDING",
        requestPayload: JSON.stringify(document),
        attemptNumber: 1,
      },
    });

    // 4. Submit to ETA API
    const apiUrl = `${ETA_ENDPOINTS[env].api}/documentsubmissions`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ documents: [document] }),
    });

    const result = await response.json();

    if (response.ok && result.acceptedDocuments?.length > 0) {
      const accepted = result.acceptedDocuments[0];

      // Update invoice
      await db.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "SUBMITTED",
          submissionUuid: result.submissionId,
          uuid: accepted.uuid,
          longId: accepted.longId,
          hashKey: accepted.hashKey,
        },
      });

      // Update submission log
      await db.invoiceSubmission.update({
        where: { id: submission.id },
        data: {
          status: "SUCCESS",
          responsePayload: JSON.stringify(result),
          responseCode: String(response.status),
          submissionUuid: result.submissionId,
          documentUuid: accepted.uuid,
          longId: accepted.longId,
        },
      });

      return { success: true, uuid: accepted.uuid, submissionId: result.submissionId };
    } else {
      const errorMsg = result.rejectedDocuments?.[0]?.error?.message
        || result.error?.message
        || "فشل إرسال الفاتورة";

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

      return { success: false, error: errorMsg };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get document status from ETA
export async function getETADocumentStatus(invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: { include: { taxConfig: true } } },
  });

  if (!invoice?.uuid || !invoice.tenant.taxConfig) return null;

  const config = invoice.tenant.taxConfig;
  const env = (config.etaEnvironment as "preproduction" | "production") ?? "preproduction";
  const token = await getETAToken(invoice.tenantId);

  const response = await fetch(
    `${ETA_ENDPOINTS[env].api}/documents/${invoice.uuid}/raw`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.json();
}

// Cancel document on ETA
export async function cancelETADocument(invoiceId: string, reason: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: { include: { taxConfig: true } } },
  });

  if (!invoice?.uuid || !invoice.tenant.taxConfig) {
    throw new Error("الفاتورة غير موجودة أو لم يتم إرسالها");
  }

  const config = invoice.tenant.taxConfig;
  const env = (config.etaEnvironment as "preproduction" | "production") ?? "preproduction";
  const token = await getETAToken(invoice.tenantId);

  const response = await fetch(
    `${ETA_ENDPOINTS[env].api}/documents/state/${invoice.uuid}/state`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: "cancelled", reason }),
    }
  );

  if (response.ok) {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: "CANCELLED" },
    });
    return { success: true };
  }

  return { success: false, error: await response.text() };
}

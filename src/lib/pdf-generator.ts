"use client";

/**
 * PDF Generator for G-Ledger
 * Generates invoices and reports as PDF
 */

export async function generateInvoicePDF(invoice: any, companyName: string, isAr: boolean) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(2, 21, 68);
  doc.rect(0, 0, 210, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("G-Ledger", 15, 15);
  doc.setFontSize(10);
  doc.text(companyName || "", 15, 25);

  // Invoice title
  doc.setFontSize(12);
  doc.text(isAr ? "فاتورة ضريبية" : "Tax Invoice", 195, 15, { align: "right" });
  doc.setFontSize(9);
  doc.text(`#${invoice.invoiceNumber}`, 195, 22, { align: "right" });
  doc.text(new Date(invoice.issueDate).toLocaleDateString(), 195, 29, { align: "right" });

  // Reset color
  doc.setTextColor(0, 0, 0);

  // Buyer info
  doc.setFontSize(10);
  doc.text(isAr ? "العميل:" : "Customer:", 15, 45);
  doc.setFontSize(9);
  doc.text(invoice.buyerName || "", 15, 52);
  if (invoice.buyerTaxId) doc.text(`${isAr ? "الرقم الضريبي:" : "Tax ID:"} ${invoice.buyerTaxId}`, 15, 58);
  if (invoice.buyerAddress) doc.text(invoice.buyerAddress, 15, 64);

  // Items table
  const items = (invoice.items || []).map((item: any, i: number) => [
    i + 1,
    item.description || "",
    item.quantity || 0,
    Number(item.unitPrice || 0).toFixed(2),
    Number(item.vatRate || 0).toFixed(0) + "%",
    Number(item.vatAmount || 0).toFixed(2),
    Number(item.totalAmount || 0).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 72,
    head: [[
      "#",
      isAr ? "الوصف" : "Description",
      isAr ? "الكمية" : "Qty",
      isAr ? "السعر" : "Price",
      isAr ? "الضريبة" : "VAT",
      isAr ? "مبلغ الضريبة" : "VAT Amt",
      isAr ? "الإجمالي" : "Total",
    ]],
    body: items,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [0, 112, 242], textColor: 255 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  doc.setFontSize(9);
  doc.text(isAr ? "المجموع قبل الضريبة:" : "Subtotal:", 130, finalY + 10);
  doc.text(Number(invoice.subtotal || 0).toFixed(2), 195, finalY + 10, { align: "right" });

  doc.text(isAr ? "ضريبة القيمة المضافة:" : "VAT:", 130, finalY + 17);
  doc.text(Number(invoice.totalVat || 0).toFixed(2), 195, finalY + 17, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(isAr ? "الإجمالي:" : "Total:", 130, finalY + 26);
  doc.text(`${Number(invoice.grandTotal || 0).toFixed(2)} ${invoice.currency || "SAR"}`, 195, finalY + 26, { align: "right" });

  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("G-Ledger — g-ledger.com", 105, 285, { align: "center" });

  return doc;
}

export async function generateReportPDF(title: string, headers: string[], rows: any[][], companyName: string) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Header
  doc.setFillColor(2, 21, 68);
  doc.rect(0, 0, 297, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`G-Ledger — ${companyName}`, 15, 12);
  doc.setFontSize(10);
  doc.text(title, 15, 19);
  doc.text(new Date().toLocaleDateString(), 282, 12, { align: "right" });

  // Table
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 30,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [0, 112, 242], textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text("G-Ledger — g-ledger.com", 148, 200, { align: "center" });

  return doc;
}

export function downloadPDF(doc: any, filename: string) {
  doc.save(filename);
}

export async function exportToExcel(title: string, headers: string[], rows: any[][]) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = headers.map(() => ({ wch: 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 30));
  XLSX.writeFile(wb, `${title}.xlsx`);
}

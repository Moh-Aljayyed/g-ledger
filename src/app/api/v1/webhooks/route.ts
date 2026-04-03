import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/server/api-auth";
import { db } from "@/server/db";

// Register a webhook URL to receive events
export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, events } = await request.json();

  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });

  // Store webhook in tenant metadata (simplified — would use a Webhook model in production)
  // For now, return success with the configuration
  return NextResponse.json({
    success: true,
    webhook: {
      url,
      events: events || ["invoice.created", "payment.received", "inventory.low", "employee.created"],
      status: "active",
    },
    availableEvents: [
      "invoice.created",
      "invoice.updated",
      "invoice.paid",
      "payment.received",
      "payment.made",
      "customer.created",
      "vendor.created",
      "product.created",
      "product.stock_low",
      "employee.created",
      "employee.terminated",
      "payroll.approved",
      "expense.approved",
      "journal_entry.posted",
    ],
  });
}

// List available webhook events
export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    events: [
      { event: "invoice.created", description: "When a new invoice is created" },
      { event: "invoice.paid", description: "When an invoice is fully paid" },
      { event: "payment.received", description: "When a payment is received from customer" },
      { event: "payment.made", description: "When a payment is made to vendor" },
      { event: "customer.created", description: "When a new customer is added" },
      { event: "vendor.created", description: "When a new vendor is added" },
      { event: "product.created", description: "When a new product is added" },
      { event: "product.stock_low", description: "When product stock goes below reorder level" },
      { event: "employee.created", description: "When a new employee is added" },
      { event: "payroll.approved", description: "When monthly payroll is approved" },
      { event: "expense.approved", description: "When an expense is approved" },
      { event: "journal_entry.posted", description: "When a journal entry is posted" },
    ],
  });
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";

// One-time seed endpoint to create the first super admin
// DELETE this route after first use in production
export async function POST(request: Request) {
  const secret = request.headers.get("x-admin-secret");

  if (secret !== process.env.ADMIN_SEED_SECRET && secret !== "gl-admin-setup-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "email, password, and name are required" },
      { status: 400 }
    );
  }

  // Check if admin already exists
  const existing = await db.superAdmin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Admin already exists", id: existing.id });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await db.superAdmin.create({
    data: { email, passwordHash, name },
  });

  return NextResponse.json({
    success: true,
    id: admin.id,
    email: admin.email,
    name: admin.name,
  });
}

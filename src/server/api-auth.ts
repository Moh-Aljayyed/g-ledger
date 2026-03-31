import { db } from "./db";

export async function authenticateApiKey(request: Request): Promise<{ tenantId: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const key = authHeader.substring(7);
  const apiKey = await db.apiKey.findUnique({ where: { key } });

  if (!apiKey || !apiKey.isActive) return null;

  // Update last used
  await db.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });

  return { tenantId: apiKey.tenantId };
}

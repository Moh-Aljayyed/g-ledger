import type { Sector, UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      tenantId: string;
      tenantName: string;
      sector: Sector;
      role: UserRole;
      locale: string;
      currency: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId: string;
    tenantName: string;
    sector: Sector;
    role: UserRole;
    locale: string;
    currency: string;
  }
}

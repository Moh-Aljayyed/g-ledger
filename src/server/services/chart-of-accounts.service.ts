import type { Sector, AccountType, AccountNature } from "@prisma/client";
import { db } from "@/server/db";
import type { AccountTemplate } from "@/lib/types/sector.types";
import { getSectorConfig } from "@/config/sectors";

export async function provisionChartOfAccounts(
  tenantId: string,
  sector: Sector
): Promise<void> {
  const config = await getSectorConfig(sector);
  if (!config) {
    throw new Error(`No sector config found for: ${sector}`);
  }

  const accounts = flattenTemplateTree(config.chartOfAccounts);

  // Map code -> actual database ID for parent linking
  const codeToId = new Map<string, string>();

  // Insert accounts in order (parents first due to flatten order)
  for (const account of accounts) {
    // Resolve parentId from code to actual database ID
    const parentId = account.parentId ? codeToId.get(account.parentId) : undefined;

    const created = await db.account.create({
      data: {
        code: account.code,
        nameAr: account.nameAr,
        nameEn: account.nameEn,
        type: account.type,
        nature: account.nature,
        level: account.level,
        isLeaf: account.isLeaf,
        isSystem: account.isSystem ?? false,
        sectorTag: account.sectorTag,
        parentId: parentId || null,
        tenantId,
      },
    });

    // Store the mapping: code -> actual ID
    codeToId.set(account.code, created.id);
  }
}

interface FlatAccount {
  code: string;
  nameAr: string;
  nameEn: string;
  type: AccountType;
  nature: AccountNature;
  level: number;
  isLeaf: boolean;
  isSystem: boolean;
  sectorTag?: string;
  parentId?: string;
  id?: string;
}

function flattenTemplateTree(
  templates: AccountTemplate[],
  level: number = 1,
  parentCode?: string
): FlatAccount[] {
  const result: FlatAccount[] = [];

  for (const template of templates) {
    const hasChildren = template.children && template.children.length > 0;

    result.push({
      code: template.code,
      nameAr: template.nameAr,
      nameEn: template.nameEn,
      type: template.type,
      nature: template.nature,
      level,
      isLeaf: !hasChildren,
      isSystem: template.isSystem ?? false,
      sectorTag: template.sectorTag,
      parentId: parentCode,
    });

    if (hasChildren) {
      result.push(
        ...flattenTemplateTree(template.children!, level + 1, template.code)
      );
    }
  }

  return result;
}

export async function getAccountTree(tenantId: string) {
  const accounts = await db.account.findMany({
    where: { tenantId, isActive: true },
    orderBy: { code: "asc" },
  });

  // Build tree structure
  const accountMap = new Map(accounts.map((a) => [a.id, { ...a, children: [] as any[] }]));
  const tree: any[] = [];

  for (const account of accounts) {
    const node = accountMap.get(account.id)!;
    if (account.parentId && accountMap.has(account.parentId)) {
      accountMap.get(account.parentId)!.children.push(node);
    } else {
      tree.push(node);
    }
  }

  return tree;
}

export async function createAccount(
  tenantId: string,
  data: {
    code: string;
    nameAr: string;
    nameEn: string;
    type: string;
    nature: string;
    parentId?: string;
  }
) {
  // Check code uniqueness
  const existing = await db.account.findUnique({
    where: { tenantId_code: { tenantId, code: data.code } },
  });
  if (existing) {
    throw new Error("رمز الحساب مستخدم بالفعل");
  }

  // Determine level
  let level = 1;
  if (data.parentId) {
    const parent = await db.account.findUnique({
      where: { id: data.parentId },
    });
    if (parent) {
      level = parent.level + 1;
      // Mark parent as non-leaf
      if (parent.isLeaf) {
        await db.account.update({
          where: { id: parent.id },
          data: { isLeaf: false },
        });
      }
    }
  }

  return db.account.create({
    data: {
      code: data.code,
      nameAr: data.nameAr,
      nameEn: data.nameEn,
      type: data.type as any,
      nature: data.nature as any,
      level,
      parentId: data.parentId,
      tenantId,
    },
  });
}

export async function deleteAccount(tenantId: string, accountId: string) {
  const account = await db.account.findFirst({
    where: { id: accountId, tenantId },
    include: { children: true, journalLines: { take: 1 } },
  });

  if (!account) throw new Error("الحساب غير موجود");
  if (account.isSystem) throw new Error("لا يمكن حذف حساب نظام");
  if (account.children.length > 0) throw new Error("لا يمكن حذف حساب له حسابات فرعية");
  if (account.journalLines.length > 0) throw new Error("لا يمكن حذف حساب له قيود");

  return db.account.delete({ where: { id: accountId } });
}

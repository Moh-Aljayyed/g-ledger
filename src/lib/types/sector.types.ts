import type { Sector, AccountType, AccountNature } from "@prisma/client";

export interface AccountTemplate {
  code: string;
  nameAr: string;
  nameEn: string;
  type: AccountType;
  nature: AccountNature;
  isSystem?: boolean;
  sectorTag?: string;
  children?: AccountTemplate[];
}

export interface StatementSection {
  key: string;
  nameAr: string;
  nameEn: string;
  accountTypes?: AccountType[];
  accountCodes?: string[];
  sectorTags?: string[];
  children?: StatementSection[];
}

export interface SectorConfig {
  sector: Sector;
  nameAr: string;
  nameEn: string;
  chartOfAccounts: AccountTemplate[];
  financialStatementMapping: {
    incomeStatement: StatementSection[];
    balanceSheet: StatementSection[];
  };
  validationRules?: ValidationRule[];
  dashboardWidgets?: string[];
}

export interface ValidationRule {
  id: string;
  nameAr: string;
  nameEn: string;
  validate: (entry: JournalEntryInput) => ValidationResult;
}

export interface JournalEntryInput {
  date: Date;
  description: string;
  reference?: string;
  lines: {
    accountId: string;
    accountCode: string;
    debit: number;
    credit: number;
    description?: string;
    metadata?: Record<string, unknown>;
  }[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export type { Sector };

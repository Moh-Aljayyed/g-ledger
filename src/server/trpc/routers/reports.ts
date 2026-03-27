import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const reportsRouter = router({
  ledger: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        fromDate: z.date(),
        toDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: { id: input.accountId, tenantId: ctx.tenantId },
      });

      if (!account) return null;

      const lines = await ctx.db.journalLine.findMany({
        where: {
          accountId: input.accountId,
          journalEntry: {
            tenantId: ctx.tenantId,
            status: "POSTED",
            date: { gte: input.fromDate, lte: input.toDate },
          },
        },
        include: {
          journalEntry: {
            select: {
              entryNumber: true,
              date: true,
              description: true,
              reference: true,
            },
          },
        },
        orderBy: { journalEntry: { date: "asc" } },
      });

      // Calculate running balance
      let runningBalance = 0;
      const ledgerLines = lines.map((line) => {
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        if (account.nature === "DEBIT") {
          runningBalance += debit - credit;
        } else {
          runningBalance += credit - debit;
        }
        return {
          ...line,
          debit,
          credit,
          runningBalance,
        };
      });

      return {
        account,
        lines: ledgerLines,
        totalDebit: ledgerLines.reduce((sum, l) => sum + l.debit, 0),
        totalCredit: ledgerLines.reduce((sum, l) => sum + l.credit, 0),
        closingBalance: runningBalance,
      };
    }),

  trialBalance: protectedProcedure
    .input(
      z.object({
        asOfDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const accounts = await ctx.db.account.findMany({
        where: { tenantId: ctx.tenantId, isActive: true },
        orderBy: { code: "asc" },
      });

      // Get aggregated balances for all accounts
      const balances = await ctx.db.journalLine.groupBy({
        by: ["accountId"],
        _sum: { debit: true, credit: true },
        where: {
          journalEntry: {
            tenantId: ctx.tenantId,
            status: "POSTED",
            date: { lte: input.asOfDate },
          },
        },
      });

      const balanceMap = new Map(
        balances.map((b) => [
          b.accountId,
          {
            debit: Number(b._sum.debit ?? 0),
            credit: Number(b._sum.credit ?? 0),
          },
        ])
      );

      const trialBalanceRows = accounts
        .filter((a) => a.isLeaf)
        .map((account) => {
          const bal = balanceMap.get(account.id) ?? { debit: 0, credit: 0 };
          const netDebit = Math.max(0, bal.debit - bal.credit);
          const netCredit = Math.max(0, bal.credit - bal.debit);

          return {
            accountId: account.id,
            accountCode: account.code,
            accountNameAr: account.nameAr,
            accountNameEn: account.nameEn,
            accountType: account.type,
            totalDebit: bal.debit,
            totalCredit: bal.credit,
            balanceDebit: netDebit,
            balanceCredit: netCredit,
          };
        })
        .filter((row) => row.totalDebit > 0 || row.totalCredit > 0);

      const totals = trialBalanceRows.reduce(
        (acc, row) => ({
          totalDebit: acc.totalDebit + row.totalDebit,
          totalCredit: acc.totalCredit + row.totalCredit,
          balanceDebit: acc.balanceDebit + row.balanceDebit,
          balanceCredit: acc.balanceCredit + row.balanceCredit,
        }),
        { totalDebit: 0, totalCredit: 0, balanceDebit: 0, balanceCredit: 0 }
      );

      return { rows: trialBalanceRows, totals };
    }),

  incomeStatement: protectedProcedure
    .input(
      z.object({
        fromDate: z.date(),
        toDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const balances = await ctx.db.journalLine.groupBy({
        by: ["accountId"],
        _sum: { debit: true, credit: true },
        where: {
          journalEntry: {
            tenantId: ctx.tenantId,
            status: "POSTED",
            date: { gte: input.fromDate, lte: input.toDate },
          },
          account: {
            type: { in: ["REVENUE", "EXPENSE"] },
          },
        },
      });

      const accountIds = balances.map((b) => b.accountId);
      const accounts = await ctx.db.account.findMany({
        where: { id: { in: accountIds } },
      });

      const accountMap = new Map(accounts.map((a) => [a.id, a]));

      const revenue: any[] = [];
      const expenses: any[] = [];
      let totalRevenue = 0;
      let totalExpenses = 0;

      for (const bal of balances) {
        const account = accountMap.get(bal.accountId);
        if (!account) continue;

        const debit = Number(bal._sum.debit ?? 0);
        const credit = Number(bal._sum.credit ?? 0);
        const balance = account.type === "REVENUE" ? credit - debit : debit - credit;

        const row = {
          accountId: account.id,
          accountCode: account.code,
          accountNameAr: account.nameAr,
          accountNameEn: account.nameEn,
          balance: Math.abs(balance),
        };

        if (account.type === "REVENUE") {
          revenue.push(row);
          totalRevenue += balance;
        } else {
          expenses.push(row);
          totalExpenses += balance;
        }
      }

      return {
        revenue: revenue.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        expenses: expenses.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
      };
    }),

  balanceSheet: protectedProcedure
    .input(z.object({ asOfDate: z.date() }))
    .query(async ({ ctx, input }) => {
      const balances = await ctx.db.journalLine.groupBy({
        by: ["accountId"],
        _sum: { debit: true, credit: true },
        where: {
          journalEntry: {
            tenantId: ctx.tenantId,
            status: "POSTED",
            date: { lte: input.asOfDate },
          },
          account: {
            type: { in: ["ASSET", "LIABILITY", "EQUITY"] },
          },
        },
      });

      const accountIds = balances.map((b) => b.accountId);
      const accounts = await ctx.db.account.findMany({
        where: { id: { in: accountIds } },
      });

      const accountMap = new Map(accounts.map((a) => [a.id, a]));

      const assets: any[] = [];
      const liabilities: any[] = [];
      const equity: any[] = [];
      let totalAssets = 0;
      let totalLiabilities = 0;
      let totalEquity = 0;

      for (const bal of balances) {
        const account = accountMap.get(bal.accountId);
        if (!account) continue;

        const debit = Number(bal._sum.debit ?? 0);
        const credit = Number(bal._sum.credit ?? 0);

        let balance: number;
        if (account.type === "ASSET") {
          balance = debit - credit;
        } else {
          balance = credit - debit;
        }

        const row = {
          accountId: account.id,
          accountCode: account.code,
          accountNameAr: account.nameAr,
          accountNameEn: account.nameEn,
          balance,
        };

        if (account.type === "ASSET") {
          assets.push(row);
          totalAssets += balance;
        } else if (account.type === "LIABILITY") {
          liabilities.push(row);
          totalLiabilities += balance;
        } else {
          equity.push(row);
          totalEquity += balance;
        }
      }

      return {
        assets: assets.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        liabilities: liabilities.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        equity: equity.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      };
    }),

  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [accountsCount, entriesCount, recentEntries, periodRevenue, periodExpenses] =
      await Promise.all([
        ctx.db.account.count({ where: { tenantId: ctx.tenantId, isActive: true } }),
        ctx.db.journalEntry.count({ where: { tenantId: ctx.tenantId, status: "POSTED" } }),
        ctx.db.journalEntry.findMany({
          where: { tenantId: ctx.tenantId },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { lines: { include: { account: true } } },
        }),
        // Total revenue this year
        ctx.db.journalLine.aggregate({
          _sum: { credit: true, debit: true },
          where: {
            journalEntry: {
              tenantId: ctx.tenantId,
              status: "POSTED",
              date: { gte: yearStart, lte: now },
            },
            account: { type: "REVENUE" },
          },
        }),
        // Total expenses this year
        ctx.db.journalLine.aggregate({
          _sum: { debit: true, credit: true },
          where: {
            journalEntry: {
              tenantId: ctx.tenantId,
              status: "POSTED",
              date: { gte: yearStart, lte: now },
            },
            account: { type: "EXPENSE" },
          },
        }),
      ]);

    const totalRevenue =
      Number(periodRevenue._sum.credit ?? 0) - Number(periodRevenue._sum.debit ?? 0);
    const totalExpenses =
      Number(periodExpenses._sum.debit ?? 0) - Number(periodExpenses._sum.credit ?? 0);

    return {
      accountsCount,
      entriesCount,
      recentEntries,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  }),
});

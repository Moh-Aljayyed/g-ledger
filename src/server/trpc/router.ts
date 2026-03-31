import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { accountsRouter } from "./routers/accounts";
import { journalEntriesRouter } from "./routers/journal-entries";
import { reportsRouter } from "./routers/reports";
import { invoicesRouter } from "./routers/invoices";
import { adminRouter } from "./routers/admin";
import { customersRouter } from "./routers/customers";
import { vendorsRouter } from "./routers/vendors";
import { billsRouter } from "./routers/bills";
import { paymentsRouter } from "./routers/payments";
import { employeesRouter } from "./routers/employees";
import { payrollRouter } from "./routers/payroll";
import { bankRouter } from "./routers/bank";
import { inventoryRouter } from "./routers/inventory";
import { fixedAssetsRouter } from "./routers/fixed-assets";
import { subscriptionRouter } from "./routers/subscription";
import { verificationRouter } from "./routers/verification";
import { productionRouter } from "./routers/production";
import { posRouter } from "./routers/pos";
import { crmRouter } from "./routers/crm";
import { expensesRouter } from "./routers/expenses";
import { projectsRouter } from "./routers/projects";
import { leavesRouter } from "./routers/leaves";
import { helpdeskRouter } from "./routers/helpdesk";
import { referralRouter } from "./routers/referral";
import { apiKeysRouter } from "./routers/api-keys";

export const appRouter = router({
  auth: authRouter,
  accounts: accountsRouter,
  journalEntries: journalEntriesRouter,
  reports: reportsRouter,
  invoices: invoicesRouter,
  admin: adminRouter,
  customers: customersRouter,
  vendors: vendorsRouter,
  bills: billsRouter,
  payments: paymentsRouter,
  employees: employeesRouter,
  payroll: payrollRouter,
  bank: bankRouter,
  inventory: inventoryRouter,
  fixedAssets: fixedAssetsRouter,
  subscription: subscriptionRouter,
  verification: verificationRouter,
  production: productionRouter,
  pos: posRouter,
  crm: crmRouter,
  expenses: expensesRouter,
  projects: projectsRouter,
  leaves: leavesRouter,
  helpdesk: helpdeskRouter,
  referral: referralRouter,
  apiKeys: apiKeysRouter,
});

export type AppRouter = typeof appRouter;

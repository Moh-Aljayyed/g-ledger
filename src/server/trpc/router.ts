import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { accountsRouter } from "./routers/accounts";
import { journalEntriesRouter } from "./routers/journal-entries";
import { reportsRouter } from "./routers/reports";
import { invoicesRouter } from "./routers/invoices";

export const appRouter = router({
  auth: authRouter,
  accounts: accountsRouter,
  journalEntries: journalEntriesRouter,
  reports: reportsRouter,
  invoices: invoicesRouter,
});

export type AppRouter = typeof appRouter;

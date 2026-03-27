import { router } from "./trpc";
import { authRouter } from "./routers/auth";
import { accountsRouter } from "./routers/accounts";
import { journalEntriesRouter } from "./routers/journal-entries";
import { reportsRouter } from "./routers/reports";

export const appRouter = router({
  auth: authRouter,
  accounts: accountsRouter,
  journalEntries: journalEntriesRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;

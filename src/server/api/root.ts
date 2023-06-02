import { createTRPCRouter } from "~/server/api/trpc";
import { adRouter } from "~/server/api/routers/ad";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ad: adRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

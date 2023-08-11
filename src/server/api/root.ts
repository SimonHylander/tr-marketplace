import { createTRPCRouter } from "~/server/api/trpc";
import { adRouter } from "~/server/api/routers/ad";
import { userRouter } from "~/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  ad: adRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

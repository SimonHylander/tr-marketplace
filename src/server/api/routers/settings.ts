import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

export const settingsRouter = createTRPCRouter({
  domains: publicProcedure.query(async ({ ctx, input }) => {
    return [
      {
        name: "staging.treddy.se",
      },
      {
        name: "staging.treddy.fi",
      },
    ]
  }),
});

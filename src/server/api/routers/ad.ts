import { createAdSchema } from "y/schema/ad";
import { createTRPCRouter, publicProcedure } from "y/server/api/trpc";

import { v4 as uuidv4 } from "uuid";

import { env } from "y/env.mjs";

import {
  TreddyApiClient,
  TreddyApiClientConfiguration,
} from "y/server/integrations/treddy/treddy";

import { z } from "zod";

export const adRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.ad.findMany();
  }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const ad = await ctx.prisma.ad.findFirst({
        where: {
          id: input.id,
        },
      });

      return ad;
    }),

  create: publicProcedure
    .input(createAdSchema)
    .mutation(async ({ ctx, input }) => {
      const seller_id = uuidv4();

      const ad = await ctx.prisma.ad.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          seller_id,
        },
      });

      if (input.enableTreddy && ad?.id) {
        const config = new TreddyApiClientConfiguration(
          env.TREDDY_CLIENT_ID,
          env.TREDDY_CLIENT_SECRET,
          env.TREDDY_ENV
        );

        const treddyClient = new TreddyApiClient(config);
        const accessToken = await treddyClient.oauth2().getAccessToken();

        if (accessToken && accessToken.access_token) {
          const createdDeal = await treddyClient
            .deals()
            .v1()
            .create(accessToken.access_token, {
              name: ad.name,
              description: ad.description,
              price: ad.price,
            });

          if (createdDeal) {
            await ctx.prisma.ad.update({
              where: {
                id: ad.id,
              },
              data: {
                treddy_deal_id: createdDeal.id,
                treddy_seller_url: createdDeal.url,
              },
            });
          }

          console.log(createdDeal);
        }
      }
    }),

  buyTreddyNoShipping: publicProcedure
    .input(
      z.object({
        treddyDealId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = new TreddyApiClientConfiguration(
        env.TREDDY_CLIENT_ID,
        env.TREDDY_CLIENT_SECRET,
        env.TREDDY_ENV
      );

      const treddyClient = new TreddyApiClient(config);
      const accessToken = await treddyClient.oauth2().getAccessToken();

      if (accessToken?.access_token) {
        const shipping = await treddyClient
          .deals()
          .v1_1()
          .setShippingType(accessToken.access_token, input.treddyDealId, {
            type: "Pickup",
          });

        console.log(shipping);

        const buyerRequest = await treddyClient
          .deals()
          .v1_1()
          .buyerRequest(accessToken.access_token, input.treddyDealId, {
            sendEmail: true,
          });
      }
    }),
});

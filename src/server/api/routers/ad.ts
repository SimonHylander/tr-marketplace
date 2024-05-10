import { createAdSchema } from "~/schema/ad";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { env } from "~/env.mjs";

import {
  TreddyApiClient,
  TreddyApiClientConfiguration,
} from "~/server/integrations/treddy/treddy";

import { z } from "zod";

export const adRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx, input }) => {
    return ctx.prisma.ad.findMany({
      include: {
        seller: {
          select: {
            name: true,
          },
        },
        treddy: {
          select: {
            dealId: true,
          },
        },
      },
    });
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
        include: {
          seller: {
            select: {
              id: true,
              name: true,
            },
          },
          treddy: {
            select: {
              dealId: true,
              sellerUrl: true,
            },
          },
        },
      });

      return ad;
    }),

  create: publicProcedure
    .input(createAdSchema)
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.prisma.user.findFirst({
        where: {
          isSeller: true,
        },
      });

      if (!seller) {
        throw new Error("Buyer not found");
      }

      const ad = await ctx.prisma.ad.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          seller: {
            connect: {
              id: seller.id,
            },
          },
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
          const [firstname, lastname] = seller.name.split(" ");

          const createdDeal = await treddyClient
            .deals()
            .v1()
            .create(accessToken.access_token, {
              name: ad.name,
              description: ad.description,
              price: ad.price,
              images: ["https://treddy.se/images/logo.svg"],
              seller: {
                firstname: firstname ?? "",
                lastname: lastname ?? "",
                email: seller.email,
              },
            })
            .catch((err) => {
              console.error("catch");
              console.error(err);
            });

          if (createdDeal) {
            await ctx.prisma.treddyAd.create({
              data: {
                ad: {
                  connect: {
                    id: ad.id,
                  },
                },
                dealId: createdDeal.id,
                sellerUrl: createdDeal.url,
              },
            });
          }
        }
      }
    }),

  buyWithTreddy: publicProcedure
    .input(
      z.object({
        treddyDealId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ad = await ctx.prisma.ad.findFirst({
        where: {
          treddy: {
            dealId: input.treddyDealId,
          },
        },
      });

      if (!ad) {
        throw new Error("Ad not found");
      }

      const buyer = await ctx.prisma.user.findFirst({
        where: {
          isBuyer: true,
        },
      });

      if (!buyer) {
        throw new Error("Buyer not found");
      }

      const config = new TreddyApiClientConfiguration(
        env.TREDDY_CLIENT_ID,
        env.TREDDY_CLIENT_SECRET,
        env.TREDDY_ENV
      );

      const treddyClient = new TreddyApiClient(config);
      const accessToken = await treddyClient.oauth2().getAccessToken();

      if (accessToken?.access_token) {
        const buyerRedirectUrl = `${ctx.req.headers.origin}/ads/${ad.id}`;
        const sellerRedirectUrl = `${ctx.req.headers.origin}/ads/${ad.id}`;

        const dealOffer = await treddyClient
          .deals()
          .v1()
          .offer(accessToken.access_token, input.treddyDealId, {
            buyer: {
              name: buyer.name,
              email: buyer.email,
            },
            buyerRedirectUrl,
            sellerRedirectUrl,
          })
          .catch((error) => {
            console.error(error);
          });

        if (dealOffer) {
          return dealOffer;
        }
      }
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Deleting ad");
      console.log(input.id);

      const treddyAd = await ctx.prisma.treddyAd.findFirst({
        where: {
          adId: input.id,
        },
      });

      if (treddyAd) {
        await ctx.prisma.treddyAd
          .delete({
            where: {
              id: treddyAd.id,
            },
          })
          .catch((err) => {
            console.error("Error deleting treddy ad");
            console.error(err);
          });

        console.log("Treddy ad deleted");
      }

      const ad = await ctx.prisma.ad.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!ad) {
        throw new Error("Ad not found");
      }

      ctx.prisma.ad
        .delete({
          where: {
            id: input.id,
          },
        })
        .catch((err) => {
          console.error("Error deleting ad");
          console.error(err);
        });
    }),
  deleteAll: publicProcedure.mutation(async ({ ctx }) => {
    console.log("Deleting all ads");

    const treddyAds = await ctx.prisma.treddyAd.findMany();

    if (treddyAds) {
      await ctx.prisma.treddyAd.deleteMany().catch((err) => {
        console.error("Error deleting treddy ads");
        console.error(err);
      });

      console.log("Treddy ads deleted");
    }

    const ads = await ctx.prisma.ad.findMany();

    if (ads) {
      ctx.prisma.ad.deleteMany().catch((err) => {
        console.error("Error deleting ads");
        console.error(err);
      });
    }
  }),
});

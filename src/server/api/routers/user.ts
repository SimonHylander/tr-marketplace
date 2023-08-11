import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  validate: publicProcedure.query(async ({ ctx }) => {
    const sellerUser = await ctx.prisma.user.findFirst({
      where: {
        isSeller: true,
      },
    });

    const buyerUser = await ctx.prisma.user.findFirst({
      where: {
        isBuyer: true,
      },
    });

    return {
      seller: sellerUser !== null,
      buyer: buyerUser !== null,
    };
  }),
});

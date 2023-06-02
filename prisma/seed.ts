import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const simon = await prisma.user.upsert({
    where: { email: "simon.hylander@skoglit.se" },
    update: {},
    create: {
      email: "simon.hylander@skoglit.se",
      name: "Simon Hylander",
      isSeller: false,
      isBuyer: true,
    },
  });
  const magnus = await prisma.user.upsert({
    where: { email: "hylandersimon@gmail.com" },
    update: {},
    create: {
      email: "hylandersimon@gmail.com",
      name: "Magnus Skoglund",
      isSeller: true,
      isBuyer: false,
    },
  });

  console.log({ simon, magnus });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function run(fn: (prisma: PrismaClient) => Promise<void>) {
  try {
    await fn(prisma);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

export default prisma;
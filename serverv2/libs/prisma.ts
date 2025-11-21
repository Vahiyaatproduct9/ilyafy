import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { configDotenv } from "dotenv";
configDotenv();
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL
});
const prismaGlobal = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  prismaGlobal.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'error', 'warn'],
    adapter
  });

export default prisma;
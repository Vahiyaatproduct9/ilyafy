import { defineConfig, env } from "prisma/config";
import { configDotenv } from "dotenv";
configDotenv({
  quiet: true
});
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),

  },
});

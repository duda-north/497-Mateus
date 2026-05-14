import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { resolveDatabaseUrl } from "../../database-url";

/** Bust `globalThis` cache when the DB stack changes (e.g. better-sqlite3 → libsql). */
const PRISMA_SINGLETON_VERSION = "libsql-file-v2";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSingletonVersion?: string;
};

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaLibSql({
      url: resolveDatabaseUrl(),
    }),
    log: process.env["NODE_ENV"] === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prismaSingletonVersion !== PRISMA_SINGLETON_VERSION) {
    const prev = globalForPrisma.prisma;
    globalForPrisma.prisma = undefined;
    globalForPrisma.prismaSingletonVersion = PRISMA_SINGLETON_VERSION;
    if (prev) {
      void prev.$disconnect();
    }
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma =
  process.env["NODE_ENV"] === "production"
    ? createPrismaClient()
    : getPrisma();

import path from "node:path";
import { pathToFileURL } from "node:url";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

/** Bust `globalThis` cache when the DB stack changes (e.g. better-sqlite3 → libsql). */
const PRISMA_SINGLETON_VERSION = "libsql-file-v2";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSingletonVersion?: string;
};

function databaseUrl(): string {
  const raw = process.env["DATABASE_URL"]?.trim();
  if (raw && !raw.startsWith("file:")) {
    return raw;
  }
  const relative =
    raw?.replace(/^file:/i, "").replace(/^\/+/, "") ?? "dev.db";
  const absolute = path.isAbsolute(relative)
    ? relative
    : path.join(/* turbopackIgnore: true */ process.cwd(), relative);
  return pathToFileURL(absolute).href;
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaLibSql({
      url: databaseUrl(),
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

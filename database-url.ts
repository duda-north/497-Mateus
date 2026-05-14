/**
 * Resolves the DB URL for Prisma CLI (`prisma.config.ts`) and the LibSQL adapter
 * (`src/lib/prisma.ts`). Default local DB is relative to `process.cwd()` so paths
 * with spaces (common on Windows user profiles) do not break Prisma's schema engine.
 */
export function resolveDatabaseUrl(): string {
  const raw = process.env["DATABASE_URL"]?.trim();
  if (raw && !raw.toLowerCase().startsWith("file:")) {
    return raw;
  }
  if (raw?.toLowerCase().startsWith("file:")) {
    return raw;
  }
  return "file:./dev.db";
}

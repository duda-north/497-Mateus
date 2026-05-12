import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native addons (libsql / Prisma driver adapters) must not be bundled incorrectly by Turbopack.
  serverExternalPackages: [
    "@libsql/client",
    "libsql",
    "@prisma/adapter-libsql",
    "@prisma/client",
  ],
};

export default nextConfig;

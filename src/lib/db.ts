import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse a single PrismaClient across hot reloads in dev to avoid exhausting
// database connections. In production a fresh module instance is fine.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Prisma 7 requires an explicit driver adapter to connect.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

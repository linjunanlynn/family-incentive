import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** After `prisma generate` adds models, dev can keep a stale PrismaClient on `globalThis` — `userAccount` would be missing. */
function clientHasUserAccount(client: PrismaClient): boolean {
  const u = (client as unknown as { userAccount?: { findUnique?: unknown } }).userAccount;
  return typeof u?.findUnique === "function";
}

let prisma: PrismaClient;
if (process.env.NODE_ENV !== "production") {
  const g = globalForPrisma.prisma;
  if (g && !clientHasUserAccount(g)) {
    void g.$disconnect().catch(() => {});
    globalForPrisma.prisma = undefined;
  }
  prisma = globalForPrisma.prisma ?? makePrismaClient();
  globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma ?? makePrismaClient();
}

export { prisma };

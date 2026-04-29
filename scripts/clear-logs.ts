import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.logEntry.deleteMany();
  console.log(`🗑  Deleted ${r.count} log entries.`);
  await prisma.$disconnect();
}
main();

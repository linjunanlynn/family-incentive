import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();
async function main() {
  const familyId = process.env.FAMILY_ID ?? "default-family";
  const r = await prisma.logEntry.deleteMany({ where: { familyId } });
  console.log(`🗑  Deleted ${r.count} log entries.`);
  await prisma.$disconnect();
}
main();

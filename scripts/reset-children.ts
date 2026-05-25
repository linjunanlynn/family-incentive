import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

/**
 * Deletes every Child row. Postgres cascades remove:
 * categories, behaviors, log entries, and child-linked UserAccounts (jimmy/aimee).
 * Members and parent/grandparent accounts are kept.
 */
async function main() {
  const familyId = process.env.FAMILY_ID ?? "default-family";
  const r = await prisma.child.deleteMany({ where: { familyId } });
  console.log(
    `🗑  Deleted ${r.count} child row(s). Related categories, behaviors, logs, and child login accounts were removed by cascade.`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

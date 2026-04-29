import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();
async function main() {
  const child = await prisma.child.findFirst({ where: { nameEn: "Jimmy" } });
  if (!child) throw new Error("no child");
  const beh = await prisma.behavior.findFirst({
    where: { category: { childId: child.id }, type: "positive" },
  });
  if (!beh) throw new Error("no behavior");

  const today = new Date();
  const dateKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  await prisma.logEntry.createMany({
    data: [
      { childId: child.id, behaviorId: beh.id, type: "positive", points: beh.points, occurrences: 1, date, notes: "test today" },
      { childId: child.id, behaviorId: beh.id, type: "positive", points: beh.points, occurrences: 2, date: new Date(date.getTime() - 86400000), notes: "yesterday" },
      { childId: child.id, behaviorId: beh.id, type: "positive", points: beh.points, occurrences: 1, date: new Date(date.getTime() - 2*86400000) },
    ],
  });

  const negBeh = await prisma.behavior.findFirst({
    where: { category: { childId: child.id }, type: "negative" },
  });
  if (negBeh) {
    await prisma.logEntry.create({
      data: { childId: child.id, behaviorId: negBeh.id, type: "negative", points: -negBeh.points, occurrences: 1, date: new Date(date.getTime() - 3*86400000) },
    });
  }

  const total = await prisma.logEntry.aggregate({
    where: { childId: child.id },
    _sum: { points: true },
  });
  console.log("Jimmy logs created. current sum:", total._sum.points);
  await prisma.$disconnect();
}
main();

import { prisma } from "@/lib/prisma";
import { getCurrentChildId } from "@/lib/session";
import { CheckinClient } from "@/components/CheckinClient";
import { addDays, toLocalDateKey } from "@/lib/utils";
import { getSession } from "@/lib/get-session";
import { canScore } from "@/lib/permissions";

type SearchParams = Promise<{ date?: string }>;

export default async function CheckinPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const dateKey = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : toLocalDateKey(new Date());

  const childId = await getCurrentChildId();
  const children = await prisma.child.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  });
  if (children.length === 0) {
    return <div className="card p-6 text-[color:var(--foreground-muted)]">No children configured.</div>;
  }
  const child = children.find((c) => c.id === childId) ?? children[0];

  const categories = await prisma.category.findMany({
    where: { childId: child.id, archived: false },
    orderBy: { order: "asc" },
    include: {
      behaviors: {
        where: { archived: false },
        orderBy: [{ type: "asc" }, { order: "asc" }],
      },
    },
  });

  const dayStart = new Date(`${dateKey}T00:00:00.000Z`);
  const dayEnd = new Date(`${toLocalDateKey(addDays(new Date(dateKey), 1))}T00:00:00.000Z`);
  const session = await getSession();
  const canScoreFlag = canScore(session);

  const todayLogs = await prisma.logEntry.findMany({
    where: { childId: child.id, date: { gte: dayStart, lt: dayEnd } },
    orderBy: { createdAt: "desc" },
    include: {
      behavior: { select: { id: true, nameZh: true, nameEn: true, type: true, points: true, category: { select: { nameZh: true, nameEn: true, emoji: true } } } },
      createdBy: { select: { id: true, nameZh: true, nameEn: true, emoji: true } },
    },
  });

  return (
    <CheckinClient
      child={{ id: child.id, nameZh: child.nameZh, nameEn: child.nameEn, emoji: child.emoji, color: child.color }}
      dateKey={dateKey}
      categories={categories.map((c) => ({
        id: c.id,
        nameZh: c.nameZh,
        nameEn: c.nameEn,
        emoji: c.emoji,
        behaviors: c.behaviors.map((b) => ({
          id: b.id,
          nameZh: b.nameZh,
          nameEn: b.nameEn,
          type: b.type as "positive" | "negative",
          points: b.points,
        })),
      }))}
      canScore={canScoreFlag}
      todayLogs={todayLogs.map((l) => ({
        id: l.id,
        type: l.type as "positive" | "negative",
        points: l.points,
        occurrences: l.occurrences,
        notes: l.notes,
        createdAt: l.createdAt.toISOString(),
        behavior: l.behavior
          ? {
              id: l.behavior.id,
              nameZh: l.behavior.nameZh,
              nameEn: l.behavior.nameEn,
              category: l.behavior.category,
            }
          : null,
        createdBy: l.createdBy,
      }))}
    />
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentChildId } from "@/lib/session";
import { getDict } from "@/i18n/server";
import {
  getCategoryBreakdown,
  getCurrentPoints,
  getDailySeries,
  getMonthlySeries,
  getRangeStats,
  rangeForMonth,
  rangeForWeek,
  rangeForYear,
  computeBestDay,
} from "@/lib/stats";
import { addDays, formatRange, parseLocalDateKey, toLocalDateKey } from "@/lib/utils";
import { DashboardClient } from "@/components/DashboardClient";
import { getSession } from "@/lib/get-session";
import { isChild } from "@/lib/permissions";
import { childWhereFor } from "@/lib/family-scope";

type SearchParams = Promise<{
  view?: string;
  date?: string;
}>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const view = (sp.view === "month" || sp.view === "year" ? sp.view : "week") as
    | "week"
    | "month"
    | "year";

  const baseDate =
    sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? parseLocalDateKey(sp.date) : new Date();

  const { locale } = await getDict();
  const session = await getSession();

  const childId = await getCurrentChildId();
  const children = await prisma.child.findMany({
    where: { archived: false, ...childWhereFor(session) },
    orderBy: { order: "asc" },
  });
  if (children.length === 0) {
    return <EmptyState message="还没有孩子成员。请先到“家庭成员”创建孩子账号。" />;
  }
  const child = children.find((c) => c.id === childId) ?? children[0];

  const range =
    view === "week"
      ? rangeForWeek(baseDate)
      : view === "month"
        ? rangeForMonth(baseDate)
        : rangeForYear(baseDate);

  const [
    currentPoints,
    rangeStats,
    daily,
    categoryBreakdown,
    monthly,
    recent,
    todayLogsCount,
  ] = await Promise.all([
    getCurrentPoints(child.id),
    getRangeStats(child.id, range.start, range.end),
    getDailySeries(child.id, range.start, range.end),
    getCategoryBreakdown(child.id, range.start, range.end),
    view === "year" ? getMonthlySeries(child.id, baseDate.getFullYear()) : Promise.resolve(null),
    prisma.logEntry.findMany({
      where: { childId: child.id, date: { gte: range.start, lte: range.end } },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        behavior: { select: { id: true, nameZh: true, nameEn: true, type: true, category: { select: { nameZh: true, nameEn: true, emoji: true } } } },
        createdBy: { select: { id: true, nameZh: true, nameEn: true, emoji: true } },
      },
    }),
    prisma.logEntry.count({
      where: {
        childId: child.id,
        date: {
          gte: new Date(`${toLocalDateKey(new Date())}T00:00:00.000Z`),
          lt: new Date(`${toLocalDateKey(addDays(new Date(), 1))}T00:00:00.000Z`),
        },
      },
    }),
  ]);

  const best = computeBestDay(daily);

  // Yearly heatmap (always compute for year view)
  let heatmap: { dateKey: string; net: number }[] | null = null;
  if (view === "year") {
    heatmap = await getDailySeries(
      child.id,
      new Date(baseDate.getFullYear(), 0, 1),
      new Date(baseDate.getFullYear(), 11, 31),
    ).then((arr) => arr.map((d) => ({ dateKey: d.dateKey, net: d.net })));
  }

  return (
    <DashboardClient
      view={view}
      selectedDateKey={toLocalDateKey(baseDate)}
      todayDateKey={toLocalDateKey(new Date())}
      child={{
        id: child.id,
        nameZh: child.nameZh,
        nameEn: child.nameEn,
        emoji: child.emoji,
        color: child.color,
        avatarUrl: child.avatarUrl,
        backgroundUrl: child.backgroundUrl,
      }}
      currentPoints={currentPoints}
      rangeStats={rangeStats}
      daily={daily}
      categoryBreakdown={categoryBreakdown}
      monthly={monthly}
      heatmap={heatmap}
      best={best}
      todayCount={todayLogsCount}
      rangeLabel={formatRange(range.start, range.end, locale)}
      year={baseDate.getFullYear()}
      recent={recent.map((r) => ({
        id: r.id,
        date: r.date.toISOString(),
        type: r.type as "positive" | "negative",
        points: r.points,
        occurrences: r.occurrences,
        notes: r.notes,
        behavior: r.behavior
          ? {
              nameZh: r.behavior.nameZh,
              nameEn: r.behavior.nameEn,
              category: r.behavior.category,
            }
          : null,
        createdBy: r.createdBy,
      }))}
      showDailyCheckin={!isChild(session)}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="card p-8 text-center text-[color:var(--foreground-muted)]">
      {message}
      <div className="mt-4">
        <Link className="btn btn-primary" href="/members">创建家庭成员</Link>
      </div>
    </div>
  );
}

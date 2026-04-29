import { prisma } from "./prisma";
import {
  addDays,
  eachDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toLocalDateKey,
} from "./utils";

export type DailyPoint = {
  dateKey: string;
  positive: number;
  negative: number;
  net: number;
};

export type CategoryBreakdown = {
  categoryId: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  positive: number;
  negative: number;
  net: number;
};

/** Sum points for a child in a date range (inclusive). */
export async function getRangeStats(childId: string, start: Date, end: Date) {
  const logs = await prisma.logEntry.findMany({
    where: {
      childId,
      date: { gte: startOfDayUtc(start), lte: endOfDayUtc(end) },
    },
    select: { date: true, type: true, points: true, occurrences: true },
  });

  let positive = 0;
  let negative = 0;
  for (const l of logs) {
    if (l.type === "positive") positive += l.points * l.occurrences;
    else negative += Math.abs(l.points * l.occurrences);
  }

  return {
    positive,
    negative,
    net: positive - negative,
    count: logs.length,
  };
}

/** Daily breakdown (one row per day in [start..end]). */
export async function getDailySeries(
  childId: string,
  start: Date,
  end: Date,
): Promise<DailyPoint[]> {
  const logs = await prisma.logEntry.findMany({
    where: { childId, date: { gte: startOfDayUtc(start), lte: endOfDayUtc(end) } },
    select: { date: true, type: true, points: true, occurrences: true },
  });

  const map = new Map<string, DailyPoint>();
  for (const day of eachDay(start, end)) {
    const k = toLocalDateKey(day);
    map.set(k, { dateKey: k, positive: 0, negative: 0, net: 0 });
  }

  for (const l of logs) {
    const k = toLocalDateKey(l.date);
    const row = map.get(k);
    if (!row) continue;
    const v = l.points * l.occurrences;
    if (l.type === "positive") row.positive += v;
    else row.negative += Math.abs(v);
    row.net = row.positive - row.negative;
  }

  return Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

/** Per-category breakdown for a date range. */
export async function getCategoryBreakdown(
  childId: string,
  start: Date,
  end: Date,
): Promise<CategoryBreakdown[]> {
  const logs = await prisma.logEntry.findMany({
    where: { childId, date: { gte: startOfDayUtc(start), lte: endOfDayUtc(end) } },
    select: {
      type: true,
      points: true,
      occurrences: true,
      behavior: { select: { categoryId: true } },
    },
  });

  const cats = await prisma.category.findMany({
    where: { childId },
    orderBy: { order: "asc" },
    select: { id: true, nameZh: true, nameEn: true, emoji: true },
  });

  const map = new Map<string, CategoryBreakdown>();
  for (const c of cats) {
    map.set(c.id, { categoryId: c.id, nameZh: c.nameZh, nameEn: c.nameEn, emoji: c.emoji, positive: 0, negative: 0, net: 0 });
  }
  for (const l of logs) {
    const cid = l.behavior?.categoryId;
    if (!cid) continue;
    const row = map.get(cid);
    if (!row) continue;
    const v = l.points * l.occurrences;
    if (l.type === "positive") row.positive += v;
    else row.negative += Math.abs(v);
    row.net = row.positive - row.negative;
  }
  return Array.from(map.values());
}

export function computeBestDay(daily: DailyPoint[]): DailyPoint | null {
  let best: DailyPoint | null = null;
  for (const d of daily) {
    if (!best || d.net > best.net) best = d;
  }
  return best && best.net > 0 ? best : null;
}

/** Get aggregated monthly totals for the year. */
export async function getMonthlySeries(childId: string, year: number) {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  const logs = await prisma.logEntry.findMany({
    where: { childId, date: { gte: startOfDayUtc(start), lte: endOfDayUtc(end) } },
    select: { date: true, type: true, points: true, occurrences: true },
  });
  const months = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i,
    positive: 0,
    negative: 0,
    net: 0,
  }));
  for (const l of logs) {
    const m = new Date(l.date).getMonth();
    const v = l.points * l.occurrences;
    if (l.type === "positive") months[m].positive += v;
    else months[m].negative += Math.abs(v);
    months[m].net = months[m].positive - months[m].negative;
  }
  return months;
}

/** All-time net points balance for a child (current points). */
export async function getCurrentPoints(childId: string): Promise<number> {
  const agg = await prisma.logEntry.aggregate({
    where: { childId },
    _sum: { points: true },
  });
  return agg._sum.points ?? 0;
}

/** Date range helpers exported for convenience. */
export function rangeForWeek(d: Date) {
  return { start: startOfWeek(d, 1), end: endOfWeek(d, 1) };
}
export function rangeForMonth(d: Date) {
  return { start: startOfMonth(d), end: endOfMonth(d) };
}
export function rangeForYear(d: Date) {
  return { start: startOfYear(d), end: endOfYear(d) };
}

function startOfDayUtc(d: Date): Date {
  return new Date(`${toLocalDateKey(d)}T00:00:00.000Z`);
}
function endOfDayUtc(d: Date): Date {
  // inclusive end-of-day in UTC for the local date
  const next = addDays(d, 1);
  const k = toLocalDateKey(next);
  return new Date(`${k}T00:00:00.000Z`);
}

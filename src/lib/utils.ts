import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date to YYYY-MM-DD using local timezone. */
export function toLocalDateKey(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse `YYYY-MM-DD` as local calendar date (avoids UTC shift from `new Date("YYYY-MM-DD")`). */
export function parseLocalDateKey(key: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return new Date();
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return new Date();
  return new Date(y, mo - 1, d);
}

/** Convert a YYYY-MM-DD local date to a Date at UTC midnight (used for DB storage). */
export function localDateKeyToUtcMidnight(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

export function startOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = x.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  x.setDate(x.getDate() - diff);
  return x;
}

export function endOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const s = startOfWeek(d, weekStartsOn);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

/** Return [start..end] inclusive list of dates. */
export function eachDay(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= e) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function formatDate(d: Date, locale: "zh" | "en"): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatRange(a: Date, b: Date, locale: "zh" | "en"): string {
  const fmt = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  });
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.getFullYear()} · ${fmt.format(a)} – ${fmt.format(b)}`;
  }
  return `${formatDate(a, locale)} – ${formatDate(b, locale)}`;
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart2, LineChart as LineChartIcon, PlusCircle, Sparkles, Trophy } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { addDays, formatDate, parseLocalDateKey, toLocalDateKey } from "@/lib/utils";
import { DashboardDateNav } from "@/components/DashboardDateNav";
import { OverviewCheckinNav } from "@/components/OverviewCheckinNav";
import { cn } from "@/lib/utils";

type DailyPoint = { dateKey: string; positive: number; negative: number; net: number };

type Props = {
  view: "week" | "month" | "year";
  selectedDateKey: string;
  /** Calendar "today" for the no-activity banner link. */
  todayDateKey: string;
  child: { id: string; nameZh: string; nameEn: string; emoji: string; color: string };
  currentPoints: number;
  rangeStats: { positive: number; negative: number; net: number; count: number };
  daily: DailyPoint[];
  categoryBreakdown: {
    categoryId: string;
    nameZh: string;
    nameEn: string;
    emoji: string;
    positive: number;
    negative: number;
    net: number;
  }[];
  monthly: { monthIndex: number; positive: number; negative: number; net: number }[] | null;
  heatmap: { dateKey: string; net: number }[] | null;
  best: DailyPoint | null;
  todayCount: number;
  rangeLabel: string;
  year: number;
  recent: {
    id: string;
    date: string;
    type: "positive" | "negative";
    points: number;
    occurrences: number;
    notes: string | null;
    behavior: { nameZh: string; nameEn: string; category: { nameZh: string; nameEn: string; emoji: string } | null } | null;
    createdBy: { id: string; nameZh: string; nameEn: string; emoji: string } | null;
  }[];
};

type ChartSeries = "bars" | "line";

export function DashboardClient(props: Props) {
  const { t, locale, pick } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [chartSeries, setChartSeries] = useState<ChartSeries>("bars");
  const categoryPanelRef = useRef<HTMLDivElement>(null);
  const [chartPanelHeight, setChartPanelHeight] = useState<number | null>(null);

  /** Switch `view` and/or set anchor `date`. Omit `date` to keep the current URL `date` (scheme A). */
  function navigate(view: "week" | "month" | "year", date?: Date) {
    const params = new URLSearchParams(sp.toString());
    params.set("view", view);
    if (date !== undefined) params.set("date", toLocalDateKey(date));
    startTransition(() => router.push(`/?${params.toString()}`));
  }

  function shift(direction: -1 | 1) {
    const d = parseLocalDateKey(props.selectedDateKey);
    if (props.view === "week") d.setDate(d.getDate() + 7 * direction);
    else if (props.view === "month") d.setMonth(d.getMonth() + direction);
    else d.setFullYear(d.getFullYear() + direction);
    navigate(props.view, d);
  }

  const dailyChartData = useMemo(
    () =>
      props.daily.map((d) => ({
        ...d,
        label:
          props.view === "year"
            ? `${new Date(d.dateKey).getMonth() + 1}/${new Date(d.dateKey).getDate()}`
            : `${new Date(d.dateKey).getMonth() + 1}/${new Date(d.dateKey).getDate()}`,
      })),
    [props.daily, props.view],
  );

  const monthlyChartData = useMemo(
    () =>
      (props.monthly ?? []).map((m) => ({
        label: t.months[m.monthIndex],
        ...m,
      })),
    [props.monthly, t.months],
  );

  const totalCategoryNet =
    props.categoryBreakdown.reduce((s, c) => s + Math.max(c.positive + c.negative, 0), 0) || 1;

  const useMonthlyBars = props.view === "year" && (props.monthly ?? []).length > 0;
  const barChartData: { label: string; positive: number; negative: number }[] = useMonthlyBars
    ? monthlyChartData.map(({ label, positive, negative }) => ({ label, positive, negative }))
    : dailyChartData.map(({ label, positive, negative }) => ({ label, positive, negative }));
  const lineChartData = useMemo(
    () =>
      useMonthlyBars
        ? monthlyChartData.map((m) => ({ label: m.label, net: m.net }))
        : dailyChartData.map((d) => ({ label: d.label, net: d.net })),
    [useMonthlyBars, monthlyChartData, dailyChartData],
  );

  useLayoutEffect(() => {
    const el = categoryPanelRef.current;
    if (!el) return;

    function measure() {
      const box = categoryPanelRef.current;
      if (typeof window === "undefined" || !box) return;
      if (window.innerWidth < 1024) {
        setChartPanelHeight(null);
        return;
      }
      setChartPanelHeight(Math.round(box.getBoundingClientRect().height));
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [props.categoryBreakdown, props.view, locale]);

  return (
    <div className="space-y-6">
      <OverviewCheckinNav mode="overview" dateKey={props.selectedDateKey} overviewView={props.view} />

      {/* Header */}
      <section className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl text-2xl inline-flex items-center justify-center shrink-0"
            style={{ background: `${props.child.color}22`, color: props.child.color }}
          >
            {props.child.emoji}
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-semibold flex flex-wrap items-center gap-2">
              <span className="truncate">{pick(props.child)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)] shrink-0">
                {props.view === "week"
                  ? t.dashboard.titleWeek
                  : props.view === "month"
                    ? t.dashboard.titleMonth
                    : t.dashboard.titleYear}
              </span>
            </div>
            <div className="text-sm text-[color:var(--foreground-muted)] break-words">{props.rangeLabel}</div>
          </div>
        </div>

        <div className="hidden lg:block flex-1 min-w-4" />

        {/* View switcher + date (full width row on small screens for tap targets) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center w-full lg:w-auto min-w-0">
          <div className="card-2 rounded-full p-1 flex items-center justify-center sm:justify-start w-full sm:w-auto">
            {(["week", "month", "year"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => navigate(v)}
                className={cn(
                  "flex-1 sm:flex-initial px-3 min-h-11 sm:min-h-8 h-11 sm:h-8 rounded-full text-sm transition-colors touch-manipulation",
                  v === props.view
                    ? "bg-[color:var(--surface)] shadow-sm"
                    : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
                )}
              >
                {v === "week" ? t.common.week : v === "month" ? t.common.month : t.common.year}
              </button>
            ))}
          </div>

          <div className="flex justify-center sm:justify-start w-full sm:w-auto overflow-x-auto pb-0.5">
            <DashboardDateNav
              selectedDateKey={props.selectedDateKey}
              onNavigate={(d) => navigate(props.view, d)}
              onShift={shift}
            />
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard
          icon={<Sparkles className="w-4 h-4" />}
          label={t.dashboard.currentPoints}
          value={props.currentPoints}
          accent={props.child.color}
          highlight
        />
        <KpiCard
          icon={<Trophy className="w-4 h-4" />}
          label={
            props.view === "week"
              ? t.dashboard.thisWeek
              : props.view === "month"
                ? t.dashboard.thisMonth
                : t.dashboard.thisYear
          }
          value={props.rangeStats.net}
          subtitle={`☆ ${props.rangeStats.positive}  ·  △ ${props.rangeStats.negative}`}
        />
        <KpiCard
          icon={<Trophy className="w-4 h-4 text-[color:var(--positive)]" />}
          label={t.dashboard.bestDay}
          value={props.best?.net ?? 0}
          subtitle={
            props.best
              ? formatDate(new Date(props.best.dateKey), locale)
              : t.common.noData
          }
        />
      </section>

      {/* Today CTA */}
      {props.todayCount === 0 && (
        <Link
          href={`/checkin?date=${encodeURIComponent(props.todayDateKey)}`}
          className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center hover:bg-[color:var(--surface-2)] transition-colors touch-manipulation"
        >
          <div className="flex items-start gap-3 sm:contents">
            <PlusCircle className="w-5 h-5 text-[color:var(--primary)] shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 text-sm min-w-0">{t.dashboard.noActivity}</div>
          </div>
          <span className="btn btn-primary w-full sm:w-auto justify-center shrink-0">{t.dashboard.goCheckin}</span>
        </Link>
      )}

      {/* Trend chart + category breakdown (lg: chart height matches category panel) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
        <div
          className={cn(
            "card p-3 sm:p-4 lg:col-span-2 flex flex-col min-h-0 min-w-0",
            chartPanelHeight == null && "lg:min-h-[280px]",
          )}
          style={
            chartPanelHeight != null
              ? ({ height: chartPanelHeight } as React.CSSProperties)
              : undefined
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
            <div className="font-medium text-sm sm:text-base">
              {props.view === "year" ? t.dashboard.monthlyTotal : t.dashboard.dailyTotal}
            </div>
            <div className="card-2 rounded-full p-0.5 flex items-center shrink-0" role="tablist" aria-label={t.dashboard.trend}>
              <button
                type="button"
                role="tab"
                aria-selected={chartSeries === "bars"}
                onClick={() => setChartSeries("bars")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full text-xs sm:text-sm transition-colors",
                  chartSeries === "bars"
                    ? "bg-[color:var(--surface)] shadow-sm text-[color:var(--foreground)]"
                    : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
                )}
              >
                <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
                <span>{t.dashboard.chartStyleBars}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={chartSeries === "line"}
                onClick={() => setChartSeries("line")}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full text-xs sm:text-sm transition-colors",
                  chartSeries === "line"
                    ? "bg-[color:var(--surface)] shadow-sm text-[color:var(--foreground)]"
                    : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
                )}
              >
                <LineChartIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
                <span>{t.dashboard.chartStyleLine}</span>
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[240px] sm:min-h-[220px] lg:min-h-0 w-full min-w-0">
            {chartSeries === "bars" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={28} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="positive" name={t.common.stars} fill="var(--positive)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="negative" name={t.common.triangles} fill="var(--negative)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={28} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name={t.common.net}
                    stroke={props.child.color}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div ref={categoryPanelRef} className="card p-3 lg:p-4 w-full min-w-0">
          <div className="font-medium text-sm mb-2.5">{t.dashboard.breakdownByCategory}</div>
          <div className="flex flex-col gap-1.5">
            {props.categoryBreakdown.length === 0 && (
              <div className="text-sm text-[color:var(--foreground-muted)] py-2">{t.common.noData}</div>
            )}
            {props.categoryBreakdown.map((c) => {
              const total = c.positive + c.negative;
              const pct = total === 0 ? 0 : Math.round((total / totalCategoryNet) * 100);
              return (
                <div
                  key={c.categoryId}
                  className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/60 px-2.5 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-base shrink-0 leading-none" aria-hidden>
                        {c.emoji}
                      </span>
                      <span className="text-xs font-medium leading-snug truncate">{pick(c)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className="inline-flex items-center gap-1 rounded-md bg-[color:var(--surface-2)] px-1.5 py-0.5 text-[10px] sm:text-xs tabular-nums text-[color:var(--foreground-muted)]"
                        title={`${t.common.stars} / ${t.common.triangles}`}
                      >
                        <span className="text-[color:var(--positive)] font-semibold">+{c.positive}</span>
                        <span className="opacity-50">·</span>
                        <span className="text-[color:var(--negative)] font-semibold">
                          {c.negative > 0 ? `−${c.negative}` : "0"}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "min-w-[2.75rem] rounded-lg border px-2 py-0.5 text-center text-sm font-bold tabular-nums leading-none tracking-tight",
                          c.net > 0 &&
                            "border-[color:color-mix(in_srgb,var(--positive)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--positive)_14%,transparent)] text-[color:var(--positive)]",
                          c.net < 0 &&
                            "border-[color:color-mix(in_srgb,var(--negative)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--negative)_14%,transparent)] text-[color:var(--negative)]",
                          c.net === 0 &&
                            "border-[color:var(--border)] bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)]",
                        )}
                        title={t.common.net}
                        aria-label={`${t.common.net} ${c.net >= 0 ? "+" : ""}${c.net}`}
                      >
                        {c.net > 0 ? "+" : ""}
                        {c.net}
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 mt-1.5 rounded-full bg-[color:var(--surface-2)] overflow-hidden flex">
                    {total > 0 && (
                      <>
                        <div
                          className="h-full bg-[color:var(--positive)] transition-[width] duration-300"
                          style={{ width: `${(c.positive / total) * pct}%` }}
                        />
                        <div
                          className="h-full bg-[color:var(--negative)] transition-[width] duration-300"
                          style={{ width: `${(c.negative / total) * pct}%` }}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {props.heatmap && <YearHeatmap data={props.heatmap} year={props.year} />}

      {/* Recent */}
      <section className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">{t.dashboard.recentEntries}</div>
          <Link
            href={`/checkin?date=${encodeURIComponent(props.selectedDateKey)}`}
            className="text-sm text-[color:var(--primary)] hover:underline"
          >
            {t.dashboard.seeAll} →
          </Link>
        </div>
        <ul className="divide-y divide-[color:var(--border)]">
          {props.recent.length === 0 && (
            <li className="text-sm text-[color:var(--foreground-muted)] py-4">
              {t.common.noData}
            </li>
          )}
          {props.recent.map((r) => (
            <li key={r.id} className="py-2.5 flex items-center gap-3">
              <span
                className={cn(
                  "chip",
                  r.type === "positive" ? "chip-positive" : "chip-negative",
                )}
              >
                {r.type === "positive" ? "☆" : "△"}{" "}
                {r.points >= 0 ? "+" : ""}
                {r.points * r.occurrences}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:truncate break-words sm:break-normal">
                  {r.behavior?.category && (
                    <span className="text-[color:var(--foreground-muted)] mr-1">
                      {r.behavior.category.emoji}{" "}
                      {locale === "zh" ? r.behavior.category.nameZh : r.behavior.category.nameEn}
                    </span>
                  )}
                  {r.behavior
                    ? locale === "zh"
                      ? r.behavior.nameZh
                      : r.behavior.nameEn
                    : "—"}
                </div>
                <div className="text-xs text-[color:var(--foreground-muted)] flex items-center gap-2">
                  <span>{formatDate(new Date(r.date), locale)}</span>
                  {r.createdBy && (
                    <span>
                      {r.createdBy.emoji} {locale === "zh" ? r.createdBy.nameZh : r.createdBy.nameEn}
                    </span>
                  )}
                  {r.occurrences > 1 && <span>×{r.occurrences}</span>}
                  {r.notes && <span className="italic">&ldquo;{r.notes}&rdquo;</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  subtitle,
  accent,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "card p-4 flex flex-col justify-between min-h-[100px]",
        highlight && "relative overflow-hidden",
      )}
      style={
        highlight && accent
          ? {
              background: `linear-gradient(135deg, ${accent}15 0%, transparent 80%)`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-2 text-xs text-[color:var(--foreground-muted)]">
        {icon}
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div
          className="text-2xl font-semibold"
          style={accent && highlight ? { color: accent } : undefined}
        >
          {value > 0 ? "+" : ""}
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[color:var(--foreground-muted)]">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function YearHeatmap({ data, year }: { data: { dateKey: string; net: number }[]; year: number }) {
  const { t } = useI18n();
  // Build a 7 x ~53 grid by week starting Monday.
  const start = new Date(year, 0, 1);
  // align to Monday
  const startWeekday = (start.getDay() + 6) % 7; // 0=Mon..6=Sun
  const gridStart = addDays(start, -startWeekday);
  const cells: { date: Date; net: number }[] = [];
  const map = new Map(data.map((d) => [d.dateKey, d.net]));
  for (let i = 0; i < 53 * 7; i++) {
    const d = addDays(gridStart, i);
    if (d.getFullYear() > year) break;
    cells.push({ date: d, net: map.get(toLocalDateKey(d)) ?? 0 });
  }

  function color(net: number) {
    if (net === 0) return "var(--surface-2)";
    if (net > 0) {
      const intensity = Math.min(1, net / 10);
      return `color-mix(in srgb, var(--positive) ${20 + intensity * 70}%, transparent)`;
    }
    const intensity = Math.min(1, -net / 10);
    return `color-mix(in srgb, var(--negative) ${20 + intensity * 70}%, transparent)`;
  }

  return (
    <section className="card p-4">
      <div className="font-medium mb-3">{t.dashboard.heatmap} · {year}</div>
      <div className="overflow-x-auto -mx-1 px-1 touch-pan-x">
        <div
          className="grid min-h-[88px]"
          style={{
            gridTemplateRows: "repeat(7, minmax(11px, 1fr))",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(11px, 14px)",
            gap: "4px",
          }}
        >
          {cells.map((c, i) => (
            <div
              key={i}
              title={`${toLocalDateKey(c.date)} · ${c.net > 0 ? "+" : ""}${c.net}`}
              style={{ background: color(c.net), borderRadius: 3 }}
              className="w-full h-full min-h-[11px] hover:ring-2 hover:ring-[color:var(--primary)] transition touch-manipulation"
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-[color:var(--foreground-muted)]">
        <span>−</span>
        {[-9, -3, 0, 3, 9].map((v) => (
          <span key={v} className="w-3 h-3 rounded-sm" style={{ background: color(v) }} />
        ))}
        <span>+</span>
      </div>
    </section>
  );
}

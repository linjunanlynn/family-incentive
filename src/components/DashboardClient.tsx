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
import { BarChart2, LineChart as LineChartIcon, PlusCircle, Sparkles, Star, Trophy } from "lucide-react";
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
  /** When false (child account), hide the daily check-in pill (rewards stays visible). */
  showDailyCheckin: boolean;
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
  const heroTheme = props.child.id.toLowerCase().includes("aimee")
    ? "ice-princess"
    : "kaiju";

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
      <OverviewCheckinNav
        mode="overview"
        dateKey={props.selectedDateKey}
        overviewView={props.view}
        showDailyCheckin={props.showDailyCheckin}
      />

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

          <div className="flex justify-center sm:justify-start w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-0.5">
            <DashboardDateNav
              selectedDateKey={props.selectedDateKey}
              onNavigate={(d) => navigate(props.view, d)}
              onShift={shift}
            />
          </div>
        </div>
      </section>

      {/* KPI cards: mobile 2-col — row1 当前积分 full width; row2 本周累计 | 最佳日 */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
        <KpiCard
          className="col-span-2 md:col-span-1 min-w-0"
          icon={<Sparkles className="w-4 h-4" />}
          label={t.dashboard.currentPoints}
          value={props.currentPoints}
          accent={props.child.color}
          heroTheme={heroTheme}
          highlight
        />
        <KpiCard
          className="min-w-0"
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
          className="min-w-0"
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
                        <span className="inline-flex items-center gap-0.5 text-[color:var(--positive)] font-semibold">
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
                          +{c.positive}
                        </span>
                        <span className="opacity-50">·</span>
                        <span className="text-[color:var(--negative)] font-semibold">
                          {c.negative > 0 ? `−${c.negative}` : "0"}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "inline-flex min-w-[2.75rem] items-center justify-center gap-0.5 rounded-lg border px-1.5 py-1 text-center text-sm font-bold tabular-nums leading-none tracking-tight",
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
                        <Star
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            c.net > 0 && "fill-amber-400 text-amber-600",
                            c.net < 0 && "fill-red-100 text-red-400",
                            c.net === 0 && "fill-[color:var(--surface-2)] text-[color:var(--foreground-muted)]",
                          )}
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <span>
                          {c.net > 0 ? "+" : ""}
                          {c.net}
                        </span>
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

function KpiStar({
  value,
  accent,
  size,
}: {
  value: number;
  accent?: string;
  size: "hero" | "md";
}) {
  const showPlus = value > 0;
  const starClass =
    value < 0
      ? "fill-red-100 text-red-400"
      : value === 0
        ? "fill-amber-100/80 text-amber-600/70"
        : "fill-amber-400 text-amber-500";
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Star
        className={cn(
          "shrink-0 drop-shadow-sm",
          size === "hero" ? "h-9 w-9 sm:h-10 sm:w-10" : "h-6 w-6 sm:h-7 sm:w-7",
          starClass,
        )}
        strokeWidth={1.5}
        aria-hidden
      />
      <span
        className={cn(
          "font-bold tabular-nums tracking-tight",
          size === "hero" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-[1.75rem]",
          !accent && "text-[color:var(--foreground)]",
        )}
        style={accent ? { color: accent } : undefined}
      >
        {showPlus ? "+" : ""}
        {value}
      </span>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  subtitle,
  accent,
  heroTheme,
  highlight,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle?: string;
  accent?: string;
  heroTheme?: "kaiju" | "ice-princess";
  highlight?: boolean;
  className?: string;
}) {
  if (highlight && accent) {
    return (
      <div
        className={cn(
          "relative flex min-h-[118px] flex-col justify-between overflow-hidden rounded-[var(--radius)] border-2 p-5",
          "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--border))]",
          "bg-[color:var(--surface)] shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--primary)_45%,transparent),0_0_0_1px_color-mix(in_srgb,var(--primary)_12%,transparent)]",
          className,
        )}
        style={{
          backgroundImage: [
            heroTheme === "ice-princess"
              ? "linear-gradient(145deg, var(--surface) 0%, var(--surface) 100%)"
              : `linear-gradient(145deg, ${accent}18 0%, color-mix(in srgb, #ecfdf5 45%, var(--surface)) 52%, var(--surface) 100%)`,
            heroTheme === "ice-princess"
              ? "radial-gradient(ellipse 70% 62% at 96% 8%, color-mix(in srgb, #7dd3fc 22%, transparent), transparent 58%)"
              : "radial-gradient(ellipse 76% 66% at 96% 12%, color-mix(in srgb, #22c55e 18%, transparent), transparent 58%)",
            "radial-gradient(circle at 10% 92%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 46%)",
          ].join(", "),
        }}
      >
        <ChildHeroBackdrop theme={heroTheme ?? "kaiju"} accent={accent} />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              heroTheme === "ice-princess"
                ? "linear-gradient(100deg, color-mix(in srgb, #fbcfe8 42%, var(--surface)) 0%, color-mix(in srgb, #f9a8d4 24%, var(--surface)) 38%, color-mix(in srgb, #fbcfe8 10%, transparent) 66%, transparent 100%)"
                : "linear-gradient(100deg, color-mix(in srgb, #bfdbfe 42%, var(--surface)) 0%, color-mix(in srgb, #93c5fd 24%, var(--surface)) 36%, color-mix(in srgb, #60a5fa 10%, transparent) 64%, transparent 100%)",
          }}
          aria-hidden
        />
        <Star
          className="pointer-events-none absolute right-4 top-4 z-[2] h-4 w-4 fill-amber-300/45 text-amber-500/50 rotate-[18deg]"
          strokeWidth={1}
          aria-hidden
        />
        <Star
          className="pointer-events-none absolute bottom-10 left-2 z-[2] h-4 w-4 fill-amber-200/40 text-amber-400/50 -rotate-12"
          strokeWidth={1}
          aria-hidden
        />
        <Star
          className="pointer-events-none absolute right-14 top-12 z-[2] h-3 w-3 fill-amber-200/35 text-amber-400/40 rotate-6"
          strokeWidth={1}
          aria-hidden
        />
        <div className="relative z-[3] flex items-center gap-2 text-xs font-medium text-[color:var(--foreground-muted)] min-w-0">
          <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-100/90 p-1 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="min-w-0 truncate">{label}</span>
        </div>
        <div className="relative z-[3] mt-1 flex flex-wrap items-end gap-2 min-w-0">
          <KpiStar value={value} accent={accent} size="hero" />
          {subtitle && (
            <div className="max-w-full min-w-0 text-xs leading-snug text-[color:var(--foreground-muted)] break-words">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "card relative flex min-h-[100px] flex-col justify-between overflow-hidden p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs text-[color:var(--foreground-muted)] min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex flex-wrap items-end gap-2 min-w-0">
        <KpiStar value={value} accent={accent} size="md" />
        {subtitle && (
          <div className="text-xs text-[color:var(--foreground-muted)] min-w-0 break-words">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function ChildHeroBackdrop({
  theme,
  accent,
}: {
  theme: "kaiju" | "ice-princess";
  accent: string;
}) {
  const posterUrl =
    theme === "ice-princess"
      ? "/posters/aimee-elsa-poster.jpg"
      : "/posters/jimmy-godzilla-poster.jpg";

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-[56%] overflow-hidden" aria-hidden>
      {/* Poster slab (cinema style): image bleeds outside card and fades into card color */}
      <div
        className="absolute -right-8 top-1/2 h-[134%] w-[122%] -translate-y-1/2 rounded-l-[2.4rem] blur-[0.45px] opacity-90"
        style={{
          backgroundImage: `url(${posterUrl})`,
          backgroundSize: "cover",
          backgroundPosition: theme === "ice-princess" ? "72% center" : "58% center",
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${accent} 16%, transparent)`,
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 14%, rgba(0,0,0,0.4) 28%, rgba(0,0,0,0.7) 46%, rgba(0,0,0,0.92) 66%, #000 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.12) 14%, rgba(0,0,0,0.4) 28%, rgba(0,0,0,0.7) 46%, rgba(0,0,0,0.92) 66%, #000 100%)",
        }}
      />

      {/* color wash based on theme to avoid hard boundary */}
      <div
        className="absolute inset-y-0 inset-x-0"
        style={{
          background:
            theme === "ice-princess"
              ? "linear-gradient(90deg, color-mix(in srgb, var(--surface) 96%, transparent) 0%, color-mix(in srgb, #e0f2fe 40%, transparent) 38%, color-mix(in srgb, #bae6fd 20%, transparent) 62%, transparent 100%)"
              : "linear-gradient(90deg, color-mix(in srgb, var(--surface) 96%, transparent) 0%, color-mix(in srgb, #dcfce7 34%, transparent) 38%, color-mix(in srgb, #86efac 20%, transparent) 62%, transparent 100%)",
        }}
      />

      {/* right-side bloom to mimic poster glow */}
      <div
        className="absolute -right-8 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            theme === "ice-princess"
              ? "color-mix(in srgb, #7dd3fc 30%, transparent)"
              : `color-mix(in srgb, ${accent} 26%, transparent)`,
        }}
      />
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

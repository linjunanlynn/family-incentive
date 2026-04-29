"use client";

import Link from "next/link";
import { LayoutGrid, ClipboardCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, parseLocalDateKey } from "@/lib/utils";

type View = "week" | "month" | "year";

export function OverviewCheckinNav({
  mode,
  dateKey,
  overviewView = "week",
}: {
  mode: "overview" | "checkin";
  dateKey: string;
  overviewView?: View;
}) {
  const { t, locale } = useI18n();
  const overviewHref = `/?date=${encodeURIComponent(dateKey)}&view=${overviewView}`;
  const checkinHref = `/checkin?date=${encodeURIComponent(dateKey)}`;

  const anchor = parseLocalDateKey(dateKey);
  anchor.setHours(12, 0, 0, 0);
  const dateLabel = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(anchor);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-1">
      <div className="card-2 rounded-full p-1 inline-flex items-center gap-0.5">
        <Link
          href={overviewHref}
          scroll={false}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition-colors",
            mode === "overview"
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
          )}
        >
          <LayoutGrid className="w-4 h-4 shrink-0 opacity-80" />
          {t.nav.periodOverview}
        </Link>
        <Link
          href={checkinHref}
          scroll={false}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-sm font-medium transition-colors",
            mode === "checkin"
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
          )}
        >
          <ClipboardCheck className="w-4 h-4 shrink-0 opacity-80" />
          {t.nav.dailyCheckin}
        </Link>
      </div>
      <span className="text-xs text-[color:var(--foreground-muted)] tabular-nums px-1">
        {dateLabel} · {dateKey}
      </span>
    </div>
  );
}

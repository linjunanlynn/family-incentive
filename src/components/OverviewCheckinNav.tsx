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
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center mb-1 min-w-0">
      <div className="card-2 rounded-full p-1 inline-flex items-center gap-0.5 w-full sm:w-auto min-w-0">
        <Link
          href={overviewHref}
          scroll={false}
          className={cn(
            "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 min-h-11 sm:min-h-9 h-11 sm:h-9 rounded-full text-sm font-medium transition-colors touch-manipulation",
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
            "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 min-h-11 sm:min-h-9 h-11 sm:h-9 rounded-full text-sm font-medium transition-colors touch-manipulation",
            mode === "checkin"
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
          )}
        >
          <ClipboardCheck className="w-4 h-4 shrink-0 opacity-80" />
          {t.nav.dailyCheckin}
        </Link>
      </div>
      <span className="text-xs text-[color:var(--foreground-muted)] tabular-nums px-1 break-all sm:break-normal line-clamp-2 sm:line-clamp-none">
        {dateLabel} · {dateKey}
      </span>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Gift, LayoutGrid, ClipboardCheck } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type View = "week" | "month" | "year";

export function OverviewCheckinNav({
  mode,
  dateKey,
  overviewView = "week",
  showDailyCheckin = true,
}: {
  mode: "overview" | "checkin" | "rewards";
  dateKey: string;
  overviewView?: View;
  /** Hide the check-in tab for child accounts (same rule as the old top bar). */
  showDailyCheckin?: boolean;
}) {
  const { t } = useI18n();
  const overviewHref = `/?date=${encodeURIComponent(dateKey)}&view=${overviewView}`;
  const checkinHref = `/checkin?date=${encodeURIComponent(dateKey)}`;
  const rewardsHref = "/rewards";

  return (
    <div className="mb-1 min-w-0">
      <div className="inline-flex w-full min-w-0 items-center gap-1 sm:w-auto">
        <Link
          href={overviewHref}
          scroll={false}
          className={cn(
            "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 min-h-11 sm:min-h-9 h-11 sm:h-9 rounded-xl text-sm font-medium transition-colors touch-manipulation",
            mode === "overview"
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:color-mix(in_srgb,var(--foreground)_4%,transparent)]",
          )}
        >
          <LayoutGrid className="w-4 h-4 shrink-0 opacity-80" />
          {t.nav.periodOverview}
        </Link>
        {showDailyCheckin ? (
          <Link
            href={checkinHref}
            scroll={false}
            className={cn(
              "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 min-h-11 sm:min-h-9 h-11 sm:h-9 rounded-xl text-sm font-medium transition-colors touch-manipulation",
              mode === "checkin"
                ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
                : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:color-mix(in_srgb,var(--foreground)_4%,transparent)]",
            )}
          >
            <ClipboardCheck className="w-4 h-4 shrink-0 opacity-80" />
            {t.nav.dailyCheckin}
          </Link>
        ) : null}
        <Link
          href={rewardsHref}
          scroll={false}
          className={cn(
            "flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 min-h-11 sm:min-h-9 h-11 sm:h-9 rounded-xl text-sm font-medium transition-colors touch-manipulation",
            mode === "rewards"
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] shadow-sm"
              : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:color-mix(in_srgb,var(--foreground)_4%,transparent)]",
          )}
        >
          <Gift className="w-4 h-4 shrink-0 opacity-80" />
          {t.nav.rewards}
        </Link>
      </div>
    </div>
  );
}

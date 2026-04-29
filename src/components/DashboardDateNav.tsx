"use client";

import { useEffect, useRef, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn, parseLocalDateKey, toLocalDateKey } from "@/lib/utils";

type Props = {
  selectedDateKey: string;
  onNavigate: (d: Date) => void;
  onShift: (dir: -1 | 1) => void;
  /** Root wrapper; default includes w-full for mobile stretch. */
  className?: string;
};

export function DashboardDateNav({ selectedDateKey, onNavigate, onShift, className }: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = parseLocalDateKey(selectedDateKey);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(selected));

  function openPicker() {
    setMonthCursor(startOfMonth(parseLocalDateKey(selectedDateKey)));
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    if (typeof window !== "undefined" && window.innerWidth < 640) return;
    function closeIfOutside(target: EventTarget | null) {
      if (wrapRef.current && target instanceof Node && !wrapRef.current.contains(target)) closePicker();
    }
    function onDocDown(e: MouseEvent) {
      closeIfOutside(e.target);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePicker();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const localeObj = locale === "zh" ? zhCN : enUS;
  /** Anchor date shown on the trigger (not the same as「今天」inside the popover). */
  const anchorLabel = isToday(selected)
    ? `${t.common.today} · ${format(selected, "M/d", { locale: localeObj })}`
    : format(selected, locale === "zh" ? "yyyy/M/d" : "MMM d, yyyy", { locale: localeObj });
  const monthTitle =
    locale === "zh"
      ? format(monthCursor, "yyyy年 M月", { locale: localeObj })
      : format(monthCursor, "MMMM yyyy", { locale: localeObj });

  const monthStart = startOfMonth(monthCursor);
  const monthEnd = endOfMonth(monthCursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekdayOrder = [1, 2, 3, 4, 5, 6, 0] as const;
  const wkLabels = weekdayOrder.map((i) => t.weekdaysShort[i]);

  function pickDay(d: Date) {
    onNavigate(d);
    closePicker();
  }

  function goToday() {
    onNavigate(new Date());
    closePicker();
  }

  const pickerContent = (
    <>
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setMonthCursor((m) => addMonths(m, -1))}
          aria-label={t.common.previous}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-medium text-center flex-1">{monthTitle}</div>
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          onClick={() => setMonthCursor((m) => addMonths(m, 1))}
          aria-label={t.common.next}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] text-[color:var(--foreground-muted)] mb-1">
        {wkLabels.map((wd) => (
          <div key={wd} className="py-1 font-medium">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const inMonth = isSameMonth(day, monthCursor);
          const sel = isSameDay(day, selected);
          const td = isToday(day);
          return (
            <button
              key={toLocalDateKey(day)}
              type="button"
              onClick={() => pickDay(day)}
              className={cn(
                "aspect-square max-h-11 min-h-[2.75rem] sm:max-h-10 sm:min-h-0 rounded-lg text-sm transition-colors touch-manipulation",
                !inMonth && "text-[color:var(--foreground-muted)] opacity-55",
                inMonth && "text-[color:var(--foreground)]",
                "hover:bg-[color:var(--surface-2)]",
                sel &&
                  "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] font-semibold hover:opacity-90",
                td && !sel && "ring-1 ring-inset ring-[color:var(--primary)]/45",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      <div className="divider my-3" />
      <button type="button" className="btn btn-primary w-full" onClick={goToday}>
        {t.common.today}
      </button>
    </>
  );

  return (
    <div
      ref={wrapRef}
      className={cn("relative flex min-w-0 items-center gap-1", className ?? "w-full")}
    >
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => {
          closePicker();
          onShift(-1);
        }}
        aria-label={t.common.previous}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        className={cn(
          "inline-flex min-h-11 sm:min-h-9 flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-[color:var(--border)]",
          "bg-[color:var(--surface)] px-3 text-sm tabular-nums text-[color:var(--foreground)] shadow-sm",
          "hover:bg-[color:var(--surface-2)] active:scale-[0.99] transition touch-manipulation min-w-0",
          open && "ring-2 ring-[color:var(--primary)]/35 border-[color:var(--primary)]/40",
        )}
        onClick={() => (open ? closePicker() : openPicker())}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`${t.checkin.pickDate} · ${selectedDateKey}`}
      >
        <span className="min-w-0 flex-1 truncate text-center sm:max-w-[11rem]">{anchorLabel}</span>
        <CalendarDays className="w-4 h-4 shrink-0 text-[color:var(--foreground-muted)]" aria-hidden />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => {
          closePicker();
          onShift(1);
        }}
        aria-label={t.common.next}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close date picker backdrop"
            className="fixed inset-0 z-[58] bg-black/20 backdrop-blur-[1px] sm:hidden"
            onClick={closePicker}
          />
          <div
            role="dialog"
            aria-label={t.checkin.pickDate}
            className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] z-[60] max-h-[78dvh] overflow-y-auto overscroll-contain sm:hidden card p-3 shadow-lg"
          >
            {pickerContent}
          </div>
          <div
            role="dialog"
            aria-label={t.checkin.pickDate}
            className="hidden sm:block absolute right-0 top-[calc(100%+6px)] z-[60] w-[min(100vw-2rem,320px)] card p-3 shadow-lg"
          >
            {pickerContent}
          </div>
        </>
      )}
    </div>
  );
}

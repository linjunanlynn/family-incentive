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
};

export function DashboardDateNav({ selectedDateKey, onNavigate, onShift }: Props) {
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
    function closeIfOutside(target: EventTarget | null) {
      if (wrapRef.current && target instanceof Node && !wrapRef.current.contains(target)) closePicker();
    }
    function onDocDown(e: MouseEvent) {
      closeIfOutside(e.target);
    }
    function onTouchEnd(e: TouchEvent) {
      closeIfOutside(e.target);
    }
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchend", onTouchEnd);
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

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1">
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
        className="btn btn-ghost gap-1.5"
        onClick={() => (open ? closePicker() : openPicker())}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`${t.checkin.pickDate} · ${selectedDateKey}`}
      >
        <CalendarDays className="w-4 h-4 shrink-0" />
        <span className="ml-1 max-w-[7.5rem] sm:max-w-[10rem] truncate tabular-nums">{anchorLabel}</span>
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
        <div
          role="dialog"
          aria-label={t.checkin.pickDate}
          className="fixed left-3 right-3 top-[max(5.5rem,env(safe-area-inset-top,0px)+4rem)] z-[60] max-h-[min(75dvh,calc(100dvh-7rem))] overflow-y-auto overscroll-contain sm:absolute sm:inset-x-auto sm:left-auto sm:right-0 sm:top-[calc(100%+6px)] sm:max-h-none sm:overflow-visible w-auto sm:w-[min(100vw-2rem,320px)] card p-3 shadow-lg"
        >
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
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trash2, Undo2, MessageSquarePlus, X, Check } from "lucide-react";
import { OverviewCheckinNav } from "@/components/OverviewCheckinNav";
import { useI18n } from "@/i18n/I18nProvider";
import { addDays, cn, formatDate, toLocalDateKey } from "@/lib/utils";
import { deleteLogAction, logBehaviorAction } from "@/app/actions/logs";

type Behavior = {
  id: string;
  nameZh: string;
  nameEn: string;
  type: "positive" | "negative";
  points: number;
};

type Category = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  behaviors: Behavior[];
};

type Log = {
  id: string;
  type: "positive" | "negative";
  points: number;
  occurrences: number;
  notes: string | null;
  createdAt: string;
  behavior: {
    id: string;
    nameZh: string;
    nameEn: string;
    category: { nameZh: string; nameEn: string; emoji: string } | null;
  } | null;
  createdBy: { id: string; nameZh: string; nameEn: string; emoji: string } | null;
};

export function CheckinClient({
  child,
  dateKey,
  categories,
  todayLogs,
  canScore = false,
  showDailyCheckin = true,
}: {
  child: { id: string; nameZh: string; nameEn: string; emoji: string; color: string };
  dateKey: string;
  categories: Category[];
  todayLogs: Log[];
  /** When false (e.g. guest), cards stay read-only: no undo on tiles. */
  canScore?: boolean;
  showDailyCheckin?: boolean;
}) {
  const { t, locale, pick } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const [activeCat, setActiveCat] = useState<string>("all");
  const [noteFor, setNoteFor] = useState<Behavior | null>(null);
  const [noteText, setNoteText] = useState("");

  const loggedBehaviorIds = useMemo(() => {
    const s = new Set<string>();
    for (const l of todayLogs) {
      if (l.behavior?.id) s.add(l.behavior.id);
    }
    return s;
  }, [todayLogs]);

  /** Newest log per behavior (todayLogs is ordered desc by createdAt). */
  const logByBehaviorId = useMemo(() => {
    const m: Record<string, Log> = {};
    for (const l of todayLogs) {
      const bid = l.behavior?.id;
      if (bid && m[bid] === undefined) m[bid] = l;
    }
    return m;
  }, [todayLogs]);

  const todayPoints = useMemo(
    () => todayLogs.reduce((s, l) => s + l.points * l.occurrences, 0),
    [todayLogs],
  );
  const positiveSum = useMemo(
    () => todayLogs.filter((l) => l.type === "positive").reduce((s, l) => s + l.points * l.occurrences, 0),
    [todayLogs],
  );
  const negativeSum = useMemo(
    () => todayLogs.filter((l) => l.type === "negative").reduce((s, l) => s + Math.abs(l.points * l.occurrences), 0),
    [todayLogs],
  );

  function shiftDate(direction: -1 | 1) {
    const d = addDays(new Date(dateKey), direction);
    const params = new URLSearchParams(sp.toString());
    params.set("date", toLocalDateKey(d));
    router.push(`/checkin?${params.toString()}`);
  }

  function gotoDate(d: Date) {
    const params = new URLSearchParams(sp.toString());
    params.set("date", toLocalDateKey(d));
    router.push(`/checkin?${params.toString()}`);
  }

  function tap(b: Behavior, withNote = false) {
    if (loggedBehaviorIds.has(b.id)) {
      toast.error(t.checkin.alreadyLogged);
      return;
    }
    if (withNote) {
      setNoteFor(b);
      setNoteText("");
      return;
    }
    startTransition(async () => {
      const res = await logBehaviorAction({
        childId: child.id,
        behaviorId: b.id,
        dateKey,
      });
      if (res.ok) {
        const sign = res.points >= 0 ? "+" : "";
        toast.success(`${b.type === "positive" ? "☆" : "△"} ${pick(b)} · ${sign}${res.points}`);
        router.refresh();
      } else if (res.error === "already_logged") {
        toast.error(t.checkin.alreadyLogged);
      } else if (res.error === "forbidden") {
        toast.error(t.checkin.noPermission);
      } else {
        toast.error(t.common.failed);
      }
    });
  }

  function submitNote() {
    if (!noteFor) return;
    const b = noteFor;
    const note = noteText;
    startTransition(async () => {
      const res = await logBehaviorAction({
        childId: child.id,
        behaviorId: b.id,
        dateKey,
        notes: note,
      });
      if (res.ok) {
        toast.success(t.common.success);
        setNoteFor(null);
        setNoteText("");
        router.refresh();
      } else if (res.error === "already_logged") {
        toast.error(t.checkin.alreadyLogged);
      } else if (res.error === "forbidden") {
        toast.error(t.checkin.noPermission);
      } else toast.error(t.common.failed);
    });
  }

  function undoLast() {
    const last = todayLogs[0];
    if (!last) return;
    startTransition(async () => {
      const res = await deleteLogAction(last.id);
      if (res.ok) {
        toast.success(t.common.undo + " ✓");
        router.refresh();
      } else toast.error(t.checkin.noPermission);
    });
  }

  function delLog(id: string) {
    startTransition(async () => {
      const res = await deleteLogAction(id);
      if (res.ok) {
        toast.success(t.common.success);
        router.refresh();
      } else toast.error(t.checkin.noPermission);
    });
  }

  const visibleCategories = categories.filter(
    (c) => activeCat === "all" || c.id === activeCat,
  );

  return (
    <div className="space-y-5">
      <OverviewCheckinNav mode="checkin" dateKey={dateKey} showDailyCheckin={showDailyCheckin} />

      {/* Header bar */}
      <section className="card p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl text-2xl inline-flex items-center justify-center shrink-0"
            style={{ background: `${child.color}22`, color: child.color }}
          >
            {child.emoji}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">{pick(child)}</div>
            <div className="text-sm text-[color:var(--foreground-muted)]">{t.checkin.title}</div>
          </div>
        </div>

        <div className="hidden sm:block flex-1 min-w-2" />

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1 w-full sm:w-auto">
          <button
            type="button"
            className="btn btn-ghost btn-icon shrink-0"
            onClick={() => shiftDate(-1)}
            aria-label={`${t.common.previous} · ${t.checkin.title}`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          <input
            type="date"
            value={dateKey}
            onChange={(e) => {
              if (e.target.value) gotoDate(new Date(`${e.target.value}T00:00:00`));
            }}
            className="input max-w-full min-w-0 flex-1 sm:flex-initial sm:max-w-[180px] text-center"
          />
          <button
            type="button"
            className="btn btn-ghost btn-icon shrink-0"
            onClick={() => shiftDate(1)}
            aria-label={`${t.common.next} · ${t.checkin.title}`}
          >
            <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          <button type="button" className="btn btn-ghost shrink-0 min-h-11" onClick={() => gotoDate(new Date())}>
            {t.common.today}
          </button>
        </div>
      </section>

      {/* Today summary */}
      <section className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <div className="text-xs text-[color:var(--foreground-muted)]">{t.common.stars}</div>
          <div className="text-xl font-semibold text-[color:var(--positive)]">+{positiveSum}</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-xs text-[color:var(--foreground-muted)]">{t.common.triangles}</div>
          <div className="text-xl font-semibold text-[color:var(--negative)]">−{negativeSum}</div>
        </div>
        <div className="card p-3 text-center" style={{ background: `linear-gradient(135deg, ${child.color}15, transparent)` }}>
          <div className="text-xs text-[color:var(--foreground-muted)]">{t.checkin.todayPoints}</div>
          <div className="text-xl font-semibold" style={{ color: child.color }}>
            {todayPoints > 0 ? "+" : ""}
            {todayPoints}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1 touch-pan-x [-webkit-overflow-scrolling:touch] min-w-0 w-full sm:flex-1 sm:pb-0">
          <button
            type="button"
            className={cn("chip shrink-0", activeCat === "all" && "bg-[color:var(--surface)] border-[color:var(--primary)] text-[color:var(--foreground)]")}
            onClick={() => setActiveCat("all")}
          >
            {t.checkin.allCategories}
          </button>
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={cn(
                "chip shrink-0 max-w-[85vw] sm:max-w-none",
                activeCat === c.id && "bg-[color:var(--surface)] border-[color:var(--primary)] text-[color:var(--foreground)]",
              )}
              onClick={() => setActiveCat(c.id)}
            >
              <span className="truncate">
                {c.emoji} {pick(c)}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-ghost gap-2 w-full sm:w-auto justify-center shrink-0"
          onClick={undoLast}
          disabled={todayLogs.length === 0}
        >
          <Undo2 className="w-4 h-4" />
          {t.checkin.undoLast}
        </button>
      </section>

      <p className="text-xs text-[color:var(--foreground-muted)]">{t.checkin.tip}</p>

      {/* Categories + behaviors */}
      <section className="space-y-4">
        {visibleCategories.length === 0 && (
          <div className="card p-6 text-center text-[color:var(--foreground-muted)]">{t.checkin.noBehaviors}</div>
        )}
        {visibleCategories.map((cat) => {
          if (cat.behaviors.length === 0) return null;
          const positives = cat.behaviors.filter((b) => b.type === "positive");
          const negatives = cat.behaviors.filter((b) => b.type === "negative");
          return (
            <div key={cat.id} className="card p-4">
              <div className="font-medium mb-3 flex items-center gap-2">
                <span>{cat.emoji}</span>
                <span>{pick(cat)}</span>
              </div>
              {positives.length > 0 && (
                <BehaviorGrid
                  items={positives}
                  onTap={tap}
                  type="positive"
                  logByBehaviorId={logByBehaviorId}
                  onUndoLog={delLog}
                  canScore={canScore}
                />
              )}
              {negatives.length > 0 && (
                <div className="mt-3">
                  <BehaviorGrid
                    items={negatives}
                    onTap={tap}
                    type="negative"
                    logByBehaviorId={logByBehaviorId}
                    onUndoLog={delLog}
                    canScore={canScore}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Today's logs */}
      <section className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium">{t.checkin.tappedToday}</div>
          <div className="text-sm text-[color:var(--foreground-muted)]">
            {todayLogs.length} {t.common.records}
          </div>
        </div>
        <ul className="divide-y divide-[color:var(--border)]">
          {todayLogs.length === 0 && (
            <li className="text-sm text-[color:var(--foreground-muted)] py-4">{t.common.noData}</li>
          )}
          {todayLogs.map((l) => (
            <li key={l.id} className="py-2.5 flex items-center gap-3">
              <span className={cn("chip", l.type === "positive" ? "chip-positive" : "chip-negative")}>
                {l.type === "positive" ? "☆" : "△"} {l.points >= 0 ? "+" : ""}
                {l.points * l.occurrences}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  {l.behavior?.category && (
                    <span className="text-[color:var(--foreground-muted)] mr-1">
                      {l.behavior.category.emoji}{" "}
                      {locale === "zh" ? l.behavior.category.nameZh : l.behavior.category.nameEn}
                    </span>
                  )}
                  {l.behavior ? (locale === "zh" ? l.behavior.nameZh : l.behavior.nameEn) : "—"}
                </div>
                <div className="text-xs text-[color:var(--foreground-muted)] flex items-center gap-2 flex-wrap">
                  <span>{formatDate(new Date(l.createdAt), locale)}</span>
                  {l.createdBy && (
                    <span>
                      {l.createdBy.emoji} {locale === "zh" ? l.createdBy.nameZh : l.createdBy.nameEn}
                    </span>
                  )}
                  {l.occurrences > 1 && <span>×{l.occurrences}</span>}
                  {l.notes && <span className="italic">&ldquo;{l.notes}&rdquo;</span>}
                </div>
              </div>
              <button
                onClick={() => delLog(l.id)}
                className="btn btn-ghost btn-icon"
                aria-label="delete"
                title={t.common.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Note modal */}
      {noteFor && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4"
          onClick={() => setNoteFor(null)}
        >
          <div
            className="card w-full max-w-md max-h-[min(90dvh,calc(100dvh-2rem))] overflow-y-auto p-4 sm:p-5 rounded-t-2xl sm:rounded-[var(--radius)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">{t.checkin.addNote}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setNoteFor(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              className={cn(
                "rounded-xl p-3 text-sm mb-3",
                noteFor.type === "positive" ? "chip-positive" : "chip-negative",
              )}
            >
              {noteFor.type === "positive" ? "☆ " : "△ "}
              {pick(noteFor)} ·{" "}
              {noteFor.type === "positive" ? "+" : "-"}
              {noteFor.points}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t.checkin.noteHint}
              className="input min-h-[100px] resize-y"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn" onClick={() => setNoteFor(null)}>
                {t.common.cancel}
              </button>
              <button className="btn btn-primary" onClick={submitNote}>
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BehaviorGrid({
  items,
  onTap,
  type,
  logByBehaviorId,
  onUndoLog,
  canScore,
}: {
  items: Behavior[];
  onTap: (b: Behavior, withNote?: boolean) => void;
  type: "positive" | "negative";
  logByBehaviorId: Record<string, Log>;
  onUndoLog: (logId: string) => void;
  canScore: boolean;
}) {
  const { pick, t, locale } = useI18n();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-2">
      {items.map((b) => {
        const log = logByBehaviorId[b.id];
        const done = !!log;
        const pts = log ? log.points * log.occurrences : 0;
        const recordedPositive = done && log.type === "positive";

        return (
          <div
            key={b.id}
            className={cn(
              "group relative rounded-xl border p-3 sm:p-3 text-left text-sm transition-colors flex items-start gap-2.5 min-h-[4.25rem] touch-manipulation",
              !done &&
                type === "positive" &&
                "border-[color:color-mix(in_srgb,var(--positive)_30%,transparent)] cursor-pointer hover:bg-[color:color-mix(in_srgb,var(--positive)_8%,transparent)]",
              !done &&
                type === "negative" &&
                "border-[color:color-mix(in_srgb,var(--negative)_30%,transparent)] cursor-pointer hover:bg-[color:color-mix(in_srgb,var(--negative)_8%,transparent)]",
              done &&
                recordedPositive &&
                "border-[color:color-mix(in_srgb,var(--positive)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--positive)_8%,var(--surface-2))] cursor-default",
              done &&
                !recordedPositive &&
                "border-[color:color-mix(in_srgb,var(--negative)_45%,var(--border))] bg-[color:color-mix(in_srgb,var(--negative)_8%,var(--surface-2))] cursor-default",
            )}
            onClick={() => {
              if (!done) onTap(b);
            }}
            role="button"
            aria-disabled={done}
          >
            {canScore && done && log && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUndoLog(log.id);
                }}
                className="absolute top-1.5 right-1.5 z-10 btn btn-ghost btn-icon h-8 w-8 rounded-lg text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                title={t.checkin.undoThisCard}
                aria-label={t.checkin.undoThisCard}
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}
            <span
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold shrink-0",
                done && recordedPositive && "bg-[color:color-mix(in_srgb,var(--positive)_22%,transparent)] text-[color:var(--positive)]",
                done && !recordedPositive && "bg-[color:color-mix(in_srgb,var(--negative)_22%,transparent)] text-[color:var(--negative)]",
                !done && type === "positive" && "bg-[color:color-mix(in_srgb,var(--positive)_20%,transparent)] text-[color:var(--positive)]",
                !done && type === "negative" && "bg-[color:color-mix(in_srgb,var(--negative)_20%,transparent)] text-[color:var(--negative)]",
              )}
            >
              {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : type === "positive" ? "☆" : "△"}
            </span>
            <div className={cn("flex-1 min-w-0", canScore && done && "pr-8")}>
              <div className="leading-snug">{pick(b)}</div>
              {done && log ? (
                <div className="mt-1.5 space-y-1">
                  <div
                    className={cn(
                      "inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg border px-2 py-1 text-xs font-semibold tabular-nums",
                      log.type === "positive"
                        ? "border-[color:color-mix(in_srgb,var(--positive)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--positive)_12%,transparent)] text-[color:var(--positive)]"
                        : "border-[color:color-mix(in_srgb,var(--negative)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--negative)_12%,transparent)] text-[color:var(--negative)]",
                    )}
                  >
                    <span aria-hidden>{log.type === "positive" ? "☆" : "△"}</span>
                    <span>{log.type === "positive" ? t.checkin.labelPositiveScore : t.checkin.labelNegativeScore}</span>
                    <span className="opacity-95">
                      {pts > 0 ? "+" : ""}
                      {pts}
                    </span>
                    {log.occurrences > 1 && (
                      <span className="font-normal opacity-80">×{log.occurrences}</span>
                    )}
                  </div>
                  {log.notes?.trim() && (
                    <div
                      className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)]/80 px-2 py-1.5 text-[11px] leading-snug text-[color:var(--foreground)]"
                      title={log.notes.trim()}
                    >
                      <span className="font-medium text-[color:var(--foreground-muted)]">
                        {t.checkin.recordedNoteLabel}
                        {locale === "zh" ? "：" : ": "}
                      </span>
                      <span className="break-words line-clamp-4">{log.notes.trim()}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-[color:var(--foreground-muted)]">{t.checkin.recordedToday}</div>
                </div>
              ) : (
                <div className="text-xs text-[color:var(--foreground-muted)] mt-1">
                  {type === "positive" ? "+" : "-"}
                  {b.points} pts
                </div>
              )}
            </div>
            {!done && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTap(b, true);
                }}
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 btn btn-ghost btn-icon shrink-0"
                title={t.checkin.addNote}
                aria-label={t.checkin.addNote}
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

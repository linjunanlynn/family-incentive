"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Archive, ArchiveRestore, Check, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { PointsGlyph } from "@/components/PointsGlyph";
import { cn } from "@/lib/utils";
import {
  archiveBehaviorAction,
  archiveCategoryAction,
  createBehaviorAction,
  createCategoryAction,
  deleteBehaviorAction,
  deleteCategoryAction,
  updateBehaviorAction,
  updateCategoryAction,
} from "@/app/actions/config";

type Behavior = {
  id: string;
  nameZh: string;
  nameEn: string;
  type: "positive" | "negative";
  points: number;
  archived: boolean;
};

type Category = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  archived: boolean;
  behaviors: Behavior[];
};

export function ManageClient({
  child,
  categories,
}: {
  child: { id: string; nameZh: string; nameEn: string; emoji: string; color: string };
  categories: Category[];
}) {
  const { t, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [showAddCategory, setShowAddCategory] = useState(false);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl text-2xl inline-flex items-center justify-center"
            style={{ background: `${child.color}22`, color: child.color }}
          >
            {child.emoji}
          </div>
          <div>
            <div className="text-lg font-semibold">{t.manage.title}</div>
            <div className="text-sm text-[color:var(--foreground-muted)]">
              {t.manage.forChild}: {pick(child)}
            </div>
          </div>
        </div>
        <div className="hidden sm:block flex-1 min-w-2" />
        <button type="button" className="btn btn-primary w-full sm:w-auto justify-center" onClick={() => setShowAddCategory(true)}>
          <Plus className="w-4 h-4" />
          {t.manage.addCategory}
        </button>
      </section>

      {showAddCategory && (
        <CategoryForm
          onCancel={() => setShowAddCategory(false)}
          onSubmit={(d) =>
            startTransition(async () => {
              await createCategoryAction({ childId: child.id, ...d });
              toast.success(t.common.success);
              setShowAddCategory(false);
            })
          }
        />
      )}

      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
        {categories.length === 0 && (
          <div className="card p-6 text-[color:var(--foreground-muted)] text-center">
            {t.common.noData}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const { t, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  return (
    <div className={cn("card p-4", category.archived && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        {!editing ? (
          <>
            <div className="text-2xl shrink-0">{category.emoji}</div>
            <div className="flex-1 min-w-0 basis-[min(100%,12rem)]">
              <div className="font-medium break-words">{pick(category)}</div>
              <div className="text-xs text-[color:var(--foreground-muted)]">
                {category.behaviors.length} {t.common.records}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => setEditing(true)} title={t.common.edit}>
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title={category.archived ? t.manage.restore : t.manage.archive}
              onClick={() =>
                startTransition(async () => {
                  await archiveCategoryAction(category.id, !category.archived);
                  toast.success(t.common.success);
                })
              }
            >
              {category.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              title={t.common.delete}
              onClick={() => {
                if (!confirm(t.manage.confirmDelete)) return;
                startTransition(async () => {
                  await deleteCategoryAction(category.id);
                  toast.success(t.manage.categoryDeleted);
                });
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            </div>
          </>
        ) : (
          <CategoryForm
            initial={{ nameZh: category.nameZh, nameEn: category.nameEn, emoji: category.emoji }}
            onCancel={() => setEditing(false)}
            onSubmit={(d) =>
              startTransition(async () => {
                await updateCategoryAction({ id: category.id, ...d });
                toast.success(t.manage.saved);
                setEditing(false);
              })
            }
            inline
          />
        )}
      </div>

      <div className="space-y-1.5">
        {category.behaviors.map((b) => (
          <BehaviorRow key={b.id} behavior={b} />
        ))}
        {category.behaviors.length === 0 && (
          <div className="text-sm text-[color:var(--foreground-muted)] py-2">
            {t.checkin.noBehaviors}
          </div>
        )}
      </div>

      <div className="mt-3">
        {!adding ? (
          <button className="btn btn-ghost gap-2" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4" />
            {t.manage.addBehavior}
          </button>
        ) : (
          <BehaviorForm
            onCancel={() => setAdding(false)}
            onSubmit={(d) =>
              startTransition(async () => {
                await createBehaviorAction({ categoryId: category.id, ...d });
                toast.success(t.common.success);
                setAdding(false);
              })
            }
          />
        )}
      </div>
    </div>
  );
}

function BehaviorRow({ behavior }: { behavior: Behavior }) {
  const { t, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <BehaviorForm
        initial={{
          nameZh: behavior.nameZh,
          nameEn: behavior.nameEn,
          type: behavior.type,
          points: behavior.points,
        }}
        onCancel={() => setEditing(false)}
        onSubmit={(d) =>
          startTransition(async () => {
            await updateBehaviorAction({ id: behavior.id, ...d });
            toast.success(t.manage.saved);
            setEditing(false);
          })
        }
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 flex flex-wrap items-center gap-2 sm:gap-3 text-sm",
        behavior.type === "positive"
          ? "border-[color:color-mix(in_srgb,var(--positive)_25%,transparent)]"
          : "border-[color:color-mix(in_srgb,var(--negative)_25%,transparent)]",
        behavior.archived && "opacity-50",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
          behavior.type === "positive"
            ? "bg-[color:color-mix(in_srgb,var(--positive)_20%,transparent)] text-[color:var(--positive)]"
            : "bg-[color:color-mix(in_srgb,var(--negative)_20%,transparent)] text-[color:var(--negative)]",
        )}
      >
        <PointsGlyph type={behavior.type} size={14} />
      </span>
      <div className="flex-1 min-w-0 basis-[min(100%,14rem)]">
        <div className="break-words sm:truncate">{pick(behavior)}</div>
        <div className="text-xs text-[color:var(--foreground-muted)]">
          {behavior.type === "positive" ? "+" : "-"}
          {behavior.points} {t.common.points}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
      <button type="button" className="btn btn-ghost btn-icon" onClick={() => setEditing(true)}>
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        title={behavior.archived ? t.manage.restore : t.manage.archive}
        onClick={() =>
          startTransition(async () => {
            await archiveBehaviorAction(behavior.id, !behavior.archived);
            toast.success(t.common.success);
          })
        }
      >
        {behavior.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        onClick={() => {
          if (!confirm(t.manage.confirmDelete)) return;
          startTransition(async () => {
            await deleteBehaviorAction(behavior.id);
            toast.success(t.manage.behaviorDeleted);
          });
        }}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      </div>
    </div>
  );
}

function CategoryForm({
  initial,
  onCancel,
  onSubmit,
  inline,
}: {
  initial?: { nameZh: string; nameEn: string; emoji: string };
  onCancel: () => void;
  onSubmit: (data: { nameZh: string; nameEn: string; emoji: string }) => void;
  inline?: boolean;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState(initial?.nameZh ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [emoji, setEmoji] = useState(initial?.emoji ?? "✨");

  function submit() {
    if (!nameZh.trim() || !nameEn.trim()) return;
    onSubmit({ nameZh: nameZh.trim(), nameEn: nameEn.trim(), emoji: emoji.trim() || "✨" });
  }

  return (
    <div className={cn(!inline && "card p-4", "flex flex-wrap items-end gap-2 w-full")}>
      <div className="w-16">
        <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.categoryEmoji}</label>
        <input className="input text-center" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.categoryNameZh}</label>
        <input className="input" value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
      </div>
      <div className="flex-1 min-w-[140px]">
        <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.categoryNameEn}</label>
        <input className="input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={submit}>
        <Check className="w-4 h-4" />
        {t.common.save}
      </button>
      <button className="btn" onClick={onCancel}>
        <X className="w-4 h-4" />
        {t.common.cancel}
      </button>
    </div>
  );
}

function BehaviorForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: { nameZh: string; nameEn: string; type: "positive" | "negative"; points: number };
  onCancel: () => void;
  onSubmit: (data: { nameZh: string; nameEn: string; type: "positive" | "negative"; points: number }) => void;
}) {
  const { t } = useI18n();
  const [nameZh, setNameZh] = useState(initial?.nameZh ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [type, setType] = useState<"positive" | "negative">(initial?.type ?? "positive");
  const [points, setPoints] = useState(initial?.points ?? 1);

  function submit() {
    if (!nameZh.trim() || !nameEn.trim()) return;
    onSubmit({ nameZh: nameZh.trim(), nameEn: nameEn.trim(), type, points });
  }

  return (
    <div className="card-2 p-3 rounded-xl space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="card-2 rounded-full p-1 flex">
          <button
            className={cn(
              "px-3 h-8 rounded-full text-sm",
              type === "positive" ? "bg-[color:var(--surface)] text-[color:var(--positive)]" : "text-[color:var(--foreground-muted)]",
            )}
            onClick={() => setType("positive")}
          >
            ☆ {t.common.positive}
          </button>
          <button
            className={cn(
              "px-3 h-8 rounded-full text-sm",
              type === "negative" ? "bg-[color:var(--surface)] text-[color:var(--negative)]" : "text-[color:var(--foreground-muted)]",
            )}
            onClick={() => setType("negative")}
          >
            △ {t.common.negative}
          </button>
        </div>
        <div className="w-24">
          <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.points}</label>
          <input
            type="number"
            min={1}
            max={20}
            className="input text-center"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value) || 1)}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.behaviorNameZh}</label>
          <input className="input" value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs text-[color:var(--foreground-muted)]">{t.manage.behaviorNameEn}</label>
          <input className="input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn" onClick={onCancel}>
          {t.common.cancel}
        </button>
        <button className="btn btn-primary" onClick={submit}>
          {t.common.save}
        </button>
      </div>
    </div>
  );
}

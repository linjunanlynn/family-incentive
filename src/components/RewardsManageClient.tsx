"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  archiveRewardAction,
  createRewardAction,
  deleteRewardAction,
  updateRewardAction,
} from "@/app/actions/rewards";

type ChildLite = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
};

type RewardRow = {
  id: string;
  childId: string | null;
  nameZh: string;
  nameEn: string;
  descZh: string | null;
  descEn: string | null;
  emoji: string;
  costPoints: number;
  category: string;
  stock: number | null;
  cooldownDays: number | null;
  archived: boolean;
};

type Draft = {
  childId: string | null;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  emoji: string;
  costPoints: number;
  category: string;
  stock: string; // empty = unlimited
  cooldownDays: string; // empty = none
};

const EMPTY_DRAFT: Draft = {
  childId: null,
  nameZh: "",
  nameEn: "",
  descZh: "",
  descEn: "",
  emoji: "🎁",
  costPoints: 20,
  category: "treat",
  stock: "",
  cooldownDays: "",
};

export function RewardsManageClient({
  rewards,
  children_,
}: {
  rewards: RewardRow[];
  children_: ChildLite[];
}) {
  const { t, locale, pick } = useI18n();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const childLabel = (cid: string | null) => {
    if (!cid) return t.rewards.rewardScopeAll;
    const c = children_.find((x) => x.id === cid);
    if (!c) return cid;
    return `${c.emoji} ${locale === "zh" ? c.nameZh : c.nameEn}`;
  };

  const catLabel: Record<string, string> = {
    treat: t.rewards.catTreat,
    privilege: t.rewards.catPrivilege,
    outing: t.rewards.catOuting,
    toy: t.rewards.catToy,
    family: t.rewards.catFamily,
    learning: t.rewards.catLearning,
  };

  function submitCreate(d: Draft) {
    startTransition(async () => {
      const res = await createRewardAction({
        childId: d.childId,
        nameZh: d.nameZh,
        nameEn: d.nameEn,
        descZh: d.descZh,
        descEn: d.descEn,
        emoji: d.emoji,
        costPoints: Number(d.costPoints) || 1,
        category: d.category,
        stock: d.stock === "" ? null : Number(d.stock),
        cooldownDays: d.cooldownDays === "" ? null : Number(d.cooldownDays),
      });
      if (res.ok) {
        toast.success(t.common.success);
        setAdding(false);
        router.refresh();
      } else {
        toast.error(t.common.failed);
      }
    });
  }

  function submitUpdate(id: string, d: Draft) {
    startTransition(async () => {
      const res = await updateRewardAction({
        id,
        childId: d.childId,
        nameZh: d.nameZh,
        nameEn: d.nameEn,
        descZh: d.descZh,
        descEn: d.descEn,
        emoji: d.emoji,
        costPoints: Number(d.costPoints) || 1,
        category: d.category,
        stock: d.stock === "" ? null : Number(d.stock),
        cooldownDays: d.cooldownDays === "" ? null : Number(d.cooldownDays),
      });
      if (res.ok) {
        toast.success(t.manage.saved);
        setEditingId(null);
        router.refresh();
      } else {
        toast.error(t.common.failed);
      }
    });
  }

  function archive(r: RewardRow) {
    startTransition(async () => {
      const res = await archiveRewardAction(r.id, !r.archived);
      if (res.ok) {
        toast.success(t.common.success);
        router.refresh();
      } else toast.error(t.common.failed);
    });
  }

  function remove(r: RewardRow) {
    if (!confirm(t.rewards.confirmDelete)) return;
    startTransition(async () => {
      const res = await deleteRewardAction(r.id);
      if (res.ok) {
        toast.success(t.common.success);
        router.refresh();
      } else toast.error(t.common.failed);
    });
  }

  const grouped = new Map<string, RewardRow[]>();
  for (const r of rewards) {
    const k = r.archived ? "_archived" : r.category;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k)!.push(r);
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center gap-3">
        <Link href="/rewards" className="btn btn-ghost gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t.common.back}
        </Link>
        <div className="min-w-0">
          <div className="text-lg font-semibold">{t.rewards.manageTitle}</div>
          <div className="text-xs text-[color:var(--foreground-muted)]">
            {rewards.length} {t.common.records}
          </div>
        </div>
        <div className="hidden sm:block flex-1 min-w-2" />
        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto justify-center"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-4 h-4" />
          {t.rewards.addReward}
        </button>
      </section>

      {adding && (
        <RewardForm
          mode="create"
          children_={children_}
          onCancel={() => setAdding(false)}
          onSubmit={(d) => submitCreate(d)}
        />
      )}

      {/* Grouped by category */}
      {Array.from(grouped.entries()).map(([key, list]) => (
        <section key={key} className="space-y-2">
          <div className="text-sm font-semibold text-[color:var(--foreground-muted)] uppercase tracking-wide flex items-center gap-2">
            {key === "_archived" ? "🗄  Archived" : `${categoryEmoji(key)}  ${catLabel[key] ?? key}`}
            <span className="text-xs font-normal">({list.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {list.map((r) =>
              editingId === r.id ? (
                <RewardForm
                  key={r.id}
                  mode="edit"
                  children_={children_}
                  initial={{
                    childId: r.childId,
                    nameZh: r.nameZh,
                    nameEn: r.nameEn,
                    descZh: r.descZh ?? "",
                    descEn: r.descEn ?? "",
                    emoji: r.emoji,
                    costPoints: r.costPoints,
                    category: r.category,
                    stock: r.stock == null ? "" : String(r.stock),
                    cooldownDays:
                      r.cooldownDays == null ? "" : String(r.cooldownDays),
                  }}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(d) => submitUpdate(r.id, d)}
                />
              ) : (
                <article
                  key={r.id}
                  className={cn(
                    "card p-4 flex flex-col gap-2 min-h-[160px]",
                    r.archived && "opacity-60",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="text-3xl shrink-0 leading-none"
                      aria-hidden
                    >
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold leading-snug break-words">
                        {pick(r)}
                      </div>
                      <div className="text-xs text-[color:var(--foreground-muted)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="inline-flex items-center gap-0.5 font-semibold text-amber-700">
                          <Star
                            className="w-3 h-3 fill-amber-400 text-amber-500"
                            strokeWidth={1.5}
                            aria-hidden
                          />
                          {r.costPoints}
                        </span>
                        <span>·</span>
                        <span>{childLabel(r.childId)}</span>
                        {r.stock != null && (
                          <span>
                            ·{" "}
                            {r.stock === 0
                              ? t.rewards.outOfStock
                              : t.rewards.stockLeft(r.stock)}
                          </span>
                        )}
                        {r.cooldownDays && r.cooldownDays > 0 && (
                          <span>· {t.rewards.cooldownDays(r.cooldownDays)}</span>
                        )}
                      </div>
                      {pick({
                        nameZh: r.descZh ?? "",
                        nameEn: r.descEn ?? "",
                      }) && (
                        <p className="text-xs text-[color:var(--foreground-muted)] mt-1.5 line-clamp-3">
                          {pick({
                            nameZh: r.descZh ?? "",
                            nameEn: r.descEn ?? "",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-end gap-1">
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => setEditingId(r.id)}
                      title={t.common.edit}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => archive(r)}
                      title={r.archived ? t.rewards.restore : t.rewards.archive}
                    >
                      {r.archived ? (
                        <ArchiveRestore className="w-4 h-4" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => remove(r)}
                      title={t.rewards.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      ))}

      {rewards.length === 0 && (
        <div className="card p-8 text-center text-[color:var(--foreground-muted)]">
          {t.rewards.catalogEmpty}
        </div>
      )}
    </div>
  );
}

function categoryEmoji(c: string) {
  switch (c) {
    case "treat":
      return "🍦";
    case "privilege":
      return "🎮";
    case "outing":
      return "🌳";
    case "toy":
      return "🧸";
    case "family":
      return "👨‍👩‍👧‍👦";
    case "learning":
      return "📚";
    default:
      return "🎁";
  }
}

function RewardForm({
  mode,
  initial,
  children_,
  onCancel,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Draft;
  children_: ChildLite[];
  onCancel: () => void;
  onSubmit: (d: Draft) => void;
}) {
  const { t, locale } = useI18n();
  const [d, setD] = useState<Draft>(initial ?? EMPTY_DRAFT);
  const cats: { key: string; label: string; emoji: string }[] = [
    { key: "treat", label: t.rewards.catTreat, emoji: "🍦" },
    { key: "privilege", label: t.rewards.catPrivilege, emoji: "🎮" },
    { key: "outing", label: t.rewards.catOuting, emoji: "🌳" },
    { key: "family", label: t.rewards.catFamily, emoji: "👨‍👩‍👧‍👦" },
    { key: "toy", label: t.rewards.catToy, emoji: "🧸" },
    { key: "learning", label: t.rewards.catLearning, emoji: "📚" },
  ];

  function patch(partial: Partial<Draft>) {
    setD((cur) => ({ ...cur, ...partial }));
  }

  function submit() {
    if (!d.nameZh.trim() || !d.nameEn.trim()) {
      return;
    }
    onSubmit({
      ...d,
      nameZh: d.nameZh.trim(),
      nameEn: d.nameEn.trim(),
      descZh: d.descZh.trim(),
      descEn: d.descEn.trim(),
      emoji: d.emoji.trim() || "🎁",
    });
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="font-medium">
        {mode === "create" ? t.rewards.addReward : t.rewards.editReward}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[5rem_1fr_1fr] gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardEmoji}
          </label>
          <input
            className="input text-center text-xl"
            value={d.emoji}
            onChange={(e) => patch({ emoji: e.target.value })}
            maxLength={4}
          />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardNameZh}
          </label>
          <input
            className="input"
            value={d.nameZh}
            onChange={(e) => patch({ nameZh: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardNameEn}
          </label>
          <input
            className="input"
            value={d.nameEn}
            onChange={(e) => patch({ nameEn: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardDescZh}
          </label>
          <input
            className="input"
            value={d.descZh}
            onChange={(e) => patch({ descZh: e.target.value })}
            placeholder="例如：周五电影夜，由你来选片"
          />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardDescEn}
          </label>
          <input
            className="input"
            value={d.descEn}
            onChange={(e) => patch({ descEn: e.target.value })}
            placeholder="e.g. Friday movie night, you pick"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardCost}
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            className="input text-center"
            value={d.costPoints}
            onChange={(e) => patch({ costPoints: Number(e.target.value) || 1 })}
          />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardStock}
          </label>
          <input
            type="number"
            min={0}
            placeholder={t.rewards.rewardStockUnlimited}
            className="input text-center"
            value={d.stock}
            onChange={(e) => patch({ stock: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardCooldown}
          </label>
          <input
            type="number"
            min={0}
            placeholder={t.rewards.rewardCooldownNone}
            className="input text-center"
            value={d.cooldownDays}
            onChange={(e) => patch({ cooldownDays: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-[color:var(--foreground-muted)]">
            {t.rewards.rewardScope}
          </label>
          <select
            className="input"
            value={d.childId ?? ""}
            onChange={(e) =>
              patch({ childId: e.target.value === "" ? null : e.target.value })
            }
          >
            <option value="">{t.rewards.rewardScopeAll}</option>
            {children_.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {locale === "zh" ? c.nameZh : c.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-[color:var(--foreground-muted)]">
          {t.rewards.rewardCategory}
        </label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {cats.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => patch({ category: c.key })}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full border text-xs font-medium",
                d.category === c.key
                  ? "bg-[color:var(--surface)] border-[color:var(--primary)] text-[color:var(--foreground)] shadow-sm"
                  : "bg-[color:var(--surface-2)] border-transparent text-[color:var(--foreground-muted)]",
              )}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button className="btn" onClick={onCancel}>
          <X className="w-4 h-4" />
          {t.common.cancel}
        </button>
        <button className="btn btn-primary" onClick={submit}>
          <Check className="w-4 h-4" />
          {t.common.save}
        </button>
      </div>
    </div>
  );
}

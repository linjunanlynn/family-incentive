"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Check,
  Clock,
  Gift,
  Lock,
  Settings,
  Sparkles,
  Star,
  Undo2,
  X,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";
import {
  approveRedemptionAction,
  cancelRedemptionAction,
  fulfillRedemptionAction,
  rejectRedemptionAction,
  requestRedemptionAction,
} from "@/app/actions/rewards";

type RewardLite = {
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
};

type RedemptionStatus =
  | "pending"
  | "approved"
  | "fulfilled"
  | "rejected"
  | "cancelled";

type MyRedemption = {
  id: string;
  status: RedemptionStatus;
  costPoints: number;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  fulfilledAt: string | null;
  reward: {
    id: string;
    nameZh: string;
    nameEn: string;
    emoji: string;
    category: string;
  };
  requestedBy: { nameZh: string; nameEn: string; emoji: string } | null;
  reviewedBy: { nameZh: string; nameEn: string; emoji: string } | null;
};

type InboxRow = {
  id: string;
  status: "pending" | "approved";
  costPoints: number;
  notes: string | null;
  createdAt: string;
  reward: {
    id: string;
    nameZh: string;
    nameEn: string;
    emoji: string;
    costPoints: number;
  };
  child: { id: string; nameZh: string; nameEn: string; emoji: string; color: string };
  requestedBy: { nameZh: string; nameEn: string; emoji: string } | null;
  reviewedBy: { nameZh: string; nameEn: string; emoji: string } | null;
};

type Wallet = {
  earned: number;
  spent: number;
  pending: number;
  available: number;
};

const CATEGORY_ORDER: { key: string; emoji: string }[] = [
  { key: "all", emoji: "✨" },
  { key: "treat", emoji: "🍦" },
  { key: "privilege", emoji: "🎮" },
  { key: "outing", emoji: "🌳" },
  { key: "family", emoji: "👨‍👩‍👧‍👦" },
  { key: "toy", emoji: "🧸" },
  { key: "learning", emoji: "📚" },
];

export function RewardsClient({
  child,
  wallet,
  rewards,
  myRedemptions,
  pendingInbox,
  canApprove,
  canRequestRedemption,
  isAdmin,
}: {
  child: { id: string; nameZh: string; nameEn: string; emoji: string; color: string };
  wallet: Wallet;
  rewards: RewardLite[];
  myRedemptions: MyRedemption[];
  pendingInbox: InboxRow[];
  canApprove: boolean;
  /** Guests may browse catalog + points but cannot submit redemptions. */
  canRequestRedemption: boolean;
  isAdmin: boolean;
}) {
  const { t, locale, pick } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const loginHref = `/login?from=${encodeURIComponent(pathname || "/rewards")}`;
  const [, startTransition] = useTransition();
  const [activeCat, setActiveCat] = useState<string>("all");
  const [confirmFor, setConfirmFor] = useState<RewardLite | null>(null);
  const [confirmNote, setConfirmNote] = useState("");

  const catLabel: Record<string, string> = {
    all: t.rewards.tabAll,
    treat: t.rewards.catTreat,
    privilege: t.rewards.catPrivilege,
    outing: t.rewards.catOuting,
    toy: t.rewards.catToy,
    family: t.rewards.catFamily,
    learning: t.rewards.catLearning,
  };

  const visibleRewards = useMemo(
    () =>
      activeCat === "all"
        ? rewards
        : rewards.filter((r) => r.category === activeCat),
    [activeCat, rewards],
  );

  const sortedRewards = useMemo(() => {
    return [...visibleRewards].sort((a, b) => {
      const aff = (r: RewardLite) =>
        r.stock !== null && r.stock <= 0
          ? 2 // out of stock last
          : wallet.available >= r.costPoints
            ? 0
            : 1;
      return aff(a) - aff(b) || a.costPoints - b.costPoints;
    });
  }, [visibleRewards, wallet.available]);

  const cheapestUnaffordable = useMemo(() => {
    const above = rewards
      .filter((r) => wallet.available < r.costPoints)
      .sort((a, b) => a.costPoints - b.costPoints)[0];
    return above ?? null;
  }, [rewards, wallet.available]);

  function openConfirm(r: RewardLite) {
    if (!canRequestRedemption) {
      toast.info(t.rewards.mustLoginToRequest, {
        description: t.rewards.browseOnlyFoot,
        action: {
          label: t.auth.logIn,
          onClick: () => router.push(loginHref),
        },
      });
      return;
    }
    if (wallet.available < r.costPoints) {
      toast.error(t.rewards.insufficient);
      return;
    }
    if (r.stock !== null && r.stock <= 0) {
      toast.error(t.rewards.outOfStock);
      return;
    }
    setConfirmFor(r);
    setConfirmNote("");
  }

  function submitRedeem() {
    const r = confirmFor;
    if (!r) return;
    startTransition(async () => {
      const res = await requestRedemptionAction({
        rewardId: r.id,
        childId: child.id,
        notes: confirmNote,
      });
      if (res.ok) {
        toast.success(t.rewards.submitted, { description: t.rewards.submittedHint });
        setConfirmFor(null);
        setConfirmNote("");
        router.refresh();
      } else if (res.error === "insufficient") {
        toast.error(t.rewards.insufficient);
      } else if (res.error === "out_of_stock") {
        toast.error(t.rewards.outOfStock);
      } else if (res.error === "cooldown") {
        toast.error(t.rewards.cooldownActive);
      } else if (res.error === "forbidden") {
        toast.error(t.rewards.forbidden);
      } else {
        toast.error(t.common.failed);
      }
    });
  }

  function cancelMine(id: string) {
    startTransition(async () => {
      const res = await cancelRedemptionAction(id);
      if (res.ok) {
        toast.success(t.common.success);
        router.refresh();
      } else toast.error(t.common.failed);
    });
  }

  return (
    <div className="space-y-5">
      {!canRequestRedemption && (
        <div
          className="card p-4 sm:p-5 border-2"
          style={{
            borderColor: "color-mix(in srgb, var(--primary) 28%, var(--border))",
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--surface)) 0%, var(--surface) 100%)",
          }}
        >
          <div className="font-semibold text-sm sm:text-base flex flex-wrap items-center gap-2">
            <Lock className="w-4 h-4 text-[color:var(--primary)] shrink-0" aria-hidden />
            {t.rewards.browseOnlyTitle}
          </div>
          <p className="text-sm text-[color:var(--foreground-muted)] mt-2 leading-relaxed">
            {t.rewards.browseOnlyBody}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={loginHref} className="btn btn-primary">
              {t.auth.logIn}
            </Link>
          </div>
        </div>
      )}

      {/* Hero wallet */}
      <WalletHero
        child={child}
        wallet={wallet}
        nextGoal={cheapestUnaffordable}
        rightSlot={
          isAdmin ? (
            <Link
              href="/rewards/manage"
              className="btn btn-ghost gap-1.5 text-sm shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.manageRewards}</span>
            </Link>
          ) : null
        }
      />

      {/* Category strip */}
      <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1 touch-pan-x [-webkit-overflow-scrolling:touch] min-w-0">
        {CATEGORY_ORDER.map((c) => {
          const count =
            c.key === "all"
              ? rewards.length
              : rewards.filter((r) => r.category === c.key).length;
          if (c.key !== "all" && count === 0) return null;
          const active = activeCat === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveCat(c.key)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 px-3.5 min-h-11 sm:min-h-9 rounded-full border text-sm font-medium transition-colors touch-manipulation",
                active
                  ? "bg-[color:var(--surface)] border-[color:var(--primary)] text-[color:var(--foreground)] shadow-sm"
                  : "bg-[color:var(--surface-2)] border-transparent text-[color:var(--foreground-muted)]",
              )}
            >
              <span aria-hidden>{c.emoji}</span>
              <span>{catLabel[c.key]}</span>
              <span
                className={cn(
                  "ml-0.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full text-[10px] tabular-nums",
                  active
                    ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                    : "bg-[color:var(--surface)] text-[color:var(--foreground-muted)]",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reward grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedRewards.length === 0 && (
          <div className="card p-8 text-center text-[color:var(--foreground-muted)] sm:col-span-2 lg:col-span-3">
            <Gift className="w-10 h-10 mx-auto mb-2 opacity-60" />
            {t.rewards.catalogEmpty}
          </div>
        )}
        {sortedRewards.map((r) => (
          <RewardCard
            key={r.id}
            reward={r}
            wallet={wallet}
            childColor={child.color}
            browseOnly={!canRequestRedemption}
            loginHref={loginHref}
            onTap={() => openConfirm(r)}
            ctaLabel={canApprove ? t.rewards.requestForKid : t.rewards.redeem}
            disabledHint={
              r.stock !== null && r.stock <= 0
                ? t.rewards.outOfStock
                : null
            }
          />
        ))}
      </section>

      {/* Parent inbox */}
      {canApprove && pendingInbox.length > 0 && (
        <ParentInbox
          rows={pendingInbox}
          onAction={() => router.refresh()}
        />
      )}

      {/* Recent redemptions */}
      <section className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t.rewards.historyTitle}
          </div>
          <div className="text-xs text-[color:var(--foreground-muted)]">
            {myRedemptions.length} {t.common.records}
          </div>
        </div>
        <ul className="divide-y divide-[color:var(--border)]">
          {myRedemptions.length === 0 && (
            <li className="text-sm text-[color:var(--foreground-muted)] py-4">
              {!canRequestRedemption ? t.rewards.historyLoginHint : t.common.noData}
            </li>
          )}
          {myRedemptions.map((r) => (
            <li key={r.id} className="py-3 flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl text-xl inline-flex items-center justify-center shrink-0"
                style={{
                  background: `${child.color}18`,
                }}
              >
                {r.reward.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium break-words">
                  {locale === "zh" ? r.reward.nameZh : r.reward.nameEn}
                </div>
                <div className="text-xs text-[color:var(--foreground-muted)] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <StatusPill status={r.status} />
                  <span className="inline-flex items-center gap-0.5 text-[color:var(--foreground)] font-semibold">
                    <Star
                      className="w-3 h-3 fill-amber-400 text-amber-500"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    −{r.costPoints}
                  </span>
                  <span>
                    {new Date(r.createdAt).toLocaleString(
                      locale === "zh" ? "zh-CN" : "en-US",
                      { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
                    )}
                  </span>
                  {r.requestedBy && (
                    <span>
                      {r.requestedBy.emoji}{" "}
                      {locale === "zh" ? r.requestedBy.nameZh : r.requestedBy.nameEn}
                    </span>
                  )}
                </div>
                {r.notes && (
                  <div className="text-xs mt-1 italic text-[color:var(--foreground-muted)] break-words">
                    &ldquo;{r.notes}&rdquo;
                  </div>
                )}
              </div>
              {r.status === "pending" && (
                <button
                  type="button"
                  onClick={() => cancelMine(r.id)}
                  className="btn btn-ghost btn-icon shrink-0"
                  title={t.rewards.cancelMine}
                  aria-label={t.rewards.cancelMine}
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Confirm modal */}
      {confirmFor && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center px-3 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4"
          onClick={() => setConfirmFor(null)}
        >
          <div
            className="card w-full max-w-md max-h-[min(92dvh,calc(100dvh-2rem))] overflow-y-auto p-5 rounded-t-3xl sm:rounded-[var(--radius)] animate-pop"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage: `linear-gradient(180deg, ${child.color}10, transparent 38%)`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-base">{t.rewards.confirmTitle}</div>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setConfirmFor(null)}
                aria-label={t.common.cancel}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center gap-2 my-2">
              <div className="text-6xl leading-none animate-pop" aria-hidden>
                {confirmFor.emoji}
              </div>
              <div className="text-lg font-semibold leading-tight">
                {pick(confirmFor)}
              </div>
              {pick({ nameZh: confirmFor.descZh ?? "", nameEn: confirmFor.descEn ?? "" }) && (
                <div className="text-sm text-[color:var(--foreground-muted)] max-w-sm">
                  {pick({
                    nameZh: confirmFor.descZh ?? "",
                    nameEn: confirmFor.descEn ?? "",
                  })}
                </div>
              )}
              <div
                className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-full bg-amber-100/80 text-amber-700 font-bold tabular-nums"
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-600" strokeWidth={1.5} aria-hidden />
                −{confirmFor.costPoints}
              </div>
              <div className="text-xs text-[color:var(--foreground-muted)] mt-1">
                {t.rewards.confirmBody(confirmFor.costPoints)}
              </div>
            </div>

            <label className="block text-xs text-[color:var(--foreground-muted)] mt-3 mb-1">
              {t.rewards.addNote}
            </label>
            <textarea
              value={confirmNote}
              onChange={(e) => setConfirmNote(e.target.value)}
              placeholder={t.rewards.notePlaceholder}
              className="input min-h-[88px] resize-y"
              maxLength={200}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmFor(null)}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitRedeem}
              >
                <Sparkles className="w-4 h-4" />
                {t.rewards.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WalletHero({
  child,
  wallet,
  nextGoal,
  rightSlot,
}: {
  child: { id: string; nameZh: string; nameEn: string; emoji: string; color: string };
  wallet: Wallet;
  nextGoal: RewardLite | null;
  rightSlot?: React.ReactNode;
}) {
  const { t, pick } = useI18n();
  const goalPct =
    nextGoal && nextGoal.costPoints > 0
      ? Math.max(0, Math.min(100, Math.round((wallet.available / nextGoal.costPoints) * 100)))
      : 100;

  return (
    <section
      className="relative card overflow-hidden p-4 sm:p-5"
      style={{
        backgroundImage: [
          `radial-gradient(ellipse 80% 70% at 110% -10%, ${child.color}38, transparent 60%)`,
          `radial-gradient(ellipse 70% 60% at -10% 110%, color-mix(in srgb, ${child.color} 22%, transparent), transparent 60%)`,
          `linear-gradient(140deg, color-mix(in srgb, ${child.color} 12%, var(--surface)) 0%, var(--surface) 50%)`,
        ].join(", "),
      }}
    >
      <div className="flex flex-wrap items-start gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-14 h-14 rounded-2xl text-3xl inline-flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: `${child.color}26`, color: child.color }}
          >
            {child.emoji}
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-semibold flex flex-wrap items-center gap-2">
              <span className="truncate">{pick(child)}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)] shrink-0">
                {t.rewards.shopTitle}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-[color:var(--foreground-muted)]">
              {t.rewards.shopSubtitle}
            </div>
          </div>
        </div>
        {rightSlot}
      </div>

      {/* Big star wallet */}
      <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-3">
        <div className="flex items-center gap-2 min-w-0">
          <Star
            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 fill-amber-400 text-amber-500 drop-shadow-sm animate-pop"
            strokeWidth={1.5}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-[color:var(--foreground-muted)] font-semibold">
              {t.rewards.available}
            </div>
            <div
              className="text-4xl sm:text-5xl font-extrabold tabular-nums leading-none tracking-tight"
              style={{ color: child.color }}
            >
              {wallet.available}
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-1 text-xs text-[color:var(--foreground-muted)] tabular-nums">
          <div className="flex items-center gap-1.5">
            <dt>{t.rewards.earned}</dt>
            <dd className="font-semibold text-[color:var(--foreground)]">
              {wallet.earned}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt>{t.rewards.spent}</dt>
            <dd className="font-semibold text-[color:var(--foreground)]">
              −{wallet.spent}
            </dd>
          </div>
          {wallet.pending > 0 && (
            <div className="col-span-2 flex items-center gap-1.5">
              <Clock className="w-3 h-3" aria-hidden />
              <dt>{t.rewards.pending}</dt>
              <dd className="font-semibold text-[color:var(--foreground)]">
                {wallet.pending}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Next-goal progress */}
      {nextGoal ? (
        <div className="mt-4 rounded-2xl bg-[color:var(--surface)]/70 border border-[color:var(--border)] p-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0" aria-hidden>
              {nextGoal.emoji}
            </span>
            <div className="text-xs sm:text-sm min-w-0 flex-1">
              <div className="font-medium truncate">{pick(nextGoal)}</div>
              <div className="text-[11px] text-[color:var(--foreground-muted)] flex items-center gap-1">
                {t.rewards.saveTip(Math.max(0, nextGoal.costPoints - wallet.available))}
              </div>
            </div>
            <div className="text-xs font-semibold tabular-nums shrink-0">
              {wallet.available} / {nextGoal.costPoints}
            </div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${goalPct}%`,
                background: `linear-gradient(90deg, ${child.color}, color-mix(in srgb, ${child.color} 60%, #fbbf24))`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 text-xs text-[color:var(--foreground-muted)]">
          🎉 你已经能换走目录里的所有奖励啦！/ You can already afford anything!
        </div>
      )}
    </section>
  );
}

function RewardCard({
  reward,
  wallet,
  childColor,
  browseOnly,
  loginHref,
  onTap,
  ctaLabel,
  disabledHint,
}: {
  reward: RewardLite;
  wallet: Wallet;
  childColor: string;
  browseOnly: boolean;
  loginHref: string;
  onTap: () => void;
  ctaLabel: string;
  disabledHint: string | null;
}) {
  const { t, pick } = useI18n();
  const affordable = wallet.available >= reward.costPoints;
  const outOfStock = reward.stock !== null && reward.stock <= 0;
  const isLocked = !affordable || outOfStock;
  const need = Math.max(0, reward.costPoints - wallet.available);
  const pct = Math.max(
    4,
    Math.min(100, Math.round((wallet.available / reward.costPoints) * 100)),
  );

  const cardClass = cn(
    "card p-4 text-left flex flex-col gap-3 min-h-[200px] relative overflow-hidden",
    !browseOnly && "transition-transform touch-manipulation active:scale-[0.99]",
    isLocked && "opacity-90",
    outOfStock && "cursor-not-allowed opacity-60",
    browseOnly && !outOfStock && "cursor-default",
  );
  const bgStyle =
    affordable && !browseOnly
      ? `radial-gradient(ellipse 80% 60% at 110% -10%, ${childColor}1a, transparent 60%)`
      : affordable && browseOnly
        ? `radial-gradient(ellipse 80% 60% at 110% -10%, ${childColor}0d, transparent 60%)`
        : undefined;

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={outOfStock}
      className={cardClass}
      style={{
        backgroundImage: bgStyle,
      }}
    >
      {/* badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {reward.childId && (
            <span
              className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${childColor}1f`, color: childColor }}
            >
              {t.rewards.onlyForChild}
            </span>
          )}
          {!reward.childId && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)]">
              {t.rewards.sharedReward}
            </span>
          )}
          {reward.stock !== null && reward.stock > 0 && reward.stock <= 5 && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {t.rewards.stockLeft(reward.stock)}
            </span>
          )}
          {reward.cooldownDays && reward.cooldownDays > 0 && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)]">
              {t.rewards.cooldownDays(reward.cooldownDays)}
            </span>
          )}
        </div>
        <div
          className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-sm font-bold tabular-nums shrink-0"
          style={{
            background: affordable ? "rgba(251,191,36,0.18)" : "var(--surface-2)",
            color: affordable ? "#b45309" : "var(--foreground-muted)",
          }}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5",
              affordable ? "fill-amber-400 text-amber-500" : "fill-slate-200 text-slate-400",
            )}
            strokeWidth={1.5}
            aria-hidden
          />
          {reward.costPoints}
        </div>
      </div>

      {/* emoji + name */}
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "text-4xl sm:text-5xl shrink-0 leading-none transition-transform",
            !isLocked && "drop-shadow-sm",
            isLocked && "grayscale opacity-80",
          )}
          aria-hidden
        >
          {reward.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm sm:text-base leading-snug break-words">
            {pick(reward)}
          </div>
          {pick({
            nameZh: reward.descZh ?? "",
            nameEn: reward.descEn ?? "",
          }) && (
            <div className="text-xs text-[color:var(--foreground-muted)] mt-1 line-clamp-2">
              {pick({
                nameZh: reward.descZh ?? "",
                nameEn: reward.descEn ?? "",
              })}
            </div>
          )}
        </div>
      </div>

      {/* footer: progress / cta */}
      <div className="mt-auto space-y-2">
        {isLocked && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--foreground-muted)]">
              <Lock className="w-3 h-3" />
              {disabledHint ? (
                <span>{disabledHint}</span>
              ) : (
                <span>
                  {t.rewards.needMore}{" "}
                  <span className="font-bold text-[color:var(--foreground)]">{need}</span>{" "}
                  {t.rewards.starUnit}
                </span>
              )}
            </div>
            {!outOfStock && (
              <div className="h-1.5 rounded-full bg-[color:var(--surface-2)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${childColor}88, ${childColor})`,
                  }}
                />
              </div>
            )}
          </div>
        )}
        {browseOnly && !outOfStock && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/80 p-2.5 text-center space-y-2 pointer-events-auto">
            <Link
              href={loginHref}
              className="btn btn-primary w-full justify-center text-sm min-h-11"
              onClick={(e) => e.stopPropagation()}
            >
              {t.auth.logIn}
            </Link>
            <p className="text-[11px] leading-snug text-[color:var(--foreground-muted)]">
              {t.rewards.browseOnlyFoot}
            </p>
          </div>
        )}
        {!browseOnly && !isLocked && (
          <div
            className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-semibold text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${childColor}, color-mix(in srgb, ${childColor} 70%, #f59e0b))`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            {ctaLabel}
          </div>
        )}
      </div>
    </button>
  );
}

function StatusPill({ status }: { status: RedemptionStatus }) {
  const { t } = useI18n();
  const cfg: Record<
    RedemptionStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    pending: {
      label: t.rewards.statusPending,
      className: "bg-amber-100 text-amber-700",
      icon: <Clock className="w-3 h-3" />,
    },
    approved: {
      label: t.rewards.statusApproved,
      className:
        "bg-[color:color-mix(in_srgb,var(--positive)_18%,transparent)] text-[color:var(--positive)]",
      icon: <Check className="w-3 h-3" />,
    },
    fulfilled: {
      label: t.rewards.statusFulfilled,
      className:
        "bg-[color:color-mix(in_srgb,var(--primary)_18%,transparent)] text-[color:var(--primary)]",
      icon: <Sparkles className="w-3 h-3" />,
    },
    rejected: {
      label: t.rewards.statusRejected,
      className:
        "bg-[color:color-mix(in_srgb,var(--negative)_18%,transparent)] text-[color:var(--negative)]",
      icon: <X className="w-3 h-3" />,
    },
    cancelled: {
      label: t.rewards.statusCancelled,
      className: "bg-[color:var(--surface-2)] text-[color:var(--foreground-muted)]",
      icon: <Undo2 className="w-3 h-3" />,
    },
  };
  const c = cfg[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        c.className,
      )}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

function ParentInbox({
  rows,
  onAction,
}: {
  rows: InboxRow[];
  onAction: () => void;
}) {
  const { t, locale, pick } = useI18n();
  const [, startTransition] = useTransition();
  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");

  function approve(id: string) {
    startTransition(async () => {
      const res = await approveRedemptionAction(id);
      if (res.ok) {
        toast.success(t.common.success);
        onAction();
      } else if (res.error === "insufficient") {
        toast.error(t.rewards.insufficient);
      } else if (res.error === "out_of_stock") {
        toast.error(t.rewards.outOfStock);
      } else if (res.error === "forbidden") {
        toast.error(t.rewards.forbidden);
      } else {
        toast.error(t.common.failed);
      }
    });
  }

  function reject(id: string) {
    startTransition(async () => {
      const res = await rejectRedemptionAction(id);
      if (res.ok) {
        toast.success(t.rewards.refunded);
        onAction();
      } else toast.error(t.common.failed);
    });
  }

  function fulfill(id: string) {
    startTransition(async () => {
      const res = await fulfillRedemptionAction(id);
      if (res.ok) {
        toast.success(t.common.success);
        onAction();
      } else toast.error(t.common.failed);
    });
  }

  function row(r: InboxRow) {
    return (
      <li key={r.id} className="py-3 flex flex-wrap items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl text-xl inline-flex items-center justify-center shrink-0"
          style={{ background: `${r.child.color}1f` }}
        >
          {r.reward.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium break-words">
            {pick(r.reward)}{" "}
            <span className="text-xs text-[color:var(--foreground-muted)] font-normal">
              · {r.child.emoji}{" "}
              {locale === "zh" ? r.child.nameZh : r.child.nameEn}
            </span>
          </div>
          <div className="text-xs text-[color:var(--foreground-muted)] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <StatusPill status={r.status} />
            <span className="inline-flex items-center gap-0.5 font-semibold text-[color:var(--foreground)]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
              −{r.costPoints}
            </span>
            <span>
              {new Date(r.createdAt).toLocaleString(
                locale === "zh" ? "zh-CN" : "en-US",
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
              )}
            </span>
            {r.requestedBy ? (
              <span>
                {r.requestedBy.emoji}{" "}
                {locale === "zh" ? r.requestedBy.nameZh : r.requestedBy.nameEn}
              </span>
            ) : (
              <span>{t.rewards.selfRequested}</span>
            )}
          </div>
          {r.notes && (
            <div className="text-xs mt-1 italic text-[color:var(--foreground-muted)] break-words">
              &ldquo;{r.notes}&rdquo;
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {r.status === "pending" ? (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => reject(r.id)}
              >
                <X className="w-4 h-4" />
                {t.rewards.reject}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => approve(r.id)}
              >
                <Check className="w-4 h-4" />
                {t.rewards.approve}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fulfill(r.id)}
            >
              <Sparkles className="w-4 h-4" />
              {t.rewards.fulfill}
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <section
      className="card p-4 border-2"
      style={{ borderColor: "color-mix(in srgb, var(--primary) 25%, var(--border))" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium flex items-center gap-2">
          <Gift className="w-4 h-4 text-[color:var(--primary)]" />
          {t.rewards.inboxTitle}
        </div>
        <div className="text-xs text-[color:var(--foreground-muted)] tabular-nums">
          {pending.length} {t.rewards.statusPending} ·{" "}
          {approved.length} {t.rewards.awaitingFulfillment}
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="text-sm text-[color:var(--foreground-muted)] py-3">
          {t.rewards.inboxEmpty}
        </div>
      ) : (
        <ul className="divide-y divide-[color:var(--border)]">
          {pending.map(row)}
          {approved.map(row)}
        </ul>
      )}
    </section>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentChildId } from "@/lib/session";
import { getSession } from "@/lib/get-session";
import { isChild } from "@/lib/permissions";
import { getWalletSnapshot } from "@/lib/stats";
import { toLocalDateKey } from "@/lib/utils";
import { OverviewCheckinNav } from "@/components/OverviewCheckinNav";
import { RewardsClient } from "@/components/RewardsClient";
import { childWhereFor } from "@/lib/family-scope";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const session = await getSession();
  const childId = await getCurrentChildId();
  const allChildren = await prisma.child.findMany({
    where: { archived: false, ...childWhereFor(session) },
    orderBy: { order: "asc" },
  });
  if (allChildren.length === 0) {
    return (
      <div className="card p-6 text-center text-[color:var(--foreground-muted)]">
        No children yet.{" "}
        <Link className="text-[color:var(--primary)] underline" href="/manage">
          Configure
        </Link>
      </div>
    );
  }

  // Child accounts may only see their own ID.
  const visibleChildren =
    session?.kind === "child" && session.childId
      ? allChildren.filter((c) => c.id === session.childId)
      : allChildren;
  const child =
    visibleChildren.find((c) => c.id === childId) ?? visibleChildren[0];

  const [wallet, rewards, pendingInbox] = await Promise.all([
    getWalletSnapshot(child.id),
    prisma.reward.findMany({
      where: {
        archived: false,
        familyId: child.familyId,
        OR: [{ childId: null }, { childId: child.id }],
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    // Parent inbox: pending requests across all children (so they can clear them
    // from the same screen).
    session?.kind === "parent" || session?.kind === "family_admin" || session?.kind === "super_admin"
      ? prisma.rewardRedemption.findMany({
          where: {
            status: { in: ["pending", "approved"] },
            ...(session.kind === "super_admin" ? {} : { familyId: session.familyId ?? "__no_family__" }),
          },
          orderBy: { createdAt: "asc" },
          take: 25,
          include: {
            reward: {
              select: { id: true, nameZh: true, nameEn: true, emoji: true, costPoints: true },
            },
            child: { select: { id: true, nameZh: true, nameEn: true, emoji: true, color: true } },
            requestedBy: { select: { nameZh: true, nameEn: true, emoji: true } },
            reviewedBy: { select: { nameZh: true, nameEn: true, emoji: true } },
          },
        })
      : Promise.resolve([] as never[]),
  ]);

  const isAdmin =
    session?.kind === "super_admin" || session?.kind === "family_admin" || session?.kind === "parent";
  const canApprove =
    session?.kind === "parent" || session?.kind === "family_admin" || session?.kind === "super_admin";
  const canRequestRedemption =
    !!session &&
    (session.kind === "child" ||
      session.kind === "parent" ||
      session.kind === "family_admin" ||
      session.kind === "super_admin");

  const myRedemptionsRows = session
    ? await prisma.rewardRedemption.findMany({
        where: { childId: child.id },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          reward: {
            select: { id: true, nameZh: true, nameEn: true, emoji: true, category: true },
          },
          requestedBy: { select: { nameZh: true, nameEn: true, emoji: true } },
          reviewedBy: { select: { nameZh: true, nameEn: true, emoji: true } },
        },
      })
    : [];

  return (
    <>
      <OverviewCheckinNav
        mode="rewards"
        dateKey={toLocalDateKey(new Date())}
        showDailyCheckin={!isChild(session)}
      />
      <RewardsClient
      child={{
        id: child.id,
        nameZh: child.nameZh,
        nameEn: child.nameEn,
        emoji: child.emoji,
        color: child.color,
      }}
      wallet={wallet}
      rewards={rewards.map((r) => ({
        id: r.id,
        childId: r.childId,
        nameZh: r.nameZh,
        nameEn: r.nameEn,
        descZh: r.descZh,
        descEn: r.descEn,
        emoji: r.emoji,
        costPoints: r.costPoints,
        category: r.category,
        stock: r.stock,
        cooldownDays: r.cooldownDays,
      }))}
      canRequestRedemption={canRequestRedemption}
      myRedemptions={myRedemptionsRows.map((r) => ({
        id: r.id,
        status: r.status as
          | "pending"
          | "approved"
          | "fulfilled"
          | "rejected"
          | "cancelled",
        costPoints: r.costPoints,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt?.toISOString() ?? null,
        fulfilledAt: r.fulfilledAt?.toISOString() ?? null,
        reward: r.reward,
        requestedBy: r.requestedBy,
        reviewedBy: r.reviewedBy,
      }))}
      pendingInbox={pendingInbox.map((r) => ({
        id: r.id,
        status: r.status as "pending" | "approved",
        costPoints: r.costPoints,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
        reward: r.reward,
        child: r.child,
        requestedBy: r.requestedBy,
        reviewedBy: r.reviewedBy,
      }))}
      canApprove={canApprove}
      isAdmin={isAdmin}
    />
    </>
  );
}

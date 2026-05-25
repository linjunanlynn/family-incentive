"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { canManageConfig } from "@/lib/permissions";
import { canAccessChild, childFamilyId } from "@/lib/family-scope";
import { getCurrentPoints } from "@/lib/stats";

export type RewardCategory =
  | "treat"
  | "privilege"
  | "outing"
  | "toy"
  | "family"
  | "learning";

const CATEGORY_VALUES: RewardCategory[] = [
  "treat",
  "privilege",
  "outing",
  "toy",
  "family",
  "learning",
];

function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeCategory(c: string | undefined | null): RewardCategory {
  return (CATEGORY_VALUES as string[]).includes(c ?? "")
    ? (c as RewardCategory)
    : "treat";
}

// ---------- Catalog CRUD (admin only) ----------

export type CreateRewardInput = {
  childId: string | null; // null = shared / available to all kids
  nameZh: string;
  nameEn: string;
  descZh?: string | null;
  descEn?: string | null;
  emoji?: string;
  costPoints: number;
  category?: string;
  stock?: number | null;
  cooldownDays?: number | null;
};

export async function createRewardAction(input: CreateRewardInput) {
  const s = await getSession();
  if (!canManageConfig(s)) return { ok: false as const, error: "forbidden" as const };
  const familyId = input.childId ? await childFamilyId(input.childId) : s?.familyId;
  if (!familyId || (input.childId && !(await canAccessChild(s, input.childId)))) {
    return { ok: false as const, error: "forbidden" as const };
  }
  const nameZh = input.nameZh.trim();
  const nameEn = input.nameEn.trim();
  if (!nameZh || !nameEn) {
    return { ok: false as const, error: "invalid" as const };
  }
  const lastOrder = await prisma.reward.aggregate({
    where: { familyId },
    _max: { order: true },
  });
  await prisma.reward.create({
    data: {
      childId: input.childId,
      familyId,
      nameZh,
      nameEn,
      descZh: input.descZh?.trim() || null,
      descEn: input.descEn?.trim() || null,
      emoji: (input.emoji ?? "🎁").trim() || "🎁",
      costPoints: clampInt(input.costPoints, 1, 100000),
      category: normalizeCategory(input.category),
      stock: input.stock == null ? null : clampInt(input.stock, 0, 100000),
      cooldownDays:
        input.cooldownDays == null ? null : clampInt(input.cooldownDays, 0, 365),
      order: (lastOrder._max.order ?? -1) + 1,
    },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

export type UpdateRewardInput = Partial<CreateRewardInput> & { id: string };

export async function updateRewardAction(input: UpdateRewardInput) {
  const s = await getSession();
  if (!canManageConfig(s)) return { ok: false as const, error: "forbidden" as const };
  const currentReward = await prisma.reward.findUnique({
    where: { id: input.id },
    select: { familyId: true },
  });
  if (!currentReward || (s?.kind !== "super_admin" && currentReward.familyId !== s?.familyId)) {
    return { ok: false as const, error: "forbidden" as const };
  }
  if (input.childId && !(await canAccessChild(s, input.childId))) {
    return { ok: false as const, error: "forbidden" as const };
  }
  const nextFamilyId = input.childId ? (await childFamilyId(input.childId)) ?? undefined : undefined;
  await prisma.reward.update({
    where: { id: input.id },
    data: {
      familyId: nextFamilyId,
      childId: input.childId === undefined ? undefined : input.childId,
      nameZh: input.nameZh?.trim(),
      nameEn: input.nameEn?.trim(),
      descZh: input.descZh === undefined ? undefined : input.descZh?.trim() || null,
      descEn: input.descEn === undefined ? undefined : input.descEn?.trim() || null,
      emoji: input.emoji?.trim() || undefined,
      costPoints:
        input.costPoints === undefined
          ? undefined
          : clampInt(input.costPoints, 1, 100000),
      category:
        input.category === undefined ? undefined : normalizeCategory(input.category),
      stock:
        input.stock === undefined
          ? undefined
          : input.stock === null
            ? null
            : clampInt(input.stock, 0, 100000),
      cooldownDays:
        input.cooldownDays === undefined
          ? undefined
          : input.cooldownDays === null
            ? null
            : clampInt(input.cooldownDays, 0, 365),
    },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

export async function archiveRewardAction(id: string, archived: boolean) {
  const s = await getSession();
  if (!canManageConfig(s)) return { ok: false as const, error: "forbidden" as const };
  await prisma.reward.updateMany({
    where: {
      id,
      ...(s?.kind === "super_admin" ? {} : { familyId: s?.familyId ?? "__no_family__" }),
    },
    data: { archived },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

export async function deleteRewardAction(id: string) {
  const s = await getSession();
  if (!canManageConfig(s)) return { ok: false as const, error: "forbidden" as const };
  await prisma.reward.deleteMany({
    where: {
      id,
      ...(s?.kind === "super_admin" ? {} : { familyId: s?.familyId ?? "__no_family__" }),
    },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

// ---------- Redemption flow ----------

/**
 * Only signed-in child or parent accounts may request (guests browse-only).
 *  - child: only for self
 *  - parent / parent_admin: must be linked to a Member (so we know who requested)
 * Points are NOT deducted until a parent approves.
 */
export async function requestRedemptionAction(input: {
  rewardId: string;
  childId: string;
  notes?: string;
}) {
  const s = await getSession();
  if (!s) return { ok: false as const, error: "forbidden" as const };

  if (s.kind === "child") {
    if (!s.childId || s.childId !== input.childId) {
      return { ok: false as const, error: "forbidden" as const };
    }
  } else if (s.kind === "parent" || s.kind === "family_admin" || s.kind === "super_admin") {
    if (!s.memberId) {
      if (s.kind !== "super_admin") {
        return { ok: false as const, error: "forbidden" as const };
      }
    }
    if (!(await canAccessChild(s, input.childId))) {
      return { ok: false as const, error: "forbidden" as const };
    }
  } else {
    return { ok: false as const, error: "forbidden" as const };
  }

  const reward = await prisma.reward.findUnique({
    where: { id: input.rewardId },
    select: {
      id: true,
      archived: true,
      costPoints: true,
      familyId: true,
      childId: true,
      stock: true,
      cooldownDays: true,
    },
  });
  if (!reward || reward.archived) {
    return { ok: false as const, error: "unavailable" as const };
  }
  if (s.kind !== "super_admin" && reward.familyId !== s.familyId) {
    return { ok: false as const, error: "forbidden" as const };
  }
  const targetFamilyId = await childFamilyId(input.childId);
  if (!targetFamilyId || targetFamilyId !== reward.familyId) {
    return { ok: false as const, error: "wrong_child" as const };
  }
  if (reward.childId && reward.childId !== input.childId) {
    return { ok: false as const, error: "wrong_child" as const };
  }
  if (reward.stock !== null && reward.stock <= 0) {
    return { ok: false as const, error: "out_of_stock" as const };
  }

  // Cooldown: based on the most recent non-rejected/cancelled redemption
  if (reward.cooldownDays && reward.cooldownDays > 0) {
    const last = await prisma.rewardRedemption.findFirst({
      where: {
        rewardId: reward.id,
        childId: input.childId,
        status: { in: ["pending", "approved", "fulfilled"] },
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last) {
      const ageDays =
        (Date.now() - last.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < reward.cooldownDays) {
        return { ok: false as const, error: "cooldown" as const };
      }
    }
  }

  // Soft check: don't let kids queue requests they can't possibly afford even
  // counting earned points (we still approve manually so this is a guardrail).
  const current = await getCurrentPoints(input.childId);
  if (current < reward.costPoints) {
    return { ok: false as const, error: "insufficient" as const };
  }

  await prisma.rewardRedemption.create({
    data: {
      rewardId: reward.id,
      familyId: reward.familyId,
      childId: input.childId,
      costPoints: reward.costPoints,
      status: "pending",
      notes: input.notes?.trim() || null,
      requestedById: s.memberId ?? null,
    },
  });

  revalidatePath("/rewards", "layout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Parents/admin approve a pending request. Atomically deducts stock. */
export async function approveRedemptionAction(id: string) {
  const s = await getSession();
  if (!s || (s.kind !== "parent" && s.kind !== "family_admin" && s.kind !== "super_admin")) {
    return { ok: false as const, error: "forbidden" as const };
  }

  const r = await prisma.rewardRedemption.findUnique({
    where: { id },
    select: {
      id: true,
      familyId: true,
      status: true,
      childId: true,
      costPoints: true,
      reward: { select: { id: true, stock: true, archived: true } },
    },
  });
  if (!r || r.status !== "pending") {
    return { ok: false as const, error: "bad_status" as const };
  }
  if (s.kind !== "super_admin" && r.familyId !== s.familyId) {
    return { ok: false as const, error: "forbidden" as const };
  }
  if (r.reward.archived) return { ok: false as const, error: "unavailable" as const };
  if (r.reward.stock !== null && r.reward.stock <= 0) {
    return { ok: false as const, error: "out_of_stock" as const };
  }

  // Re-check the child's spendable balance. Because approval deducts now, we
  // require enough current points to cover the cost.
  const balance = await getCurrentPoints(r.childId);
  if (balance < r.costPoints) {
    return { ok: false as const, error: "insufficient" as const };
  }

  await prisma.$transaction(async (tx) => {
    await tx.rewardRedemption.update({
      where: { id },
      data: {
        status: "approved",
        reviewedById: s.memberId ?? null,
        reviewedAt: new Date(),
      },
    });
    if (r.reward.stock !== null) {
      await tx.reward.update({
        where: { id: r.reward.id },
        data: { stock: { decrement: 1 } },
      });
    }
  });

  revalidatePath("/rewards", "layout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function rejectRedemptionAction(id: string, reason?: string) {
  const s = await getSession();
  if (!s || (s.kind !== "parent" && s.kind !== "family_admin" && s.kind !== "super_admin")) {
    return { ok: false as const, error: "forbidden" as const };
  }
  const cur = await prisma.rewardRedemption.findUnique({
    where: { id },
    select: { status: true, familyId: true },
  });
  if (!cur || cur.status !== "pending") {
    return { ok: false as const, error: "bad_status" as const };
  }
  if (s.kind !== "super_admin" && cur.familyId !== s.familyId) {
    return { ok: false as const, error: "forbidden" as const };
  }
  await prisma.rewardRedemption.update({
    where: { id },
    data: {
      status: "rejected",
      reviewedById: s.memberId ?? null,
      reviewedAt: new Date(),
      notes: reason?.trim() ? reason.trim() : undefined,
    },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

export async function fulfillRedemptionAction(id: string) {
  const s = await getSession();
  if (!s || (s.kind !== "parent" && s.kind !== "family_admin" && s.kind !== "super_admin")) {
    return { ok: false as const, error: "forbidden" as const };
  }
  const cur = await prisma.rewardRedemption.findUnique({
    where: { id },
    select: { status: true, familyId: true },
  });
  if (!cur || cur.status !== "approved") {
    return { ok: false as const, error: "bad_status" as const };
  }
  if (s.kind !== "super_admin" && cur.familyId !== s.familyId) {
    return { ok: false as const, error: "forbidden" as const };
  }
  await prisma.rewardRedemption.update({
    where: { id },
    data: { status: "fulfilled", fulfilledAt: new Date() },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

/**
 * Cancel a pending request.
 *   - The child themselves can cancel their own pending request
 *   - Any parent can cancel pending requests
 */
export async function cancelRedemptionAction(id: string) {
  const s = await getSession();
  if (!s) return { ok: false as const, error: "forbidden" as const };
  const cur = await prisma.rewardRedemption.findUnique({
    where: { id },
    select: { status: true, childId: true, familyId: true },
  });
  if (!cur || cur.status !== "pending") {
    return { ok: false as const, error: "bad_status" as const };
  }
  if (s.kind === "child" && cur.childId !== s.childId) {
    return { ok: false as const, error: "forbidden" as const };
  }
  if (s.kind !== "child" && s.kind !== "super_admin" && cur.familyId !== s.familyId) {
    return { ok: false as const, error: "forbidden" as const };
  }
  await prisma.rewardRedemption.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/rewards", "layout");
  return { ok: true as const };
}

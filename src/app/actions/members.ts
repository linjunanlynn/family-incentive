"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertFamilyManager } from "@/lib/guard";
import { revalidatePath } from "next/cache";

export async function createMemberAction(input: {
  nameZh: string;
  nameEn: string;
  role: string;
  emoji: string;
  color: string;
  pin?: string;
}) {
  const session = await assertFamilyManager();
  if (!session?.familyId) return;
  const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : null;
  await prisma.member.create({
    data: {
      familyId: session.familyId,
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      role: input.role,
      emoji: input.emoji || "👤",
      color: input.color || "#6366f1",
      pinHash,
    },
  });
  revalidatePath("/", "layout");
}

export async function createParentMemberWithAccountAction(input: {
  nameZh: string;
  nameEn: string;
  role: string;
  emoji: string;
  color: string;
  username: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await assertFamilyManager();
  if (!session?.familyId) return { ok: false, error: "forbidden" };
  const username = input.username.trim().toLowerCase();
  if (!username || username.length < 2) return { ok: false, error: "username" };
  if (!input.password || input.password.length < 4) return { ok: false, error: "password" };
  const exists = await prisma.userAccount.findUnique({ where: { username } });
  if (exists) return { ok: false, error: "taken" };
  await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        familyId: session.familyId!,
        nameZh: input.nameZh,
        nameEn: input.nameEn,
        role: input.role,
        emoji: input.emoji || "👤",
        color: input.color || "#6366f1",
      },
    });
    await tx.userAccount.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(input.password, 10),
        accountKind: "parent",
        familyId: session.familyId!,
        memberId: member.id,
      },
    });
  });
  revalidatePath("/members", "layout");
  return { ok: true };
}

export async function createChildWithAccountAction(input: {
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  username: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await assertFamilyManager();
  if (!session?.familyId) return { ok: false, error: "forbidden" };
  const username = input.username.trim().toLowerCase();
  if (!username || username.length < 2) return { ok: false, error: "username" };
  if (!input.password || input.password.length < 4) return { ok: false, error: "password" };
  const exists = await prisma.userAccount.findUnique({ where: { username } });
  if (exists) return { ok: false, error: "taken" };
  const order = await prisma.child.aggregate({
    where: { familyId: session.familyId },
    _max: { order: true },
  });
  const child = await prisma.child.create({
    data: {
      familyId: session.familyId,
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji || "🧒",
      avatarUrl: normalizeImageDataUrl(input.avatarUrl),
      backgroundUrl: normalizeImageDataUrl(input.backgroundUrl),
      color: input.color || "#6366f1",
      order: (order._max.order ?? -1) + 1,
    },
  });
  await copyBehaviorTemplateToChild(session.familyId, child.id);
  await prisma.userAccount.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(input.password, 10),
      accountKind: "child",
      familyId: session.familyId,
      childId: child.id,
    },
  });
  revalidatePath("/members", "layout");
  return { ok: true };
}

export async function updateChildProfileAction(input: {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
}) {
  const session = await assertFamilyManager();
  if (!session?.familyId) return;
  await prisma.child.updateMany({
    where: { id: input.id, familyId: session.familyId },
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji || "🧒",
      avatarUrl: normalizeImageDataUrl(input.avatarUrl),
      backgroundUrl: normalizeImageDataUrl(input.backgroundUrl),
      color: input.color || "#6366f1",
    },
  });
  revalidatePath("/members", "layout");
}

function normalizeImageDataUrl(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return v.startsWith("data:image/") ? v : null;
}

export async function deleteChildAction(id: string) {
  const session = await assertFamilyManager();
  if (!session?.familyId) return;
  await prisma.child.deleteMany({ where: { id, familyId: session.familyId } });
  revalidatePath("/members", "layout");
}

export async function updateMemberAction(input: {
  id: string;
  nameZh?: string;
  nameEn?: string;
  role?: string;
  emoji?: string;
  color?: string;
}) {
  const session = await assertFamilyManager();
  if (!session?.familyId) return;
  await prisma.member.updateMany({
    where: { id: input.id, familyId: session.familyId },
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      role: input.role,
      emoji: input.emoji,
      color: input.color,
    },
  });
  revalidatePath("/", "layout");
}

export async function setMemberPinAction(id: string, pin: string | null) {
  const session = await assertFamilyManager();
  if (!session?.familyId) return;
  const pinHash = pin && pin.length > 0 ? await bcrypt.hash(pin, 10) : null;
  await prisma.member.updateMany({ where: { id, familyId: session.familyId }, data: { pinHash } });
  revalidatePath("/", "layout");
}

export async function deleteMemberAction(id: string) {
  const session = await assertFamilyManager();
  if (!session?.familyId) return;
  await prisma.member.deleteMany({ where: { id, familyId: session.familyId } });
  revalidatePath("/", "layout");
}

async function copyBehaviorTemplateToChild(familyId: string, childId: string) {
  const template = await prisma.child.findFirst({
    where: { familyId, id: { not: childId }, categories: { some: {} } },
    orderBy: { order: "asc" },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { behaviors: { orderBy: { order: "asc" } } },
      },
    },
  });
  const source = template ?? await prisma.child.findFirst({
    where: { familyId: "default-family", categories: { some: {} } },
    orderBy: { order: "asc" },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: { behaviors: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!source) return;
  for (const category of source.categories) {
    const created = await prisma.category.create({
      data: {
        childId,
        key: `${category.key}-${Date.now().toString(36)}`,
        nameZh: category.nameZh,
        nameEn: category.nameEn,
        emoji: category.emoji,
        order: category.order,
        archived: category.archived,
      },
    });
    if (category.behaviors.length > 0) {
      await prisma.behavior.createMany({
        data: category.behaviors.map((behavior) => ({
          categoryId: created.id,
          type: behavior.type,
          nameZh: behavior.nameZh,
          nameEn: behavior.nameEn,
          points: behavior.points,
          order: behavior.order,
          archived: behavior.archived,
        })),
      });
    }
  }
}

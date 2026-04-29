"use server";

import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guard";
import { revalidatePath } from "next/cache";

// ---------- Categories ----------
export async function createCategoryAction(input: {
  childId: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
}) {
  if (!(await assertAdmin())) return;
  const slug =
    input.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `cat-${Date.now()}`;
  const existingMax = await prisma.category.aggregate({
    where: { childId: input.childId },
    _max: { order: true },
  });
  await prisma.category.create({
    data: {
      childId: input.childId,
      key: `${slug}-${Date.now().toString(36)}`,
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji || "✨",
      order: (existingMax._max.order ?? -1) + 1,
    },
  });
  revalidatePath("/manage");
}

export async function updateCategoryAction(input: {
  id: string;
  nameZh?: string;
  nameEn?: string;
  emoji?: string;
}) {
  if (!(await assertAdmin())) return;
  await prisma.category.update({
    where: { id: input.id },
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji,
    },
  });
  revalidatePath("/manage");
}

export async function deleteCategoryAction(id: string) {
  if (!(await assertAdmin())) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/manage");
}

export async function archiveCategoryAction(id: string, archived: boolean) {
  if (!(await assertAdmin())) return;
  await prisma.category.update({ where: { id }, data: { archived } });
  revalidatePath("/manage");
}

// ---------- Behaviors ----------
export async function createBehaviorAction(input: {
  categoryId: string;
  type: "positive" | "negative";
  nameZh: string;
  nameEn: string;
  points: number;
}) {
  if (!(await assertAdmin())) return;
  const existingMax = await prisma.behavior.aggregate({
    where: { categoryId: input.categoryId },
    _max: { order: true },
  });
  await prisma.behavior.create({
    data: {
      categoryId: input.categoryId,
      type: input.type,
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      points: Math.max(1, Math.min(20, Math.round(input.points))),
      order: (existingMax._max.order ?? -1) + 1,
    },
  });
  revalidatePath("/manage");
}

export async function updateBehaviorAction(input: {
  id: string;
  nameZh?: string;
  nameEn?: string;
  type?: "positive" | "negative";
  points?: number;
}) {
  if (!(await assertAdmin())) return;
  await prisma.behavior.update({
    where: { id: input.id },
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      type: input.type,
      points: input.points !== undefined ? Math.max(1, Math.min(20, Math.round(input.points))) : undefined,
    },
  });
  revalidatePath("/manage");
}

export async function deleteBehaviorAction(id: string) {
  if (!(await assertAdmin())) return;
  await prisma.behavior.delete({ where: { id } });
  revalidatePath("/manage");
}

export async function archiveBehaviorAction(id: string, archived: boolean) {
  if (!(await assertAdmin())) return;
  await prisma.behavior.update({ where: { id }, data: { archived } });
  revalidatePath("/manage");
}

// ---------- Children ----------
export async function createChildAction(input: { nameZh: string; nameEn: string; emoji: string; color: string }) {
  if (!(await assertAdmin())) return;
  const order = await prisma.child.aggregate({ _max: { order: true } });
  await prisma.child.create({
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji || "🧒",
      color: input.color || "#6366f1",
      order: (order._max.order ?? -1) + 1,
    },
  });
  revalidatePath("/", "layout");
}

export async function updateChildAction(input: {
  id: string;
  nameZh?: string;
  nameEn?: string;
  emoji?: string;
  color?: string;
}) {
  if (!(await assertAdmin())) return;
  await prisma.child.update({
    where: { id: input.id },
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji,
      color: input.color,
    },
  });
  revalidatePath("/", "layout");
}

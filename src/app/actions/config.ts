"use server";

import { prisma } from "@/lib/prisma";
import { assertConfigManager } from "@/lib/guard";
import { canAccessChild } from "@/lib/family-scope";
import { revalidatePath } from "next/cache";

// ---------- Categories ----------
export async function createCategoryAction(input: {
  childId: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
}) {
  const session = await assertConfigManager();
  if (!(await canAccessChild(session, input.childId))) return;
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
  const session = await assertConfigManager();
  if (!session) return;
  await prisma.category.updateMany({
    where: {
      id: input.id,
      ...(session.kind === "super_admin" ? {} : { child: { is: { familyId: session.familyId ?? "__no_family__" } } }),
    },
    data: {
      nameZh: input.nameZh,
      nameEn: input.nameEn,
      emoji: input.emoji,
    },
  });
  revalidatePath("/manage");
}

export async function deleteCategoryAction(id: string) {
  const session = await assertConfigManager();
  if (!session) return;
  await prisma.category.deleteMany({
    where: {
      id,
      ...(session.kind === "super_admin" ? {} : { child: { is: { familyId: session.familyId ?? "__no_family__" } } }),
    },
  });
  revalidatePath("/manage");
}

export async function archiveCategoryAction(id: string, archived: boolean) {
  const session = await assertConfigManager();
  if (!session) return;
  await prisma.category.updateMany({
    where: {
      id,
      ...(session.kind === "super_admin" ? {} : { child: { is: { familyId: session.familyId ?? "__no_family__" } } }),
    },
    data: { archived },
  });
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
  const session = await assertConfigManager();
  if (!session) return;
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { child: { select: { familyId: true } } },
  });
  if (!category || (session.kind !== "super_admin" && category.child.familyId !== session.familyId)) return;
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
  const session = await assertConfigManager();
  if (!session) return;
  await prisma.behavior.updateMany({
    where: {
      id: input.id,
      ...(session.kind === "super_admin" ? {} : { category: { is: { child: { is: { familyId: session.familyId ?? "__no_family__" } } } } }),
    },
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
  const session = await assertConfigManager();
  if (!session) return;
  await prisma.behavior.deleteMany({
    where: {
      id,
      ...(session.kind === "super_admin" ? {} : { category: { is: { child: { is: { familyId: session.familyId ?? "__no_family__" } } } } }),
    },
  });
  revalidatePath("/manage");
}

export async function archiveBehaviorAction(id: string, archived: boolean) {
  const session = await assertConfigManager();
  if (!session) return;
  await prisma.behavior.updateMany({
    where: {
      id,
      ...(session.kind === "super_admin" ? {} : { category: { is: { child: { is: { familyId: session.familyId ?? "__no_family__" } } } } }),
    },
    data: { archived },
  });
  revalidatePath("/manage");
}

// ---------- Children ----------
export async function createChildAction(input: { nameZh: string; nameEn: string; emoji: string; color: string }) {
  const session = await assertConfigManager();
  if (!session?.familyId) return;
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
      color: input.color || "#6366f1",
      order: (order._max.order ?? -1) + 1,
    },
  });
  await copyTemplateToChild(session.familyId, child.id);
  revalidatePath("/", "layout");
}

export async function updateChildAction(input: {
  id: string;
  nameZh?: string;
  nameEn?: string;
  emoji?: string;
  color?: string;
}) {
  const session = await assertConfigManager();
  if (!(await canAccessChild(session, input.id))) return;
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

async function copyTemplateToChild(familyId: string, childId: string) {
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
    for (const behavior of category.behaviors) {
      await prisma.behavior.create({
        data: {
          categoryId: created.id,
          type: behavior.type,
          nameZh: behavior.nameZh,
          nameEn: behavior.nameEn,
          points: behavior.points,
          order: behavior.order,
          archived: behavior.archived,
        },
      });
    }
  }
}

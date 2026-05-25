"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertSuperAdmin } from "@/lib/guard";

export async function createFamilyAction(input: {
  nameZh: string;
  nameEn: string;
  adminUsername: string;
  adminPassword: string;
  adminNameZh: string;
  adminNameEn: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const superAdmin = await assertSuperAdmin();
  if (!superAdmin) return { ok: false, error: "forbidden" };

  const nameZh = input.nameZh.trim();
  const nameEn = input.nameEn.trim();
  const username = input.adminUsername.trim().toLowerCase();
  if (!nameZh || !nameEn || !username || username.length < 2) {
    return { ok: false, error: "invalid" };
  }
  if (!input.adminPassword || input.adminPassword.length < 4) {
    return { ok: false, error: "password" };
  }
  const exists = await prisma.userAccount.findUnique({ where: { username } });
  if (exists) return { ok: false, error: "taken" };

  const passwordHash = await bcrypt.hash(input.adminPassword, 10);
  const templateRewardsFamily = await prisma.family.findFirst({
    where: { rewards: { some: { childId: null } } },
    orderBy: { createdAt: "asc" },
    include: {
      rewards: {
        where: { childId: null, archived: false },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  try {
  await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        nameZh,
        nameEn,
        createdById: superAdmin.sub,
      },
    });
    const member = await tx.member.create({
      data: {
        familyId: family.id,
        nameZh: input.adminNameZh.trim() || "管理员",
        nameEn: input.adminNameEn.trim() || "Admin",
        role: "parent",
        emoji: "👤",
        color: "#6366f1",
      },
    });
    await tx.userAccount.create({
      data: {
        username,
        passwordHash,
        accountKind: "family_admin",
        familyId: family.id,
        memberId: member.id,
      },
    });

    const rewardRows = (templateRewardsFamily?.rewards ?? []).map((reward) => ({
          familyId: family.id,
          childId: null,
          nameZh: reward.nameZh,
          nameEn: reward.nameEn,
          descZh: reward.descZh,
          descEn: reward.descEn,
          emoji: reward.emoji,
          costPoints: reward.costPoints,
          category: reward.category,
          stock: reward.stock,
          cooldownDays: reward.cooldownDays,
          order: reward.order,
    }));
    if (rewardRows.length > 0) {
      await tx.reward.createMany({ data: rewardRows });
    }
  }, { maxWait: 10_000, timeout: 60_000 });
  } catch (error) {
    console.error("createFamilyAction failed", error);
    return { ok: false, error: "create_failed" };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateFamilyAction(input: {
  id: string;
  nameZh: string;
  nameEn: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const superAdmin = await assertSuperAdmin();
  if (!superAdmin) return { ok: false, error: "forbidden" };
  const nameZh = input.nameZh.trim();
  const nameEn = input.nameEn.trim();
  if (!nameZh || !nameEn) return { ok: false, error: "invalid" };
  await prisma.family.update({
    where: { id: input.id },
    data: { nameZh, nameEn },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteFamilyAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const superAdmin = await assertSuperAdmin();
  if (!superAdmin) return { ok: false, error: "forbidden" };
  if (id === "default-family") return { ok: false, error: "protected" };
  await prisma.family.delete({ where: { id } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function createFamilyAdminAction(input: {
  familyId: string;
  username: string;
  password: string;
  nameZh: string;
  nameEn: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const superAdmin = await assertSuperAdmin();
  if (!superAdmin) return { ok: false, error: "forbidden" };
  const username = input.username.trim().toLowerCase();
  if (!username || username.length < 2) return { ok: false, error: "username" };
  if (!input.password || input.password.length < 4) return { ok: false, error: "password" };
  const family = await prisma.family.findUnique({ where: { id: input.familyId }, select: { id: true } });
  if (!family) return { ok: false, error: "family" };
  const exists = await prisma.userAccount.findUnique({ where: { username } });
  if (exists) return { ok: false, error: "taken" };

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        familyId: family.id,
        nameZh: input.nameZh.trim() || "管理员",
        nameEn: input.nameEn.trim() || "Admin",
        role: "parent",
        emoji: "👤",
        color: "#6366f1",
      },
    });
    await tx.userAccount.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(input.password, 10),
        accountKind: "family_admin",
        familyId: family.id,
        memberId: member.id,
      },
    });
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function resetFamilyAdminPasswordAction(
  accountId: string,
  password: string,
): Promise<{ ok: true } | { ok: false }> {
  const superAdmin = await assertSuperAdmin();
  if (!superAdmin || password.length < 4) return { ok: false };
  await prisma.userAccount.updateMany({
    where: { id: accountId, accountKind: "family_admin" },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setFamilyAdminDisabledAction(accountId: string, disabled: boolean) {
  const superAdmin = await assertSuperAdmin();
  if (!superAdmin) return;
  await prisma.userAccount.updateMany({
    where: { id: accountId, accountKind: "family_admin" },
    data: { disabled },
  });
  revalidatePath("/admin", "layout");
}

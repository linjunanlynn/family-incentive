"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guard";
import { revalidatePath } from "next/cache";

export async function createMemberAction(input: {
  nameZh: string;
  nameEn: string;
  role: string;
  emoji: string;
  color: string;
  pin?: string;
}) {
  if (!(await assertAdmin())) return;
  const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : null;
  await prisma.member.create({
    data: {
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

export async function updateMemberAction(input: {
  id: string;
  nameZh?: string;
  nameEn?: string;
  role?: string;
  emoji?: string;
  color?: string;
}) {
  if (!(await assertAdmin())) return;
  await prisma.member.update({
    where: { id: input.id },
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
  if (!(await assertAdmin())) return;
  const pinHash = pin && pin.length > 0 ? await bcrypt.hash(pin, 10) : null;
  await prisma.member.update({ where: { id }, data: { pinHash } });
  revalidatePath("/", "layout");
}

export async function deleteMemberAction(id: string) {
  if (!(await assertAdmin())) return;
  await prisma.member.delete({ where: { id } });
  revalidatePath("/", "layout");
}

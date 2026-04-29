"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import type { AccountKind } from "@/auth/jwt";

export async function createUserAccountAction(input: {
  username: string;
  password: string;
  accountKind: AccountKind;
  memberId: string | null;
  childId: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) return { ok: false, error: "forbidden" };
  const u = input.username.trim().toLowerCase();
  if (!u || u.length < 2) return { ok: false, error: "username" };
  if (!input.password || input.password.length < 4) return { ok: false, error: "password" };
  const hasM = !!input.memberId;
  const hasC = !!input.childId;
  if (hasM === hasC) return { ok: false, error: "link" };
  if (input.accountKind === "child") {
    if (!hasC || hasM) return { ok: false, error: "link" };
  } else {
    if (!hasM || hasC) return { ok: false, error: "link" };
  }
  const exists = await prisma.userAccount.findUnique({ where: { username: u } });
  if (exists) return { ok: false, error: "taken" };
  if (input.memberId) {
    const taken = await prisma.userAccount.findUnique({ where: { memberId: input.memberId } });
    if (taken) return { ok: false, error: "memberTaken" };
  }
  if (input.childId) {
    const taken = await prisma.userAccount.findUnique({ where: { childId: input.childId } });
    if (taken) return { ok: false, error: "childTaken" };
  }
  await prisma.userAccount.create({
    data: {
      username: u,
      passwordHash: await bcrypt.hash(input.password, 10),
      accountKind: input.accountKind,
      memberId: input.memberId,
      childId: input.childId,
    },
  });
  revalidatePath("/accounts");
  return { ok: true };
}

export async function resetUserPasswordAction(
  id: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false }> {
  if (!(await assertAdmin())) return { ok: false };
  if (!newPassword || newPassword.length < 4) return { ok: false };
  await prisma.userAccount.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });
  revalidatePath("/accounts");
  return { ok: true };
}

export async function setUserDisabledAction(id: string, disabled: boolean) {
  if (!(await assertAdmin())) return;
  await prisma.userAccount.update({ where: { id }, data: { disabled } });
  revalidatePath("/accounts");
}

export async function deleteUserAccountAction(id: string) {
  if (!(await assertAdmin())) return;
  await prisma.userAccount.delete({ where: { id } });
  revalidatePath("/accounts");
}

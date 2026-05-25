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
  const session = await assertAdmin();
  if (!session || !session.familyId || session.kind === "super_admin") {
    return { ok: false, error: "forbidden" };
  }
  const u = input.username.trim().toLowerCase();
  if (input.accountKind !== "parent" && input.accountKind !== "child") {
    return { ok: false, error: "forbidden" };
  }
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
    const member = await prisma.member.findFirst({
      where: { id: input.memberId, familyId: session.familyId },
      select: { id: true },
    });
    if (!member) return { ok: false, error: "link" };
    const taken = await prisma.userAccount.findUnique({ where: { memberId: input.memberId } });
    if (taken) return { ok: false, error: "memberTaken" };
  }
  if (input.childId) {
    const child = await prisma.child.findFirst({
      where: { id: input.childId, familyId: session.familyId },
      select: { id: true },
    });
    if (!child) return { ok: false, error: "link" };
    const taken = await prisma.userAccount.findUnique({ where: { childId: input.childId } });
    if (taken) return { ok: false, error: "childTaken" };
  }
  await prisma.userAccount.create({
    data: {
      username: u,
      passwordHash: await bcrypt.hash(input.password, 10),
      accountKind: input.accountKind,
      familyId: session.familyId,
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
  const session = await assertAdmin();
  if (!session || !(await canManageAccount(session, id))) return { ok: false };
  if (!newPassword || newPassword.length < 4) return { ok: false };
  await prisma.userAccount.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) },
  });
  revalidatePath("/accounts");
  return { ok: true };
}

export async function setUserDisabledAction(id: string, disabled: boolean) {
  const session = await assertAdmin();
  if (!session || !(await canManageAccount(session, id))) return;
  await prisma.userAccount.update({ where: { id }, data: { disabled } });
  revalidatePath("/accounts");
}

export async function deleteUserAccountAction(id: string) {
  const session = await assertAdmin();
  if (!session || !(await canManageAccount(session, id))) return;
  await prisma.userAccount.delete({ where: { id } });
  revalidatePath("/accounts");
}

async function canManageAccount(
  session: NonNullable<Awaited<ReturnType<typeof assertAdmin>>>,
  id: string,
): Promise<boolean> {
  const account = await prisma.userAccount.findUnique({
    where: { id },
    select: { familyId: true, accountKind: true },
  });
  if (!account) return false;
  if (session.kind === "super_admin") return account.accountKind !== "super_admin";
  return (
    !!session.familyId &&
    account.familyId === session.familyId &&
    (account.accountKind === "parent" || account.accountKind === "child")
  );
}

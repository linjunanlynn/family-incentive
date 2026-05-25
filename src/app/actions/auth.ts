"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, type SessionClaims } from "@/auth/jwt";
import { CHILD_COOKIE } from "@/lib/session";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function cookieOptions() {
  const secureCookie =
    process.env.AUTH_COOKIE_SECURE === "false"
      ? false
      : process.env.NODE_ENV === "production";

  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: THIRTY_DAYS,
    secure: secureCookie,
  };
}

export async function loginAction(
  username: string,
  password: string,
): Promise<{ ok: true; redirectTo: string } | { ok: false; error: "invalid" | "disabled" }> {
  const u = username.trim().toLowerCase();
  if (!u || !password) return { ok: false, error: "invalid" };

  const acc = await prisma.userAccount.findUnique({
    where: { username: u },
    select: {
      id: true,
      username: true,
      passwordHash: true,
      accountKind: true,
      familyId: true,
      memberId: true,
      childId: true,
      disabled: true,
    },
  });
  if (!acc || acc.disabled) return { ok: false, error: acc?.disabled ? "disabled" : "invalid" };
  const ok = await bcrypt.compare(password, acc.passwordHash);
  if (!ok) return { ok: false, error: "invalid" };

  const claims: SessionClaims = {
    sub: acc.id,
    username: acc.username,
    kind: acc.accountKind as SessionClaims["kind"],
    familyId: acc.familyId,
    memberId: acc.memberId,
    childId: acc.childId,
  };
  const token = await createSessionToken(claims);
  const c = await cookies();
  c.set(SESSION_COOKIE, token, cookieOptions());

  if (acc.childId) {
    c.set(CHILD_COOKIE, acc.childId, { path: "/", maxAge: THIRTY_DAYS, sameSite: "lax" });
  }

  revalidatePath("/", "layout");
  return { ok: true, redirectTo: acc.accountKind === "super_admin" ? "/admin" : "/" };
}

export async function logoutAction() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
}

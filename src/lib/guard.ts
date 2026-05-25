import type { SessionClaims } from "@/auth/jwt";
import { getSession } from "@/lib/get-session";
import { canManageConfig, canManageFamily, canScore, isSuperAdmin } from "@/lib/permissions";

export async function assertConfigManager(): Promise<SessionClaims | null> {
  const s = await getSession();
  return canManageConfig(s) ? s : null;
}

export async function assertFamilyManager(): Promise<SessionClaims | null> {
  const s = await getSession();
  return canManageFamily(s) ? s : null;
}

export async function assertSuperAdmin(): Promise<SessionClaims | null> {
  const s = await getSession();
  return isSuperAdmin(s) ? s : null;
}

export async function assertAdmin(): Promise<SessionClaims | null> {
  return assertFamilyManager();
}

export async function assertCanScore(): Promise<SessionClaims | null> {
  const s = await getSession();
  if (!s || !canScore(s)) return null;
  if (s.kind !== "super_admin" && !s.memberId) return null;
  return s;
}

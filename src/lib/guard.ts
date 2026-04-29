import type { SessionClaims } from "@/auth/jwt";
import { getSession } from "@/lib/get-session";
import { canScore, isAdmin } from "@/lib/permissions";

export async function assertAdmin(): Promise<SessionClaims | null> {
  const s = await getSession();
  return isAdmin(s) ? s : null;
}

export async function assertCanScore(): Promise<SessionClaims | null> {
  const s = await getSession();
  if (!s || !canScore(s) || !s.memberId) return null;
  return s;
}

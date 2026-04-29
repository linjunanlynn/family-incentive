import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE, type SessionClaims } from "@/auth/jwt";

export async function getSession(): Promise<SessionClaims | null> {
  const c = await cookies();
  const raw = c.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return readSessionToken(raw);
}

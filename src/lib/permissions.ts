import type { SessionClaims } from "@/auth/jwt";

export function canScore(session: SessionClaims | null): boolean {
  return session?.kind === "parent" || session?.kind === "parent_admin";
}

export function isAdmin(session: SessionClaims | null): boolean {
  return session?.kind === "parent_admin";
}

export function isChild(session: SessionClaims | null): boolean {
  return session?.kind === "child";
}

import type { SessionClaims } from "@/auth/jwt";

export function canScore(session: SessionClaims | null): boolean {
  return session?.kind === "super_admin" || session?.kind === "family_admin" || session?.kind === "parent";
}

export function isAdmin(session: SessionClaims | null): boolean {
  return session?.kind === "super_admin" || session?.kind === "family_admin";
}

export function isSuperAdmin(session: SessionClaims | null): boolean {
  return session?.kind === "super_admin";
}

export function canManageFamily(session: SessionClaims | null): boolean {
  return session?.kind === "super_admin" || session?.kind === "family_admin";
}

export function canManageConfig(session: SessionClaims | null): boolean {
  return session?.kind === "super_admin" || session?.kind === "family_admin" || session?.kind === "parent";
}

export function isChild(session: SessionClaims | null): boolean {
  return session?.kind === "child";
}

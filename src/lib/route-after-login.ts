import type { SessionClaims } from "@/auth/jwt";

export function routeAfterLogin(session: Pick<SessionClaims, "kind"> | null): string {
  if (session?.kind === "super_admin") return "/admin";
  return "/";
}

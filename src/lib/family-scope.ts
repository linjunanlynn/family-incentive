import type { SessionClaims } from "@/auth/jwt";
import { prisma } from "@/lib/prisma";

export function familyWhereFor(session: SessionClaims | null) {
  if (!session) return { id: "__no_family__" };
  if (session.kind === "super_admin") return {};
  return session.familyId ? { id: session.familyId } : { id: "__no_family__" };
}

export function childWhereFor(session: SessionClaims | null) {
  if (!session) return { id: "__no_child__" };
  if (session.kind === "child") {
    return { id: session.childId ?? "__no_child__" };
  }
  if (session.kind === "super_admin") return {};
  return { familyId: session.familyId ?? "__no_family__" };
}

export function memberWhereFor(session: SessionClaims | null) {
  if (!session) return { id: "__no_member__" };
  if (session.kind === "super_admin") return {};
  return { familyId: session.familyId ?? "__no_family__" };
}

export async function canAccessChild(session: SessionClaims | null, childId: string): Promise<boolean> {
  if (!session) return false;
  if (session.kind === "child") return session.childId === childId;
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { familyId: true },
  });
  if (!child) return false;
  if (session.kind === "super_admin") return true;
  return !!session.familyId && child.familyId === session.familyId;
}

export async function childFamilyId(childId: string): Promise<string | null> {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { familyId: true },
  });
  return child?.familyId ?? null;
}

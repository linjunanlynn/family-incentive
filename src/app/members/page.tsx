import { prisma } from "@/lib/prisma";
import { MembersClient } from "@/components/MembersClient";
import { getSession } from "@/lib/get-session";
import { childWhereFor, memberWhereFor } from "@/lib/family-scope";

export default async function MembersPage() {
  const session = await getSession();
  const [members, children] = await Promise.all([
    prisma.member.findMany({
      where: memberWhereFor(session),
      orderBy: { createdAt: "asc" },
      include: { userAccount: { select: { username: true, disabled: true } } },
    }),
    prisma.child.findMany({
      where: { archived: false, ...childWhereFor(session) },
      orderBy: { order: "asc" },
      include: { userAccount: { select: { username: true, disabled: true } } },
    }),
  ]);
  return (
    <MembersClient
      members={members.map((m) => ({
        id: m.id,
        nameZh: m.nameZh,
        nameEn: m.nameEn,
        role: m.role,
        emoji: m.emoji,
        color: m.color,
        account: m.userAccount,
      }))}
      children_={children.map((c) => ({
        id: c.id,
        nameZh: c.nameZh,
        nameEn: c.nameEn,
        emoji: c.emoji,
        color: c.color,
        avatarUrl: c.avatarUrl,
        backgroundUrl: c.backgroundUrl,
        account: c.userAccount,
      }))}
    />
  );
}

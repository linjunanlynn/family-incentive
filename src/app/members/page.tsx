import { prisma } from "@/lib/prisma";
import { MembersClient } from "@/components/MembersClient";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "asc" },
  });
  return (
    <MembersClient
      members={members.map((m) => ({
        id: m.id,
        nameZh: m.nameZh,
        nameEn: m.nameEn,
        role: m.role,
        emoji: m.emoji,
        color: m.color,
        hasPin: !!m.pinHash,
      }))}
    />
  );
}

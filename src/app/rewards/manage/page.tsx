import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { isAdmin } from "@/lib/permissions";
import { RewardsManageClient } from "@/components/RewardsManageClient";

export const dynamic = "force-dynamic";

export default async function RewardsManagePage() {
  const session = await getSession();
  if (!isAdmin(session)) {
    redirect("/rewards");
  }

  const [rewards, children] = await Promise.all([
    prisma.reward.findMany({
      orderBy: [{ archived: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.child.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
      select: { id: true, nameZh: true, nameEn: true, emoji: true, color: true },
    }),
  ]);

  return (
    <RewardsManageClient
      rewards={rewards.map((r) => ({
        id: r.id,
        childId: r.childId,
        nameZh: r.nameZh,
        nameEn: r.nameEn,
        descZh: r.descZh,
        descEn: r.descEn,
        emoji: r.emoji,
        costPoints: r.costPoints,
        category: r.category,
        stock: r.stock,
        cooldownDays: r.cooldownDays,
        archived: r.archived,
      }))}
      children_={children}
    />
  );
}

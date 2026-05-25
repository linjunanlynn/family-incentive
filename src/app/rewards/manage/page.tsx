import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { canManageConfig } from "@/lib/permissions";
import { childWhereFor } from "@/lib/family-scope";
import { RewardsManageClient } from "@/components/RewardsManageClient";

export const dynamic = "force-dynamic";

export default async function RewardsManagePage() {
  const session = await getSession();
  if (!canManageConfig(session)) {
    redirect("/rewards");
  }

  const [rewards, children] = await Promise.all([
    prisma.reward.findMany({
      where: session?.kind === "super_admin" ? {} : { familyId: session?.familyId ?? "__no_family__" },
      orderBy: [{ archived: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.child.findMany({
      where: { archived: false, ...childWhereFor(session) },
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

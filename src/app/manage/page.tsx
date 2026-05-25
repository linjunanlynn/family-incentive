import { prisma } from "@/lib/prisma";
import { getCurrentChildId } from "@/lib/session";
import { ManageClient } from "@/components/ManageClient";
import { getSession } from "@/lib/get-session";
import { childWhereFor } from "@/lib/family-scope";

export default async function ManagePage() {
  const childId = await getCurrentChildId();
  const session = await getSession();
  const children = await prisma.child.findMany({
    where: childWhereFor(session),
    orderBy: { order: "asc" },
  });
  if (children.length === 0) {
    return <div className="card p-6 text-[color:var(--foreground-muted)]">No children configured.</div>;
  }
  const child = children.find((c) => c.id === childId) ?? children[0];

  const categories = await prisma.category.findMany({
    where: { childId: child.id },
    orderBy: { order: "asc" },
    include: {
      behaviors: {
        orderBy: [{ type: "asc" }, { order: "asc" }],
      },
    },
  });

  return (
    <ManageClient
      child={{ id: child.id, nameZh: child.nameZh, nameEn: child.nameEn, emoji: child.emoji, color: child.color }}
      categories={categories.map((c) => ({
        id: c.id,
        nameZh: c.nameZh,
        nameEn: c.nameEn,
        emoji: c.emoji,
        archived: c.archived,
        behaviors: c.behaviors.map((b) => ({
          id: b.id,
          nameZh: b.nameZh,
          nameEn: b.nameEn,
          type: b.type as "positive" | "negative",
          points: b.points,
          archived: b.archived,
        })),
      }))}
    />
  );
}

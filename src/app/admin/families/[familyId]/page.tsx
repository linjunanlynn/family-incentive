import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertSuperAdmin } from "@/lib/guard";
import { AdminFamilyDetailClient } from "@/components/AdminFamilyDetailClient";

type Params = Promise<{ familyId: string }>;

export default async function AdminFamilyDetailPage({ params }: { params: Params }) {
  const session = await assertSuperAdmin();
  if (!session) redirect("/");
  const { familyId } = await params;

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      accounts: {
        orderBy: { username: "asc" },
        select: {
          id: true,
          username: true,
          accountKind: true,
          disabled: true,
          member: { select: { id: true, nameZh: true, nameEn: true, emoji: true } },
          child: { select: { id: true, nameZh: true, nameEn: true, emoji: true } },
        },
      },
      members: {
        orderBy: { createdAt: "asc" },
        select: { id: true, nameZh: true, nameEn: true, role: true, emoji: true },
      },
      children: {
        where: { archived: false },
        orderBy: { order: "asc" },
        select: { id: true, nameZh: true, nameEn: true, emoji: true, userAccount: { select: { username: true, disabled: true } } },
      },
      _count: { select: { rewards: true, redemptions: true, logs: true } },
    },
  });
  if (!family) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin" className="btn btn-ghost text-sm">← 返回家庭管理</Link>
      <AdminFamilyDetailClient
        family={{
          id: family.id,
          nameZh: family.nameZh,
          nameEn: family.nameEn,
          counts: family._count,
        }}
        accounts={family.accounts}
        members={family.members}
        children_={family.children}
      />
    </div>
  );
}

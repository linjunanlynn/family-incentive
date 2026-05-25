import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertSuperAdmin } from "@/lib/guard";
import { FamiliesAdminClient } from "@/components/FamiliesAdminClient";

export default async function AdminPage() {
  const session = await assertSuperAdmin();
  if (!session) redirect("/");

  const families = await prisma.family.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { children: true } },
      accounts: {
        where: { accountKind: "family_admin" },
        orderBy: { username: "asc" },
        select: { username: true, disabled: true },
      },
    },
  });

  return (
    <FamiliesAdminClient
      families={families.map((family) => ({
        id: family.id,
        nameZh: family.nameZh,
        nameEn: family.nameEn,
        childrenCount: family._count.children,
        admins: family.accounts,
      }))}
    />
  );
}

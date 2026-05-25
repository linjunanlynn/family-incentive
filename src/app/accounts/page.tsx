import { prisma } from "@/lib/prisma";
import { getDict } from "@/i18n/server";
import { assertAdmin } from "@/lib/guard";
import { redirect } from "next/navigation";
import { AccountsAdmin } from "@/components/AccountsAdmin";
import { childWhereFor, memberWhereFor } from "@/lib/family-scope";

export default async function AccountsPage() {
  const session = await assertAdmin();
  if (!session) {
    redirect("/");
  }
  const { t } = await getDict();

  const [accounts, members, children] = await Promise.all([
    prisma.userAccount.findMany({
      where: session.kind === "super_admin" ? {} : { familyId: session.familyId ?? "__no_family__" },
      orderBy: { username: "asc" },
      select: {
        id: true,
        username: true,
        accountKind: true,
        disabled: true,
        memberId: true,
        childId: true,
        member: { select: { nameZh: true, nameEn: true } },
        child: { select: { nameZh: true, nameEn: true } },
      },
    }),
    prisma.member.findMany({
      where: memberWhereFor(session),
      orderBy: { createdAt: "asc" },
      select: { id: true, nameZh: true, nameEn: true, userAccount: { select: { id: true } } },
    }),
    prisma.child.findMany({
      where: { archived: false, ...childWhereFor(session) },
      orderBy: { order: "asc" },
      select: { id: true, nameZh: true, nameEn: true, userAccount: { select: { id: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t.auth.accountsTitle}</h1>
      <AccountsAdmin accounts={accounts} members={members} children_={children} viewerKind={session.kind} />
    </div>
  );
}

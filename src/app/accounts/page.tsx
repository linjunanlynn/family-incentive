import { prisma } from "@/lib/prisma";
import { getDict } from "@/i18n/server";
import { assertAdmin } from "@/lib/guard";
import { redirect } from "next/navigation";
import { AccountsAdmin } from "@/components/AccountsAdmin";

export default async function AccountsPage() {
  if (!(await assertAdmin())) {
    redirect("/");
  }
  const { t } = await getDict();

  const [accounts, members, children] = await Promise.all([
    prisma.userAccount.findMany({
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
      orderBy: { createdAt: "asc" },
      select: { id: true, nameZh: true, nameEn: true, userAccount: { select: { id: true } } },
    }),
    prisma.child.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
      select: { id: true, nameZh: true, nameEn: true, userAccount: { select: { id: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t.auth.accountsTitle}</h1>
      <AccountsAdmin accounts={accounts} members={members} children={children} />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createFamilyAdminAction,
  resetFamilyAdminPasswordAction,
  setFamilyAdminDisabledAction,
} from "@/app/actions/families";
import { useI18n } from "@/i18n/I18nProvider";

type AccountRow = {
  id: string;
  username: string;
  accountKind: string;
  disabled: boolean;
  member: { id: string; nameZh: string; nameEn: string; emoji: string } | null;
  child: { id: string; nameZh: string; nameEn: string; emoji: string } | null;
};

export function AdminFamilyDetailClient({
  family,
  accounts,
  members,
  children_,
}: {
  family: { id: string; nameZh: string; nameEn: string; counts: { rewards: number; redemptions: number; logs: number } };
  accounts: AccountRow[];
  members: { id: string; nameZh: string; nameEn: string; role: string; emoji: string }[];
  children_: { id: string; nameZh: string; nameEn: string; emoji: string; userAccount: { username: string; disabled: boolean } | null }[];
}) {
  const { locale, pick } = useI18n();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState({ username: "", password: "", nameZh: "", nameEn: "" });

  const familyAdmins = accounts.filter((a) => a.accountKind === "family_admin");
  const parentAccounts = accounts.filter((a) => a.accountKind === "parent");

  function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await createFamilyAdminAction({ familyId: family.id, ...draft });
      if (res.ok) {
        toast.success(locale === "zh" ? "家庭管理员已创建" : "Family admin created");
        setDraft({ username: "", password: "", nameZh: "", nameEn: "" });
        router.refresh();
      } else {
        toast.error(res.error === "taken" ? (locale === "zh" ? "账号已存在" : "Username taken") : "Failed");
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="card p-4">
        <h1 className="text-xl font-semibold">{pick(family)}</h1>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <Stat label={locale === "zh" ? "家长成员" : "Parents"} value={members.length} />
          <Stat label={locale === "zh" ? "孩子" : "Children"} value={children_.length} />
          <Stat label={locale === "zh" ? "奖励" : "Rewards"} value={family.counts.rewards} />
          <Stat label={locale === "zh" ? "记录" : "Logs"} value={family.counts.logs} />
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold">{locale === "zh" ? "家庭管理员账号" : "Family admin accounts"}</h2>
        <form onSubmit={createAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Field label="管理员中文名" value={draft.nameZh} onChange={(nameZh) => setDraft((d) => ({ ...d, nameZh }))} />
          <Field label="Admin name" value={draft.nameEn} onChange={(nameEn) => setDraft((d) => ({ ...d, nameEn }))} />
          <Field label="账号" value={draft.username} onChange={(username) => setDraft((d) => ({ ...d, username }))} />
          <Field label="密码" type="password" value={draft.password} onChange={(password) => setDraft((d) => ({ ...d, password }))} />
          <div className="sm:col-span-2 lg:col-span-4">
            <button className="btn btn-primary" type="submit">{locale === "zh" ? "新增家庭管理员" : "Add family admin"}</button>
          </div>
        </form>
        <AccountTable
          rows={familyAdmins}
          onRefresh={() => router.refresh()}
          canToggle
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold">{locale === "zh" ? "家长成员" : "Parent members"}</h2>
          <MemberList members={members} parentAccounts={parentAccounts} />
        </div>
        <div className="card p-4 space-y-3">
          <h2 className="font-semibold">{locale === "zh" ? "孩子成员" : "Child members"}</h2>
          {children_.length === 0 ? (
            <div className="text-sm text-[color:var(--foreground-muted)]">
              {locale === "zh" ? "还没有孩子。家庭管理员可在“家庭成员”里创建孩子账号。" : "No children yet. The family admin can create child accounts from Members."}
            </div>
          ) : (
            children_.map((child) => (
              <div key={child.id} className="flex items-center justify-between gap-2 rounded-xl border border-[color:var(--border)] p-3">
                <div className="min-w-0">
                  <div className="font-medium">{child.emoji} {pick(child)}</div>
                  <div className="text-xs text-[color:var(--foreground-muted)] font-mono">
                    {child.userAccount?.username ?? "no account"}
                    {child.userAccount?.disabled ? " · disabled" : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function AccountTable({ rows, onRefresh, canToggle }: { rows: AccountRow[]; onRefresh: () => void; canToggle?: boolean }) {
  const { locale, pick } = useI18n();
  const [, startTransition] = useTransition();
  if (rows.length === 0) return <div className="text-sm text-[color:var(--foreground-muted)]">—</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-[color:var(--border)]">
              <td className="py-2 pr-3 font-mono">{row.username}</td>
              <td className="py-2 pr-3">{row.member ? pick(row.member) : row.child ? pick(row.child) : "—"}</td>
              <td className="py-2 pr-3 text-[color:var(--foreground-muted)]">{row.disabled ? "disabled" : "enabled"}</td>
              <td className="py-2">
                <div className="flex gap-2">
                  <ResetPassword id={row.id} onDone={onRefresh} />
                  {canToggle ? (
                    <button
                      className="btn btn-ghost text-xs"
                      onClick={() =>
                        startTransition(async () => {
                          await setFamilyAdminDisabledAction(row.id, !row.disabled);
                          onRefresh();
                        })
                      }
                    >
                      {row.disabled ? (locale === "zh" ? "启用" : "Enable") : (locale === "zh" ? "禁用" : "Disable")}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResetPassword({ id, onDone }: { id: string; onDone: () => void }) {
  const { locale } = useI18n();
  const [password, setPassword] = useState("");
  const [, startTransition] = useTransition();
  return (
    <div className="flex gap-1">
      <input
        className="input h-9 w-28 text-xs"
        type="password"
        placeholder={locale === "zh" ? "新密码" : "New password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="btn btn-ghost text-xs"
        onClick={() =>
          startTransition(async () => {
            const res = await resetFamilyAdminPasswordAction(id, password);
            if (res.ok) {
              toast.success(locale === "zh" ? "密码已重置" : "Password reset");
              setPassword("");
              onDone();
            } else {
              toast.error("Failed");
            }
          })
        }
      >
        {locale === "zh" ? "重置" : "Reset"}
      </button>
    </div>
  );
}

function MemberList({ members, parentAccounts }: { members: { id: string; nameZh: string; nameEn: string; role: string; emoji: string }[]; parentAccounts: AccountRow[] }) {
  const { pick } = useI18n();
  const accountByMember = new Map(parentAccounts.map((a) => [a.member?.id, a]));
  return (
    <div className="space-y-2">
      {members.map((member) => {
        const account = accountByMember.get(member.id);
        return (
          <div key={member.id} className="rounded-xl border border-[color:var(--border)] p-3">
            <div className="font-medium">{member.emoji} {pick(member)}</div>
            <div className="text-xs text-[color:var(--foreground-muted)]">
              {member.role} · <span className="font-mono">{account?.username ?? "no account"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[color:var(--surface-2)] p-3">
      <div className="text-xs text-[color:var(--foreground-muted)]">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-xs text-[color:var(--foreground-muted)]">
      {label}
      <input className="input mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </label>
  );
}

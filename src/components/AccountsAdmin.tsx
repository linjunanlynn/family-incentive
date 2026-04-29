"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Dict } from "@/i18n/dictionaries";
import type { AccountKind } from "@/auth/jwt";
import { useI18n } from "@/i18n/I18nProvider";
import {
  createUserAccountAction,
  deleteUserAccountAction,
  resetUserPasswordAction,
  setUserDisabledAction,
} from "@/app/actions/accounts";
import { useRouter } from "next/navigation";

function mapCreateAccountError(code: string, t: Dict): string {
  switch (code) {
    case "forbidden":
      return t.auth.errForbidden;
    case "username":
      return t.auth.errUsername;
    case "password":
      return t.auth.errPassword;
    case "link":
      return t.auth.errLink;
    case "taken":
      return t.auth.errTaken;
    case "memberTaken":
      return t.auth.errMemberTaken;
    case "childTaken":
      return t.auth.errChildTaken;
    default:
      return t.common.failed;
  }
}

type Row = {
  id: string;
  username: string;
  accountKind: string;
  disabled: boolean;
  memberId: string | null;
  childId: string | null;
  member: { nameZh: string; nameEn: string } | null;
  child: { nameZh: string; nameEn: string } | null;
};

export function AccountsAdmin({
  accounts,
  members,
  children,
}: {
  accounts: Row[];
  members: { id: string; nameZh: string; nameEn: string; userAccount: { id: string } | null }[];
  children: { id: string; nameZh: string; nameEn: string; userAccount: { id: string } | null }[];
}) {
  const { t, locale, pick } = useI18n();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [kind, setKind] = useState<AccountKind>("parent");
  const [linkMemberId, setLinkMemberId] = useState("");
  const [linkChildId, setLinkChildId] = useState("");

  function kindLabel(k: string) {
    if (k === "parent_admin") return t.auth.kindAdmin;
    if (k === "parent") return t.auth.kindParent;
    return t.auth.kindChild;
  }

  function createAccount(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const memberId = kind === "child" ? null : linkMemberId || null;
      const childId = kind === "child" ? linkChildId || null : null;
      const res = await createUserAccountAction({
        username,
        password,
        accountKind: kind,
        memberId,
        childId,
      });
      if (res.ok) {
        toast.success(t.common.success);
        setUsername("");
        setPassword("");
        router.refresh();
      } else {
        toast.error(mapCreateAccountError(res.error, t));
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="card p-4 space-y-3">
        <div className="font-medium">{t.auth.createAccount}</div>
        <form onSubmit={createAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.username}</label>
            <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.password}</label>
            <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.accountKind}</label>
            <select className="input mt-1" value={kind} onChange={(e) => setKind(e.target.value as AccountKind)}>
              <option value="parent_admin">{t.auth.kindAdmin}</option>
              <option value="parent">{t.auth.kindParent}</option>
              <option value="child">{t.auth.kindChild}</option>
            </select>
          </div>
          {kind === "child" ? (
            <div>
              <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.linkChild}</label>
              <select className="input mt-1" value={linkChildId} onChange={(e) => setLinkChildId(e.target.value)} required>
                <option value="">—</option>
                {children
                  .filter((c) => !c.userAccount)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {pick(c)}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.linkMember}</label>
              <select className="input mt-1" value={linkMemberId} onChange={(e) => setLinkMemberId(e.target.value)} required>
                <option value="">—</option>
                {members
                  .filter((m) => !m.userAccount)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {pick(m)}
                    </option>
                  ))}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <button type="submit" className="btn btn-primary">
              {t.auth.createAccount}
            </button>
          </div>
        </form>
      </section>

      <section className="card overflow-hidden -mx-3 px-0 sm:mx-0 sm:px-0">
        <div className="overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
        <table className="w-full text-sm min-w-[36rem] sm:min-w-0">
          <thead className="bg-[color:var(--surface-2)] text-left">
            <tr>
              <th className="p-3">{t.auth.username}</th>
              <th className="p-3">{t.auth.accountKind}</th>
              <th className="p-3">{t.auth.accountStatus}</th>
              <th className="p-3">{locale === "zh" ? "关联" : "Linked"}</th>
              <th className="p-3">{t.common.edit}</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t border-[color:var(--border)]">
                <td className="p-3 font-mono">{a.username}</td>
                <td className="p-3">{kindLabel(a.accountKind)}</td>
                <td className="p-3 text-[color:var(--foreground-muted)]">
                  {a.disabled ? t.auth.disabled : t.auth.enabled}
                </td>
                <td className="p-3 text-[color:var(--foreground-muted)]">
                  {a.member ? pick(a.member) : a.child ? pick(a.child) : "—"}
                </td>
                <td className="p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1">
                  <ResetPwd id={a.id} onDone={() => router.refresh()} />
                  <button
                    type="button"
                    className="btn btn-ghost text-xs justify-center min-h-10"
                    onClick={() =>
                      startTransition(async () => {
                        await setUserDisabledAction(a.id, !a.disabled);
                        router.refresh();
                      })
                    }
                  >
                    {a.disabled ? t.auth.enableAccount : t.auth.disableAccount}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-xs text-[color:var(--negative)] justify-center min-h-10"
                    onClick={() => {
                      if (!confirm(t.manage.confirmDelete)) return;
                      startTransition(async () => {
                        await deleteUserAccountAction(a.id);
                        router.refresh();
                      });
                    }}
                  >
                    {t.common.delete}
                  </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}

function ResetPwd({ id, onDone }: { id: string; onDone: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pwd, setPwd] = useState("");
  const [, startTransition] = useTransition();
  return (
    <>
      <button type="button" className="btn btn-ghost text-xs" onClick={() => setOpen(true)}>
        {t.auth.resetPassword}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="card p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="font-medium mb-2">{t.auth.resetPassword}</div>
            <input type="password" className="input" placeholder={t.auth.newPassword} value={pwd} onChange={(e) => setPwd(e.target.value)} />
            <div className="flex justify-end gap-2 mt-3">
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                {t.common.cancel}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  startTransition(async () => {
                    const ok = await resetUserPasswordAction(id, pwd);
                    if (ok) {
                      toast.success(t.common.success);
                      setOpen(false);
                      setPwd("");
                      onDone();
                    } else toast.error(t.common.failed);
                  })
                }
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

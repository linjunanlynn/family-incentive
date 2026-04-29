"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/app/actions/auth";
import { useI18n } from "@/i18n/I18nProvider";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await loginAction(username, password);
      if (res.ok) {
        const from = sp.get("from");
        router.push(from && from.startsWith("/") ? from : "/");
        router.refresh();
      } else {
        toast.error(t.auth.invalid);
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.username}</label>
        <input
          className="input mt-1"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={pending}
        />
      </div>
      <div>
        <label className="text-xs text-[color:var(--foreground-muted)]">{t.auth.password}</label>
        <input
          type="password"
          className="input mt-1"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {t.auth.submit}
      </button>
    </form>
  );
}

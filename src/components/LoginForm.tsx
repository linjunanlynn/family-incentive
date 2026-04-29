"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { loginAction } from "@/app/actions/auth";
import { useI18n } from "@/i18n/I18nProvider";
import {
  readLastUsername,
  readSavedUsernames,
  rememberSuccessfulLogin,
} from "@/lib/login-device-history";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const listId = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [savedUsernames, setSavedUsernames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pending, startTransition] = useTransition();
  const blurCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const last = readLastUsername();
    setSavedUsernames(readSavedUsernames());
    if (last) setUsername(last);
    return () => {
      if (blurCloseTimer.current) clearTimeout(blurCloseTimer.current);
    };
  }, []);

  function clearBlurClose() {
    if (blurCloseTimer.current) {
      clearTimeout(blurCloseTimer.current);
      blurCloseTimer.current = null;
    }
  }

  function scheduleCloseSuggestions() {
    clearBlurClose();
    blurCloseTimer.current = setTimeout(() => setShowSuggestions(false), 160);
  }

  function pickSaved(u: string) {
    clearBlurClose();
    setUsername(u);
    setShowSuggestions(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await loginAction(username, password);
      if (res.ok) {
        rememberSuccessfulLogin(username);
        setSavedUsernames(readSavedUsernames());
        const from = sp.get("from");
        router.push(from && from.startsWith("/") ? from : "/");
        router.refresh();
      } else {
        toast.error(t.auth.invalid);
      }
    });
  }

  const canShowList = showSuggestions && savedUsernames.length > 0;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="relative">
        <label className="text-xs text-[color:var(--foreground-muted)]" htmlFor="login-username">
          {t.auth.username}
        </label>
        <input
          id="login-username"
          className="input mt-1"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={() => {
            clearBlurClose();
            setShowSuggestions(true);
          }}
          onClick={() => {
            clearBlurClose();
            setShowSuggestions(true);
          }}
          onBlur={scheduleCloseSuggestions}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              clearBlurClose();
              setShowSuggestions(false);
            }
          }}
          disabled={pending}
          aria-expanded={canShowList}
          aria-controls={canShowList ? listId : undefined}
          aria-autocomplete="list"
        />
        {canShowList ? (
          <div
            id={listId}
            role="listbox"
            className="absolute z-20 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg py-1"
          >
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-[color:var(--foreground-muted)]">
              {t.auth.savedOnThisDevice}
            </div>
            {savedUsernames.map((u) => (
              <button
                key={u}
                type="button"
                role="option"
                aria-selected={u === username}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] touch-manipulation"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickSaved(u);
                }}
              >
                {u}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div>
        <label className="text-xs text-[color:var(--foreground-muted)]" htmlFor="login-password">
          {t.auth.password}
        </label>
        <input
          id="login-password"
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Calendar,
  CheckSquare,
  ChevronDown,
  Languages,
  LogOut,
  Settings,
  Shield,
  UserCog,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Dict } from "@/i18n/dictionaries";
import type { AccountKind } from "@/auth/jwt";
import { cn } from "@/lib/utils";
import { setCurrentChildAction } from "@/app/actions/session";
import { logoutAction } from "@/app/actions/auth";

type ChildLite = {
  id: string;
  nameZh: string;
  nameEn: string;
  emoji: string;
  color: string;
};

export type TopBarSession = {
  kind: AccountKind;
  username: string;
  nameZh: string;
  nameEn: string;
};

export function TopBar({
  t,
  children_,
  currentChildId,
  session,
}: {
  t: Dict;
  children_: ChildLite[];
  currentChildId: string | null;
  session: TopBarSession | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentChild =
    children_.find((c) => c.id === currentChildId) ?? children_[0] ?? null;

  const isAdmin = session?.kind === "parent_admin";
  const isChild = session?.kind === "child";

  const coreNav = [
    { href: "/", label: t.nav.dashboard, icon: Calendar, show: true },
    { href: "/checkin", label: t.nav.checkin, icon: CheckSquare, show: !isChild },
  ].filter((x) => x.show);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function selectChild(id: string) {
    startTransition(async () => {
      await setCurrentChildAction(id);
    });
  }

  async function logout() {
    setMenuOpen(false);
    await logoutAction();
    router.push("/");
    router.refresh();
    toast.success(t.auth.loggedOut);
  }

  const onLoginPage = pathname.startsWith("/login");
  const loginHref = `/login?from=${encodeURIComponent(pathname || "/")}`;

  return (
    <header className="sticky top-0 z-30 bg-[color:var(--background)]/80 backdrop-blur border-b border-[color:var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight shrink-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[color:var(--primary)] text-white text-lg">
            ✨
          </span>
          <span className="hidden sm:inline">{t.appName}</span>
        </Link>

        {children_.length > 0 && (
          <div className="ml-1 sm:ml-2 flex items-center gap-1 card-2 rounded-full p-1 min-w-0 overflow-x-auto shrink">
            {children_.map((c) => {
              const active = c.id === currentChild?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectChild(c.id)}
                  disabled={isChild}
                  className={cn(
                    "px-2.5 sm:px-3 h-8 rounded-full inline-flex items-center gap-1.5 text-sm transition-colors shrink-0",
                    active
                      ? "bg-[color:var(--surface)] shadow-sm text-[color:var(--foreground)]"
                      : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]",
                    isChild && "cursor-default opacity-90",
                  )}
                  style={active ? { boxShadow: `inset 0 0 0 2px ${c.color}33` } : undefined}
                >
                  <span aria-hidden>{c.emoji}</span>
                  <span className="max-w-[5.5rem] sm:max-w-none truncate">{pick(c)}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 min-w-2" />

        <nav className="hidden md:flex items-center gap-1 shrink-0">
          {coreNav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "btn btn-ghost gap-2",
                  active && "bg-[color:var(--surface-2)] text-[color:var(--foreground)]",
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="btn btn-ghost gap-2 shrink-0"
          title="Language"
        >
          <Languages className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wide">{locale === "zh" ? "中" : "EN"}</span>
        </button>

        {!session && !onLoginPage && (
          <Link href={loginHref} className="btn btn-primary text-sm shrink-0">
            {t.auth.logIn}
          </Link>
        )}

        {session && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={t.auth.userMenu}
              onClick={() => setMenuOpen((o) => !o)}
              className={cn(
                "btn btn-ghost gap-1.5 max-w-[10rem] sm:max-w-[12rem]",
                menuOpen && "bg-[color:var(--surface-2)]",
              )}
            >
              <span className="text-lg shrink-0" aria-hidden>
                {session.kind === "child" ? "🧒" : "👤"}
              </span>
              <span className="hidden sm:inline truncate text-sm text-[color:var(--foreground)] max-w-[6rem] md:max-w-[10rem]">
                {locale === "zh" ? session.nameZh : session.nameEn}
              </span>
              <ChevronDown
                className={cn("w-4 h-4 shrink-0 text-[color:var(--foreground-muted)] transition-transform", menuOpen && "rotate-180")}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg py-1 z-50"
              >
                {isAdmin && (
                  <>
                    <Link
                      role="menuitem"
                      href="/manage"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[color:var(--surface-2)]"
                    >
                      <Settings className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                      {t.nav.manage}
                    </Link>
                    <Link
                      role="menuitem"
                      href="/members"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[color:var(--surface-2)]"
                    >
                      <UserCog className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                      {t.nav.members}
                    </Link>
                    <Link
                      role="menuitem"
                      href="/accounts"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[color:var(--surface-2)]"
                    >
                      <Shield className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                      {t.nav.accounts}
                    </Link>
                    <div className="my-1 h-px bg-[color:var(--border)]" />
                  </>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void logout()}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-[color:var(--surface-2)]"
                >
                  <LogOut className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                  {t.auth.logout}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="md:hidden flex items-center justify-around gap-1 px-2 pb-2 pt-0.5">
        {coreNav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 mx-0.5 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs",
                active
                  ? "bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
                  : "text-[color:var(--foreground-muted)]",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Home, Languages, LogOut, Settings, Shield, Sparkles, UserCog } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
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
  avatarUrl: string | null;
  backgroundUrl: string | null;
};

export type TopBarSession = {
  kind: AccountKind;
  username: string;
  nameZh: string;
  nameEn: string;
};

export function TopBar({
  children_,
  currentChildId,
  session,
}: {
  children_: ChildLite[];
  currentChildId: string | null;
  session: TopBarSession | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale, pick } = useI18n();
  const [, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentChild =
    children_.find((c) => c.id === currentChildId) ?? children_[0] ?? null;

  const canManageConfig =
    session?.kind === "super_admin" || session?.kind === "family_admin" || session?.kind === "parent";
  const canManageFamily = session?.kind === "super_admin" || session?.kind === "family_admin";
  const isChild = session?.kind === "child";

  useEffect(() => {
    if (!menuOpen) return;
    function closeIfOutside(target: EventTarget | null) {
      if (target instanceof Element && target.closest("[data-fi-account-menu]")) return;
      setMenuOpen(false);
    }
    function onDoc(e: MouseEvent) {
      closeIfOutside(e.target);
    }
    function onTouchEnd(e: TouchEvent) {
      closeIfOutside(e.target);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function selectChild(id: string) {
    startTransition(async () => {
      await setCurrentChildAction(id);
      if (session?.kind === "super_admin" || pathname.startsWith("/admin")) {
        router.push("/");
      }
      router.refresh();
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

  const childStrip = (
    <div
      className={cn(
        "flex items-center gap-1 min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]",
        /* Mobile: sits in top bar between logo and actions — grow + scroll, not a second row */
        "w-full max-w-full md:w-auto md:max-w-[min(100%,28rem)] md:ml-1",
      )}
    >
      {children_.map((c) => {
        const active = c.id === currentChild?.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => selectChild(c.id)}
            disabled={isChild}
            className={cn(
              "px-3 sm:px-3 min-h-10 sm:min-h-8 h-10 sm:h-8 rounded-xl inline-flex items-center gap-1.5 text-sm transition-colors shrink-0 touch-manipulation whitespace-nowrap",
              active
                ? "bg-[color:var(--surface)] shadow-sm text-[color:var(--foreground)]"
                : "text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)] hover:bg-[color:color-mix(in_srgb,var(--foreground)_4%,transparent)]",
              isChild && "cursor-default opacity-90",
            )}
            style={active ? { boxShadow: `inset 0 0 0 2px ${c.color}33` } : undefined}
          >
            <span
              aria-hidden
              className="w-5 h-5 rounded-full inline-flex items-center justify-center overflow-hidden shrink-0"
              style={{ background: `${c.color}22`, color: c.color }}
            >
              {c.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                c.emoji
              )}
            </span>
            <span>{pick(c)}</span>
          </button>
        );
      })}
    </div>
  );

  const brandLink = (
    <Link
      href="/"
      className="flex items-center gap-2 font-semibold tracking-tight shrink-0 min-h-11 min-w-11 sm:min-w-0 sm:min-h-0 rounded-lg sm:rounded-none -ml-0.5 px-1 sm:px-0 active:opacity-80"
    >
      <span className="inline-flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-[color:var(--primary)] text-white text-lg shrink-0">
        ✨
      </span>
      <span className="hidden sm:inline truncate max-w-[10rem] md:max-w-none">{t.appName}</span>
    </Link>
  );

  const langButton = (
    <button
      type="button"
      onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
      className="btn btn-ghost gap-2 shrink-0"
      title="Language"
    >
      <Languages className="w-4 h-4" />
      <span className="text-xs uppercase tracking-wide">{locale === "zh" ? "中" : "EN"}</span>
    </button>
  );

  const sessionOrLogin = session ? (
    <div className="relative shrink-0" data-fi-account-menu>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={t.auth.userMenu}
        onClick={() => setMenuOpen((o) => !o)}
        className={cn(
          "btn btn-ghost min-w-0 gap-1 sm:gap-1.5 max-w-[min(42vw,9rem)] sm:max-w-[12rem]",
          menuOpen && "bg-[color:var(--surface-2)]",
        )}
      >
        <span className="text-lg shrink-0" aria-hidden>
          {session.kind === "child" ? "🧒" : "👤"}
        </span>
        <span className="min-w-0 truncate text-left text-sm text-[color:var(--foreground)] max-w-[4.5rem] sm:max-w-[7rem] md:max-w-[10rem]">
          {locale === "zh" ? session.nameZh : session.nameEn}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 text-[color:var(--foreground-muted)] transition-transform", menuOpen && "rotate-180")}
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-[min(calc(100vw-1rem),14rem)] sm:w-56 rounded-xl border border-[color:var(--border)] bg-[color:var(--background)] shadow-lg py-1 z-50 max-sm:right-0 max-sm:origin-top-right"
        >
          {session?.kind === "super_admin" && (
            <Link
              role="menuitem"
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-3 sm:py-2.5 text-sm hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] min-h-11"
            >
              <Home className="w-4 h-4 text-[color:var(--foreground-muted)]" />
              {locale === "zh" ? "家庭管理" : "Families"}
            </Link>
          )}
          {canManageConfig && (
            <>
              <Link
                role="menuitem"
                href="/manage"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 sm:py-2.5 text-sm hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] min-h-11"
              >
                <Settings className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                {t.nav.manage}
              </Link>
              <Link
                role="menuitem"
                href="/rewards/manage"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 sm:py-2.5 text-sm hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] min-h-11"
              >
                <Sparkles className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                {t.nav.manageRewards}
              </Link>
              {canManageFamily && (
              <Link
                role="menuitem"
                href="/members"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 sm:py-2.5 text-sm hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] min-h-11"
              >
                <UserCog className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                {t.nav.members}
              </Link>
              )}
              {canManageFamily && (
              <Link
                role="menuitem"
                href="/accounts"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 sm:py-2.5 text-sm hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] min-h-11"
              >
                <Shield className="w-4 h-4 text-[color:var(--foreground-muted)]" />
                {t.nav.accounts}
              </Link>
              )}
              <div className="my-1 h-px bg-[color:var(--border)]" />
            </>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2 px-3 py-3 sm:py-2.5 text-sm text-left hover:bg-[color:var(--surface-2)] active:bg-[color:var(--surface-2)] min-h-11"
          >
            <LogOut className="w-4 h-4 text-[color:var(--foreground-muted)]" />
            {t.auth.logout}
          </button>
        </div>
      )}
    </div>
  ) : !onLoginPage ? (
    <Link href={loginHref} className="btn btn-primary text-sm shrink-0">
      {t.auth.logIn}
    </Link>
  ) : null;

  return (
    <header className="sticky top-0 z-30 bg-[color:var(--background)]/90 backdrop-blur-md border-b border-[color:var(--border)] supports-[backdrop-filter]:bg-[color:var(--background)]/75">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        {/* Narrow screens: one row — logo | child switcher (scroll) | lang + account */}
        <div className="flex md:hidden items-center gap-2 py-2 min-w-0">
          {brandLink}
          {children_.length > 0 ? <div className="flex-1 min-w-0">{childStrip}</div> : null}
          <div className="flex items-center gap-0.5 shrink-0">
            {langButton}
            {sessionOrLogin}
          </div>
        </div>

        {/* md+: single bar */}
        <div className="hidden md:flex h-14 items-center gap-3 min-w-0">
          {brandLink}
          {children_.length > 0 ? childStrip : null}
          <div className="flex-1 min-w-4" />
          {langButton}
          {sessionOrLogin}
        </div>
      </div>
    </header>
  );
}

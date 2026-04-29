import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLocale } from "@/i18n/server";
import { TopBar, type TopBarSession } from "@/components/TopBar";
import { prisma } from "@/lib/prisma";
import { getCurrentChildId } from "@/lib/session";
import { dict } from "@/i18n/dictionaries";
import { getSession } from "@/lib/get-session";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Incentive · 家庭激励墙",
  description: "Daily behavior check-ins and points for the whole family.",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const t = dict[locale];
  const raw = await getSession();

  let barSession: TopBarSession | null = null;
  if (raw) {
    let nameZh = raw.username;
    let nameEn = raw.username;
    if (raw.memberId) {
      const m = await prisma.member.findUnique({
        where: { id: raw.memberId },
        select: { nameZh: true, nameEn: true },
      });
      if (m) {
        nameZh = m.nameZh;
        nameEn = m.nameEn;
      }
    } else if (raw.childId) {
      const ch = await prisma.child.findUnique({
        where: { id: raw.childId },
        select: { nameZh: true, nameEn: true },
      });
      if (ch) {
        nameZh = ch.nameZh;
        nameEn = ch.nameEn;
      }
    }
    barSession = {
      kind: raw.kind,
      username: raw.username,
      nameZh,
      nameEn,
    };
  }

  const allChildren = await prisma.child.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
    select: { id: true, nameZh: true, nameEn: true, emoji: true, color: true },
  });

  const childrenForBar =
    raw?.kind === "child" && raw.childId
      ? allChildren.filter((c) => c.id === raw.childId)
      : allChildren;

  const currentChildId = await getCurrentChildId();
  const safeChildId =
    childrenForBar.find((c) => c.id === currentChildId)?.id ?? childrenForBar[0]?.id ?? null;

  return (
    <html
      lang={locale === "zh" ? "zh-CN" : "en"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col min-w-0 pt-[env(safe-area-inset-top,0px)]">
        <I18nProvider initialLocale={locale}>
          <TopBar
            children_={childrenForBar}
            currentChildId={safeChildId}
            session={barSession}
          />
          <main className="flex-1 w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {children}
          </main>
          <footer className="text-center text-xs text-[color:var(--foreground-muted)] py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            Family Incentive · {t.tagline}
          </footer>
          <Toaster
            position="top-center"
            richColors
            className="!top-[max(0.75rem,env(safe-area-inset-top))] sm:!top-4"
            toastOptions={{ className: "touch-manipulation" }}
          />
        </I18nProvider>
      </body>
    </html>
  );
}

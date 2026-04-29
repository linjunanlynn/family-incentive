import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE, type SessionClaims } from "@/auth/jwt";

function redirectLogin(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

function withSessionHeaders(res: NextResponse, session: SessionClaims | null) {
  if (session?.username) {
    res.headers.set("x-fi-kind", session.kind);
    if (session.memberId) res.headers.set("x-fi-member", session.memberId);
    if (session.childId) res.headers.set("x-fi-child", session.childId);
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const raw = req.cookies.get(SESSION_COOKIE)?.value;
  const session = raw ? await readSessionToken(raw) : null;
  const authed = !!(session?.username);

  if (pathname.startsWith("/checkin")) {
    if (authed && session && session.kind === "child") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return withSessionHeaders(NextResponse.next(), session);
  }

  if (
    pathname.startsWith("/manage") ||
    pathname.startsWith("/members") ||
    pathname.startsWith("/accounts")
  ) {
    if (!authed || !session) {
      return redirectLogin(req, pathname);
    }
    if (session.kind !== "parent_admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return withSessionHeaders(NextResponse.next(), session);
  }

  return withSessionHeaders(NextResponse.next(), session);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

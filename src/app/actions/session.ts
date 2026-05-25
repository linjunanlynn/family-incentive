"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CHILD_COOKIE } from "@/lib/session";
import { LOCALE_COOKIE } from "@/i18n/server";
import type { Locale } from "@/i18n/dictionaries";
import { getSession } from "@/lib/get-session";
import { canAccessChild } from "@/lib/family-scope";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function setLocaleAction(locale: Locale) {
  const c = await cookies();
  c.set(LOCALE_COOKIE, locale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function setCurrentChildAction(childId: string) {
  const s = await getSession();
  if (!(await canAccessChild(s, childId))) return;
  const c = await cookies();
  c.set(CHILD_COOKIE, childId, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  revalidatePath("/", "layout");
}

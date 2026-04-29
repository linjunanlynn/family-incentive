import { cookies } from "next/headers";
import { dict, DEFAULT_LOCALE, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "fi_locale";

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get(LOCALE_COOKIE)?.value;
  if (v === "zh" || v === "en") return v;
  return DEFAULT_LOCALE;
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: dict[locale] };
}

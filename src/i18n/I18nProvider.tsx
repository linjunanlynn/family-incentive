"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { dict, type Locale } from "./dictionaries";

type Ctx = {
  locale: Locale;
  t: typeof dict.zh;
  setLocale: (l: Locale) => void;
  /** Pick the right field from a {nameZh, nameEn} pair. */
  pick: <T extends { nameZh: string; nameEn: string }>(o: T) => string;
};

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    document.cookie = `fi_locale=${l};path=/;max-age=${60 * 60 * 24 * 365}`;
    document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: dict[locale],
      setLocale,
      pick: (o) => (locale === "zh" ? o.nameZh : o.nameEn),
    }),
    [locale, setLocale],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

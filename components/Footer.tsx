"use client";

import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const t = useTranslation();
  return (
    <footer className="bg-navy text-white/60 text-center text-xs py-3 px-4">
      <p>{t("officialNotice")}</p>
      <p className="mt-1 text-white/40">
        © {new Date().getFullYear()} {t("poweredBy")}
      </p>
    </footer>
  );
}

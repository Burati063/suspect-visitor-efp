"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/translations";

export default function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { locale, setLocale } = useLanguage();

  const base =
    "px-3 py-1.5 rounded-md text-sm font-semibold transition-colors";
  const active = dark
    ? "bg-gold text-navy"
    : "bg-navy text-white";
  const inactive = dark
    ? "text-white/70 hover:text-white"
    : "text-navy/60 hover:text-navy";

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: "EN" },
    { value: "am", label: "አማ" },
  ];

  return (
    <div className="inline-flex rounded-md border border-current/20 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          className={`${base} ${
            locale === opt.value ? active : inactive
          }`}
          aria-label={`Switch to ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

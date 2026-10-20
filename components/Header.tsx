"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const t = useTranslation();

  return (
    <header className="bg-navy text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/visitor" className="flex items-center gap-3 min-w-0">
          <Image
            src="/logo-bg.png"
            alt="Federal Police logo"
            width={44}
            height={44}
            className="shrink-0"
            priority
          />
          <div className="min-w-0 leading-tight">
            <div className="font-bold text-sm sm:text-base truncate">
              {t("police")}
            </div>
            <div className="text-xs truncate" style={{ color: "#e6c75c" }}>
              {t("bureau")}
            </div>
          </div>
        </Link>
        <LanguageToggle dark />
      </div>
    </header>
  );
}

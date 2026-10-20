"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

export default function VisitorHomePage() {
  const t = useTranslation();
  const router = useRouter();

  return (
    <div className="flex flex-col items-center pt-6">
      <Image
        src="/logo-bg.png"
        alt="Federal Police logo"
        width={96}
        height={96}
        priority
      />
      <h1 className="mt-4 text-xl font-bold text-navy text-center">
        {t("systemName")}
      </h1>
      <p className="mt-2 text-base text-slate-600 text-center font-medium">
        {t("chooseGenderPrompt")}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => router.push("/visitor/suspects?gender=male")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-navy text-white py-10 shadow-lg active:scale-95 transition-transform"
        >
          <span className="text-5xl">♂</span>
          <span className="text-lg font-bold">{t("man")}</span>
        </button>
        <button
          onClick={() => router.push("/visitor/suspects?gender=female")}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-navy-600 text-white py-10 shadow-lg active:scale-95 transition-transform"
        >
          <span className="text-5xl">♀</span>
          <span className="text-lg font-bold">{t("woman")}</span>
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Gender, Suspect } from "@/lib/types";

const statusClass: Record<string, string> = {
  not_here: "status-badge status-not_here",
  at_court: "status-badge status-at_court",
  released: "status-badge status-released",
  transferred: "status-badge status-transferred",
};

function SuspectsList() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gender = (searchParams.get("gender") as Gender) || "male";

  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("suspects")
        .select("*")
        .eq("gender", gender)
        .order("name", { ascending: true });
      setSuspects((data as Suspect[]) ?? []);
      setLoading(false);
    }
    load();
  }, [gender]);

  const filtered = suspects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <button
        onClick={() => router.push("/visitor")}
        className="mb-4 text-sm text-navy font-semibold hover:underline"
      >
        ← {t("selectGender")}
      </button>
      <h1 className="text-xl font-bold text-navy mb-1">
        {gender === "male" ? t("man") : t("woman")} — {t("suspects")}
      </h1>
      <p className="text-sm text-slate-500 mb-4">{t("selectSuspectToVisit")}</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchSuspect")}
        className="w-full rounded-lg border border-slate-300 px-3 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-navy"
      />

      {loading ? (
        <p className="text-center text-slate-400 py-10">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-10">{t("noSuspects")}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => router.push(`/visitor/scan/${s.id}`)}
              className="w-full flex items-center justify-between bg-white rounded-xl shadow px-4 py-3.5 text-left active:scale-[0.98] transition-transform"
            >
              <div>
                <div className="font-semibold text-navy">{s.name}</div>
                <span className={statusClass[s.status]}>
                  {t(
                    s.status === "not_here"
                      ? "notHere"
                      : s.status === "at_court"
                      ? "atCourt"
                      : s.status
                  )}
                </span>
              </div>
              <span className="text-navy text-xl">›</span>
            </button>
          ))}
          <p className="text-center text-xs text-slate-400 pt-2">
            {filtered.length} {t("suspectsFound")}
          </p>
        </div>
      )}
    </div>
  );
}

export default function VisitorSuspectsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 py-10 text-center">…</div>}>
      <SuspectsList />
    </Suspense>
  );
}

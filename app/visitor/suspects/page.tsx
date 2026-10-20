"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Gender, Suspect, SuspectStatus } from "@/lib/types";
import { canVisit } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/translations";

// Status badge colors for the visitor list
const statusClass: Record<SuspectStatus, string> = {
  available:   "status-badge bg-green-100 text-green-800 border border-green-300",
  not_here:    "status-badge status-not_here",
  at_court:    "status-badge status-at_court",
  released:    "status-badge bg-purple-100 text-purple-800",
  transferred: "status-badge status-transferred",
};

function statusLabel(t: (k: TranslationKey) => string, s: SuspectStatus) {
  switch (s) {
    case "available":   return t("available");
    case "not_here":    return t("notHere");
    case "at_court":    return t("atCourt");
    case "released":    return t("released");
    case "transferred": return t("transferred");
    default: return s;
  }
}

function SuspectsList() {
  const t = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gender = (searchParams.get("gender") as Gender) || "male";

  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  // Which suspect the visitor tried to click when they are not available
  const [blockedId, setBlockedId] = useState<string | null>(null);

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

  function handleSelect(suspect: Suspect) {
    if (!canVisit(suspect.status)) {
      // Show blocked message for this suspect, clear after 3s
      setBlockedId(suspect.id);
      setTimeout(() => setBlockedId(null), 3000);
      return;
    }
    router.push(`/visitor/scan/${suspect.id}`);
  }

  return (
    <div>
      <button
        onClick={() => router.push("/visitor")}
        className="mb-4 text-sm text-navy font-semibold hover:underline"
      >
        ← {t("selectGender")}
      </button>

      <h1 className="text-xl font-bold text-navy mb-1">
        {gender === "male" ? t("man") : t("woman")}
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
          {filtered.map((s) => {
            const ok = canVisit(s.status);
            const blocked = blockedId === s.id;
            return (
              <div key={s.id}>
                <button
                  onClick={() => handleSelect(s)}
                  className={`w-full flex items-center justify-between rounded-xl shadow px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
                    ok
                      ? "bg-white hover:bg-green-50 border-2 border-transparent hover:border-green-300"
                      : "bg-slate-100 opacity-80 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <div className={`font-semibold ${ok ? "text-navy" : "text-slate-500"}`}>
                      {s.name}
                    </div>
                    <span className={statusClass[s.status]}>
                      {statusLabel(t, s.status)}
                    </span>
                  </div>
                  <span className={`text-xl ${ok ? "text-green-600" : "text-slate-400"}`}>
                    {ok ? "›" : "✕"}
                  </span>
                </button>

                {/* Blocked message — shows inline below the card */}
                {blocked && (
                  <div className="mt-1 mx-1 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 flex items-center gap-2">
                    <span className="text-lg">🚫</span>
                    <span>{t("notAvailableMessage")}</span>
                  </div>
                )}
              </div>
            );
          })}
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

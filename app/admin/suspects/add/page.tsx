"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Gender, SuspectStatus } from "@/lib/types";

const STATUS_LIST: { value: SuspectStatus; icon: string }[] = [
  { value: "available",   icon: "🟢" },
  { value: "not_here",    icon: "⚪" },
  { value: "at_court",   icon: "🔵" },
  { value: "released",   icon: "🟣" },
  { value: "transferred",icon: "🟡" },
];

export default function AddSuspectPage() {
  const t = useTranslation();
  const router = useRouter();

  const [name,   setName]   = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [status, setStatus] = useState<SuspectStatus>("not_here");
  const [error,  setError]  = useState("");
  const [success,setSuccess]= useState(false);
  const [loading,setLoading]= useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError(t("missingFields"));
      return;
    }
    setLoading(true);

    const supabase = await getClient();
    const { error: insertError } = await supabase
      .from("suspects")
      .insert({ name: name.trim(), gender, status });

    setLoading(false);

    if (insertError) {
      // Show the real error so we can diagnose RLS / schema issues
      setError(`${t("addError")} (${insertError.message})`);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/suspects"), 900);
  }

  function statusLabel(s: SuspectStatus) {
    if (s === "available")   return t("available");
    if (s === "not_here")    return t("notHere");
    if (s === "at_court")    return t("atCourt");
    if (s === "released")    return t("released");
    if (s === "transferred") return t("transferred");
    return s;
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-navy mb-6">{t("addSuspect")}</h1>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-slate-500 mb-6">{t("addSuspectPrompt")}</p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("suspectName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder={t("suspectName")}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("gender")} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["male","female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    gender === g
                      ? "border-navy bg-navy text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-700 hover:border-navy/50"
                  }`}
                >
                  {g === "male" ? "♂ " : "♀ "}{t(g === "male" ? "male" : "female")}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_LIST.map(({ value, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-all text-left flex items-center gap-2 ${
                    status === value
                      ? "border-navy bg-navy text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-700 hover:border-navy/50"
                  }`}
                >
                  <span>{icon}</span>
                  {statusLabel(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
              ✓ {t("suspectAdded")}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-navy text-white font-semibold py-3 hover:bg-navy-600 transition-colors disabled:opacity-60"
            >
              {loading ? t("loading") : t("add")}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/suspects")}
              className="rounded-lg border-2 border-slate-300 text-slate-700 font-semibold px-5 py-3 hover:bg-slate-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

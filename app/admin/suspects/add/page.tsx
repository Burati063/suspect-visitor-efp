"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Gender } from "@/lib/types";

export default function AddSuspectPage() {
  const t = useTranslation();
  const router = useRouter();

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError(t("missingFields"));
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("suspects")
      .insert({
        name: name.trim(),
        gender,
        notes: notes.trim() || null,
        status: "not_here",
      });

    setLoading(false);
    if (insertError) {
      setError(t("addError"));
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/admin/suspects"), 800);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-navy mb-6">{t("addSuspect")}</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-slate-500 mb-5">{t("addSuspectPrompt")}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("suspectName")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder={t("suspectName")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("gender")} *
            </label>
            <div className="flex gap-3">
              {(["male", "female"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                    gender === g
                      ? "bg-navy text-white border-navy"
                      : "bg-white text-slate-700 border-slate-300 hover:border-navy"
                  }`}
                >
                  {t(g === "male" ? "man" : "woman")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t("notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-navy"
              placeholder={t("notes")}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
              {t("suspectAdded")}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-navy text-white font-semibold py-3 hover:bg-navy-600 transition-colors disabled:opacity-60"
            >
              {loading ? t("loading") : t("add")}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-slate-300 text-slate-700 font-semibold px-5 hover:bg-slate-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { Gender, Suspect, SuspectStatus } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/types";

const statusClass: Record<SuspectStatus, string> = {
  not_here: "status-badge status-not_here",
  at_court: "status-badge status-at_court",
  released: "status-badge status-released",
  transferred: "status-badge status-transferred",
};

export default function AdminSuspectsPage() {
  const t = useTranslation();
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | Gender>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | SuspectStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: sus }, { data: visits }] = await Promise.all([
      supabase.from("suspects").select("*").order("created_at", { ascending: false }),
      supabase.from("visits").select("suspect_id"),
    ]);

    setSuspects((sus as Suspect[]) ?? []);
    const counts: Record<string, number> = {};
    (visits ?? []).forEach((v) => {
      const id = (v as { suspect_id: string }).suspect_id;
      counts[id] = (counts[id] ?? 0) + 1;
    });
    setVisitCounts(counts);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function updateStatus(id: string, status: SuspectStatus) {
    setUpdatingId(id);
    const supabase = createClient();
    await supabase
      .from("suspects")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    setSuspects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    setUpdatingId(null);
  }

  const filtered = suspects.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (genderFilter !== "all" && s.gender !== genderFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-navy">{t("suspects")}</h1>
        <Link
          href="/admin/suspects/add"
          className="rounded-lg bg-navy text-white px-4 py-2 text-sm font-semibold hover:bg-navy-600"
        >
          ➕ {t("addSuspect")}
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchSuspect")}
          className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value as "all" | Gender)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="all">{t("filterByGender")}: {t("all")}</option>
          <option value="male">{t("male")}</option>
          <option value="female">{t("female")}</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | SuspectStatus)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="all">{t("filterByStatus")}: {t("all")}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(s === "not_here" ? "notHere" : s === "at_court" ? "atCourt" : s)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-slate-400">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-slate-400">{t("noSuspects")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">{t("suspectName")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("gender")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("status")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("visitCount")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("update")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-navy">{s.name}</td>
                    <td className="px-5 py-3">{t(s.gender === "male" ? "male" : "female")}</td>
                    <td className="px-5 py-3">
                      <span className={statusClass[s.status]}>
                        {t(
                          s.status === "not_here"
                            ? "notHere"
                            : s.status === "at_court"
                            ? "atCourt"
                            : s.status
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{visitCounts[s.id] ?? 0}</td>
                    <td className="px-5 py-3">
                      <select
                        value={s.status}
                        disabled={updatingId === s.id}
                        onChange={(e) =>
                          updateStatus(s.id, e.target.value as SuspectStatus)
                        }
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-navy disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {t(
                              opt === "not_here"
                                ? "notHere"
                                : opt === "at_court"
                                ? "atCourt"
                                : opt
                            )}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

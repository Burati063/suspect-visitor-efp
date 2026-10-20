"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface VisitRow {
  id: string;
  qr_code_data: string;
  visited_at: string;
  ticket_number: string;
  ticket_expiry: string;
  ticket_status: string;
  // Supabase join can return array or single object depending on FK direction;
  // use unknown and narrow below
  suspects: unknown;
  profiles: unknown;
}

export default function AdminVisitsPage() {
  const t = useTranslation();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("visits")
      .select(
        "id, qr_code_data, visited_at, ticket_number, ticket_expiry, ticket_status, suspects(name), profiles(full_name)"
      )
      .order("visited_at", { ascending: false })
      .limit(500);
    setVisits((data as VisitRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const filtered = visits.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      const suspectName = (Array.isArray(v.suspects)
        ? (v.suspects[0] as { name: string } | undefined)?.name
        : (v.suspects as { name: string } | null)?.name) ?? "";
      const visitorName = (Array.isArray(v.profiles)
        ? (v.profiles[0] as { full_name: string } | undefined)?.full_name
        : (v.profiles as { full_name: string } | null)?.full_name) ?? "";
      const hay = `${suspectName} ${visitorName} ${v.ticket_number}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateFilter) {
      const d = new Date(v.visited_at).toISOString().slice(0, 10);
      if (d !== dateFilter) return false;
    }
    return true;
  });

  function isExpired(v: VisitRow) {
    if (v.ticket_status === "expired") return true;
    return new Date(v.ticket_expiry).getTime() < Date.now();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">{t("visitHistoryTitle")}</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t("searchSuspect")} / ${t("visitorName")} / ${t("ticketNumber")}`}
          className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-slate-400">{t("loading")}</p>
        ) : filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-slate-400">{t("noRecords")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{t("ticketNumber")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("suspectName")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("visitorName")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("qrCode")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("timestamp")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("expiryTime")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{v.ticket_number}</td>
                    <td className="px-4 py-3 font-medium text-navy">
                      {(Array.isArray(v.suspects)
                        ? (v.suspects[0] as { name: string } | undefined)?.name
                        : (v.suspects as { name: string } | null)?.name) ?? t("unknown")}
                    </td>
                    <td className="px-4 py-3">
                      {(Array.isArray(v.profiles)
                        ? (v.profiles[0] as { full_name: string } | undefined)?.full_name
                        : (v.profiles as { full_name: string } | null)?.full_name) ?? t("unknown")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[120px] truncate">
                      {v.qr_code_data}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(v.visited_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(v.ticket_expiry).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`status-badge ${
                          isExpired(v)
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isExpired(v) ? t("expired") : t("valid")}
                      </span>
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

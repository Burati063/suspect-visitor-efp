"use client";

import { useEffect, useState, useCallback } from "react";
import { getClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface VisitRow {
  id: string;
  qr_code_data: string;   // This IS the visitor identity
  visited_at: string;
  ticket_number: string;
  ticket_expiry: string;
  ticket_status: string;
  suspects: unknown;       // joined
}

export default function AdminVisitsPage() {
  const t = useTranslation();
  const [visits, setVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    const supabase = await getClient();
    const { data } = await supabase
      .from("visits")
      .select("id, qr_code_data, visited_at, ticket_number, ticket_expiry, ticket_status, suspects(name)")
      .order("visited_at", { ascending: false })
      .limit(500);
    setVisits((data as VisitRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  function getSuspectName(v: VisitRow) {
    const s = v.suspects;
    return (Array.isArray(s)
      ? (s[0] as { name: string } | undefined)?.name
      : (s as { name: string } | null)?.name) ?? t("unknown");
  }

  const filtered = visits.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      const hay = `${getSuspectName(v)} ${v.qr_code_data} ${v.ticket_number}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (dateFilter) {
      const d = new Date(v.visited_at).toISOString().slice(0, 10);
      if (d !== dateFilter) return false;
    }
    return true;
  });

  function isExpired(v: VisitRow) {
    return new Date(v.ticket_expiry).getTime() < Date.now();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">{t("visitHistoryTitle")}</h1>
        <button
          onClick={fetchVisits}
          className="text-sm px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-600"
        >
          ↻ {t("loading").replace("...", "")} Refresh
        </button>
      </div>

      {/* Filters */}
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
        {(search || dateFilter) && (
          <button
            onClick={() => { setSearch(""); setDateFilter(""); }}
            className="text-sm text-slate-500 hover:text-red-600 px-2"
          >
            ✕ Clear
          </button>
        )}
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
                  {/* QR code data = visitor identity */}
                  <th className="text-left px-4 py-3 font-medium">{t("visitorName")} (QR)</th>
                  <th className="text-left px-4 py-3 font-medium">{t("timestamp")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("expiryTime")}</th>
                  <th className="text-left px-4 py-3 font-medium">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{v.ticket_number}</td>
                    <td className="px-4 py-3 font-medium text-navy">{getSuspectName(v)}</td>
                    {/* The scanned QR value is displayed as the visitor */}
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-navy">
                      {v.qr_code_data}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(v.visited_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(v.ticket_expiry).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${isExpired(v) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {isExpired(v) ? t("expired") : t("valid")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 px-4 py-2 border-t border-slate-100">
              {filtered.length} records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface RecentVisit {
  id: string;
  ticket_number: string;
  qr_code_data: string;
  visited_at: string;
  suspects: unknown;
}

export default function AdminDashboard() {
  const t = useTranslation();
  const [totalSuspects, setTotalSuspects] = useState<number>(0);
  const [totalVisits,   setTotalVisits]   = useState<number>(0);
  const [activeTickets, setActiveTickets] = useState<number>(0);
  const [recentVisits,  setRecentVisits]  = useState<RecentVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    async function load() {
      try {
        const supabase = await getClient();
        const [
          { count: s },
          { count: v },
          { count: a },
          { data: recent },
        ] = await Promise.all([
          supabase.from("suspects").select("*", { count: "exact", head: true }),
          supabase.from("visits").select("*",   { count: "exact", head: true }),
          supabase.from("visits").select("*",   { count: "exact", head: true })
            .gt("ticket_expiry", new Date().toISOString()),
          supabase.from("visits")
            .select("id, ticket_number, qr_code_data, visited_at, suspects(name)")
            .order("visited_at", { ascending: false })
            .limit(10),
        ]);
        setTotalSuspects(s ?? 0);
        setTotalVisits(v ?? 0);
        setActiveTickets(a ?? 0);
        setRecentVisits((recent as RecentVisit[]) ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection error");
      }
      setLoading(false);
    }
    load();
  }, []);

  function getSuspectName(v: RecentVisit) {
    const s = v.suspects;
    return (Array.isArray(s)
      ? (s[0] as { name: string } | undefined)?.name
      : (s as { name: string } | null)?.name) ?? t("unknown");
  }

  const stats = [
    { label: t("totalSuspects"), value: totalSuspects, color: "bg-blue-500" },
    { label: t("totalVisits"),   value: totalVisits,   color: "bg-emerald-500" },
    { label: t("activeTickets"), value: activeTickets, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">{t("dashboard")}</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-700">
          <strong>Configuration error:</strong> {error}
          <p className="mt-1 text-xs">Check Vercel → Settings → Environment Variables: <code>_SUPABASE_URL</code> and <code>_SUPABASE_ANON_KEY</code></p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${stat.color} text-white rounded-lg w-14 h-14 flex items-center justify-center text-2xl font-bold`}>
              {loading ? "…" : stat.value}
            </div>
            <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-navy">
          {t("recentVisits")}
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-8 text-center text-slate-400">{t("loading")}</p>
          ) : recentVisits.length === 0 ? (
            <p className="px-5 py-8 text-center text-slate-400">{t("noRecords")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">{t("ticketNumber")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("suspectName")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("visitorName")}</th>
                  <th className="text-left px-5 py-3 font-medium">{t("timestamp")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs">{v.ticket_number}</td>
                    <td className="px-5 py-3 font-medium text-navy">{getSuspectName(v)}</td>
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-slate-700">{v.qr_code_data}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(v.visited_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

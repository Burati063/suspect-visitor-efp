import { createClient } from "@/lib/supabase/server";
import { useTranslationServer } from "@/lib/i18n/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { t } = useTranslationServer();

  const [
    { count: totalSuspects },
    { count: totalVisits },
    { count: activeTickets },
  ] = await Promise.all([
    supabase.from("suspects").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("*", { count: "exact", head: true }),
    supabase
      .from("visits")
      .select("*", { count: "exact", head: true })
      .gt("ticket_expiry", new Date().toISOString()),
  ]);

  const { data: recentVisits } = await supabase
    .from("visits")
    .select("id, ticket_number, qr_code_data, visited_at, ticket_status, suspects(name)")
    .order("visited_at", { ascending: false })
    .limit(10);

  const stats = [
    { label: t("totalSuspects"), value: totalSuspects ?? 0, color: "bg-blue-500" },
    { label: t("totalVisits"),   value: totalVisits   ?? 0, color: "bg-emerald-500" },
    { label: t("activeTickets"), value: activeTickets ?? 0, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">{t("dashboard")}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${stat.color} text-white rounded-lg w-14 h-14 flex items-center justify-center text-2xl font-bold`}>
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent visits */}
      <div className="bg-white rounded-xl shadow">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-navy">
          {t("recentVisits")}
        </div>
        <div className="overflow-x-auto">
          {recentVisits && recentVisits.length > 0 ? (
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
                {recentVisits.map((v) => {
                  const row = v as Record<string, unknown>;
                  const suspectArr = row.suspects;
                  const suspectName = Array.isArray(suspectArr)
                    ? (suspectArr[0] as { name: string } | undefined)?.name
                    : (suspectArr as { name: string } | null)?.name;
                  return (
                    <tr key={row.id as string} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs">{row.ticket_number as string}</td>
                      <td className="px-5 py-3 font-medium text-navy">{suspectName ?? t("unknown")}</td>
                      {/* QR code data IS the visitor identity */}
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.qr_code_data as string}</td>
                      <td className="px-5 py-3 text-slate-500">{new Date(row.visited_at as string).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-center text-slate-400">{t("noRecords")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

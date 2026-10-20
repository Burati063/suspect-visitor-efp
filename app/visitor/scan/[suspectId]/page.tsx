"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import QrScanner from "@/components/QrScanner";
import Ticket from "@/components/Ticket";

type Phase = "loading" | "scanning" | "creating" | "done" | "error";

export default function ScanPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams<{ suspectId: string }>();
  const suspectId = params.suspectId;

  const [phase, setPhase] = useState<Phase>("loading");
  const [suspect, setSuspect] = useState<{ name: string } | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<{
    ticket_number: string;
    suspectName: string;
    visitorName: string;
    createdAt: string;
    expiry: string;
    qrData: string;
  } | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Get the logged-in user first so we can filter the profile query
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(t("loginError"));
        setPhase("error");
        return;
      }

      const [{ data: sus }, { data: profile }] = await Promise.all([
        supabase.from("suspects").select("name").eq("id", suspectId).single(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single(),
      ]);

      if (!sus) {
        setError(t("noSuspects"));
        setPhase("error");
        return;
      }
      setSuspect(sus as { name: string });
      setVisitorName(
        (profile as { full_name: string } | null)?.full_name ?? t("unknown")
      );
      setPhase("scanning");
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suspectId]);

  async function handleScan(qrData: string) {
    if (phase !== "scanning") return;
    setPhase("creating");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(t("loginError"));
      setPhase("error");
      return;
    }

    const now = Date.now();
    const ticket_number = `SVS-${now}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
    const ticket_expiry = new Date(now + 30 * 60 * 1000).toISOString();

    const { data: visit, error: insertError } = await supabase
      .from("visits")
      .insert({
        suspect_id: suspectId,
        visitor_id: user.id,
        qr_code_data: qrData,
        ticket_number,
        ticket_expiry,
        ticket_status: "valid",
      })
      .select("id, visited_at")
      .single();

    if (insertError || !visit) {
      setError(insertError?.message ?? t("addError"));
      setPhase("error");
      return;
    }

    setTicket({
      ticket_number,
      suspectName: suspect?.name ?? t("unknown"),
      visitorName,
      createdAt: (visit as { visited_at: string }).visited_at,
      expiry: ticket_expiry,
      qrData,
    });
    setPhase("done");
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-navy font-semibold hover:underline"
      >
        ← {t("back")}
      </button>

      {phase === "loading" && (
        <p className="text-center text-slate-400 py-10">{t("loading")}</p>
      )}

      {phase === "error" && (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/visitor")}
            className="rounded-lg bg-navy text-white px-5 py-2.5 font-semibold"
          >
            {t("home")}
          </button>
        </div>
      )}

      {phase === "scanning" && (
        <div>
          <div className="text-center mb-4">
            <h1 className="text-lg font-bold text-navy">{t("scanQr")}</h1>
            {suspect && (
              <p className="text-sm text-slate-500">
                {t("scanningFor")}: <span className="font-semibold text-navy">{suspect.name}</span>
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl shadow p-3">
            <QrScanner onScan={handleScan} active={phase === "scanning"} />
          </div>
          <p className="text-center text-xs text-slate-500 mt-3 px-4">
            {t("pointCamera")}
          </p>
        </div>
      )}

      {phase === "creating" && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" />
          <p className="mt-4 text-navy font-semibold">{t("loading")}</p>
        </div>
      )}

      {phase === "done" && ticket && (
        <div>
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 text-3xl mb-2">
              ✓
            </div>
            <h1 className="text-lg font-bold text-green-700">{t("visitCreated")}</h1>
            <p className="text-xs text-slate-500 mt-1 px-4">{t("qrDataStored")}</p>
          </div>
          <Ticket
            ticketNumber={ticket.ticket_number}
            suspectName={ticket.suspectName}
            visitorName={ticket.visitorName}
            createdAt={ticket.createdAt}
            expiry={ticket.expiry}
          />
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400 mb-2 break-all px-4">
              {t("qrCode")}: <span className="font-mono">{ticket.qrData}</span>
            </p>
            <button
              onClick={() => router.push("/visitor")}
              className="rounded-lg bg-navy text-white px-6 py-3 font-semibold w-full"
            >
              {t("home")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

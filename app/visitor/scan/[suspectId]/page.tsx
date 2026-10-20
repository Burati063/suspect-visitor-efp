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
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<{
    ticket_number: string;
    suspectName: string;
    visitorQr: string;    // the scanned QR value = visitor identity
    createdAt: string;
    expiry: string;
  } | null>(null);

  // Load suspect name on mount — no auth required
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: sus, error: fetchError } = await supabase
        .from("suspects")
        .select("name")
        .eq("id", suspectId)
        .single();

      if (fetchError || !sus) {
        setError(t("noSuspects"));
        setPhase("error");
        return;
      }
      setSuspect(sus as { name: string });
      setPhase("scanning");
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suspectId]);

  // Called when the QR scanner decodes a value
  async function handleScan(qrData: string) {
    if (phase !== "scanning") return;
    setPhase("creating");

    const supabase = createClient();
    const now = Date.now();

    // Ticket number: unique ID for this visit
    const ticket_number = `SVS-${now}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    // Ticket valid for 30 minutes
    const ticket_expiry = new Date(now + 30 * 60 * 1000).toISOString();

    // Store visit: qr_code_data IS the visitor identifier (no user account needed)
    const { data: visit, error: insertError } = await supabase
      .from("visits")
      .insert({
        suspect_id:   suspectId,
        qr_code_data: qrData,        // the scanned digits/letters = who the visitor is
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
      visitorQr:   qrData,
      createdAt:   (visit as { visited_at: string }).visited_at,
      expiry:      ticket_expiry,
    });
    setPhase("done");
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-navy font-semibold hover:underline flex items-center gap-1"
      >
        ← {t("back")}
      </button>

      {/* Loading suspect */}
      {phase === "loading" && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" />
          <p className="mt-4 text-slate-500">{t("loading")}</p>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/visitor")}
            className="rounded-lg bg-navy text-white px-5 py-2.5 font-semibold"
          >
            {t("home")}
          </button>
        </div>
      )}

      {/* QR Scanner */}
      {phase === "scanning" && (
        <div>
          <div className="text-center mb-5">
            <h1 className="text-xl font-bold text-navy">{t("scanQr")}</h1>
            {suspect && (
              <p className="text-sm text-slate-500 mt-1">
                {t("scanningFor")}:{" "}
                <span className="font-bold text-navy">{suspect.name}</span>
              </p>
            )}
            <p className="text-xs text-slate-400 mt-2 px-4">
              {t("pointCamera")}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4">
            <QrScanner onScan={handleScan} active={phase === "scanning"} />
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 text-center">
            {t("cameraPermission")}
          </div>
        </div>
      )}

      {/* Saving */}
      {phase === "creating" && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-navy border-t-transparent" />
          <p className="mt-4 text-navy font-semibold">Saving visit…</p>
        </div>
      )}

      {/* Ticket displayed after successful scan */}
      {phase === "done" && ticket && (
        <div>
          {/* Success banner */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 text-4xl mb-2">
              ✓
            </div>
            <h1 className="text-lg font-bold text-green-700">{t("visitCreated")}</h1>
            <p className="text-xs text-slate-500 mt-1 px-4">{t("qrDataStored")}</p>
          </div>

          {/* Ticket card */}
          <Ticket
            ticketNumber={ticket.ticket_number}
            suspectName={ticket.suspectName}
            visitorName={ticket.visitorQr}   /* QR value shown as visitor */
            createdAt={ticket.createdAt}
            expiry={ticket.expiry}
          />

          {/* Raw QR value */}
          <div className="mt-4 bg-white rounded-xl shadow px-4 py-3 text-center">
            <p className="text-xs text-slate-400 mb-1">{t("qrCode")} (Visitor ID)</p>
            <p className="font-mono font-bold text-navy text-lg break-all">
              {ticket.visitorQr}
            </p>
          </div>

          <button
            onClick={() => router.push("/visitor")}
            className="mt-4 rounded-xl bg-navy text-white px-6 py-4 font-bold w-full text-base active:scale-95 transition-transform"
          >
            {t("home")}
          </button>
        </div>
      )}
    </div>
  );
}

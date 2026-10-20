"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageProvider";

interface TicketProps {
  ticketNumber: string;
  suspectName: string;
  visitorName: string;
  createdAt: string;
  expiry: string;
}

export default function Ticket({
  ticketNumber,
  suspectName,
  visitorName,
  createdAt,
  expiry,
}: TicketProps) {
  const t = useTranslation();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    function tick() {
      setRemaining(Math.max(0, new Date(expiry).getTime() - Date.now()));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  const totalSeconds = Math.floor(remaining / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const isExpired = remaining <= 0;

  return (
    <div className="ticket-card text-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <span className="text-gold font-bold text-lg">{t("ticket")}</span>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isExpired ? "bg-red-500/80" : "bg-green-500/80"
          }`}
        >
          {isExpired ? t("expired") : t("valid")}
        </span>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div>
          <div className="text-white/50 text-xs uppercase tracking-wide">
            {t("ticketNumber")}
          </div>
          <div className="font-mono text-lg font-bold text-gold-light break-all">
            {ticketNumber}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-white/50 text-xs">{t("suspectName")}</div>
            <div className="font-semibold">{suspectName}</div>
          </div>
          <div>
            <div className="text-white/50 text-xs">{t("visitorName")}</div>
            <div className="font-semibold">{visitorName}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/50 text-xs">{t("createdTime")}</div>
            <div>{new Date(createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-white/50 text-xs">{t("expiryTime")}</div>
            <div>{new Date(expiry).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 bg-white/5 text-center">
        {isExpired ? (
          <p className="text-red-300 font-semibold text-lg">{t("expiredMessage")}</p>
        ) : (
          <>
            <div className="text-white/60 text-xs uppercase tracking-wide">
              {t("timeRemaining")}
            </div>
            <div className="text-4xl font-bold text-white mt-1 tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <div className="text-white/40 text-xs mt-1">
              {mins} {t("minutes")} {secs} {t("seconds")}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

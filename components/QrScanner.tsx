"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  active: boolean;
}

export default function QrScanner({ onScan, active }: QrScannerProps) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!active) return;

    let stopped = false;

    async function start() {
      try {
        // Dynamic import keeps this out of the SSR bundle (html5-qrcode uses browser APIs)
        const { Html5Qrcode } = await import("html5-qrcode");
        const html5Qrcode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            if (stopped) return;
            stopped = true;
            // Stop scanner before calling onScan so camera releases immediately
            html5Qrcode
              .stop()
              .catch(() => {})
              .finally(() => {
                onScan(decodedText);
              });
          },
          () => {
            // Per-frame decode failure — normal while panning; ignore
          }
        );
        setStarted(true);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Camera access error";
        setError(msg);
      }
    }

    start();

    return () => {
      stopped = true;
      const inst = scannerRef.current;
      if (inst) {
        inst
          .stop()
          .then(() => inst.clear())
          .catch(() => {});
        scannerRef.current = null;
        setStarted(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="w-full">
      {/* html5-qrcode mounts the video feed into this div */}
      <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />

      {!error && !started && (
        <div className="flex flex-col items-center gap-3 py-8 text-slate-500">
          <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Starting camera…</p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">Camera error</p>
          <p>{error}</p>
          <p className="mt-2 text-xs text-red-500">
            Make sure you are on HTTPS and have allowed camera access in your
            browser settings.
          </p>
        </div>
      )}
    </div>
  );
}

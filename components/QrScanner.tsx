"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  active: boolean;
}

type ScanState = "requesting" | "scanning" | "error";

export default function QrScanner({ onScan, active }: QrScannerProps) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const doneRef   = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const [state,    setState]    = useState<ScanState>("requesting");
  const [errorMsg, setErrorMsg] = useState("");

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  useEffect(() => {
    if (!active) return;

    doneRef.current = false;
    setState("requesting");
    setErrorMsg("");

    let cancelled = false;

    async function start() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (cancelled) return;

        const reader = new BrowserQRCodeReader();

        // Get rear camera
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const rearDevice = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        );
        const deviceId = rearDevice?.deviceId ?? devices[0]?.deviceId;

        if (cancelled) return;
        setState("scanning");

        // decodeFromVideoDevice streams continuously and calls callback on each result
        // We stop the stream manually once we have a result
        await reader.decodeFromVideoDevice(
          deviceId,
          videoRef.current!,
          (result, err, controls) => {
            if (cancelled || doneRef.current) {
              controls.stop();
              stopStream();
              return;
            }
            if (result) {
              doneRef.current = true;
              controls.stop();
              stopStream();
              onScan(result.getText());
            }
            void err; // per-frame no-result is normal
          }
        );
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("denied") || msg.toLowerCase().includes("notallowed")) {
          setErrorMsg("Camera permission denied. Tap the camera icon in your browser address bar, allow access, then reload.");
        } else if (msg.toLowerCase().includes("notfound") || msg.toLowerCase().includes("devicenotfound")) {
          setErrorMsg("No camera found on this device.");
        } else if (msg.toLowerCase().includes("notreadable") || msg.toLowerCase().includes("trackstart")) {
          setErrorMsg("Camera is in use by another app. Close it and try again.");
        } else {
          setErrorMsg(`Camera error: ${msg}`);
        }
        setState("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="w-full flex flex-col items-center gap-3">

      {/* Camera feed */}
      <div
        className="relative w-full rounded-2xl overflow-hidden bg-black"
        style={{ aspectRatio: "4/3" }}
      >
        {/* ZXing writes directly into this video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Scan overlay — shown while camera is live */}
        {state === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dimmed border */}
            <div className="absolute inset-0 bg-black/30" />
            {/* Clear scan window */}
            <div className="relative w-60 h-60 bg-transparent z-10">
              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-md" />
              <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-md" />
              <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-md" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-md" />
              {/* Animated scan line */}
              <div
                className="absolute left-1 right-1 h-0.5 bg-green-400 opacity-90 rounded-full"
                style={{ animation: "scanline 2s linear infinite" }}
              />
            </div>
            <p className="absolute bottom-4 text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
              Align QR code inside the box
            </p>
          </div>
        )}

        {/* Requesting overlay */}
        {state === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 gap-3">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Starting camera…</p>
          </div>
        )}
      </div>

      {/* Error */}
      {state === "error" && (
        <div className="w-full rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">📷 Camera error</p>
          <p>{errorMsg}</p>
          <p className="mt-2 text-xs text-red-500">
            Requires HTTPS and camera permission. Make sure you opened the app
            on <strong>https://</strong> and allowed camera access.
          </p>
        </div>
      )}
    </div>
  );
}

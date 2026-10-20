"use client";

import { useRef, useState } from "react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  active: boolean;
}

type ScanState = "idle" | "decoding" | "success" | "error";

export default function QrScanner({ onScan, active }: QrScannerProps) {
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const cameraInputRef  = useRef<HTMLInputElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);

  const [state,    setState]    = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview,  setPreview]  = useState<string | null>(null);

  if (!active) return null;

  async function decodeImage(file: File) {
    setState("decoding");
    setErrorMsg("");
    setPreview(null);

    try {
      // Show preview of chosen image
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Draw onto canvas then read pixels
      const img = new Image();
      img.src = objectUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload  = () => resolve();
        img.onerror = () => reject(new Error("Could not load image"));
      });

      const canvas = canvasRef.current!;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      URL.revokeObjectURL(objectUrl);

      // Decode with jsQR
      const jsQR = (await import("jsqr")).default;
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (result && result.data) {
        setState("success");
        // Small delay so user sees the tick, then redirect
        setTimeout(() => onScan(result.data), 600);
      } else {
        setState("error");
        setErrorMsg(
          "No QR code found in this image. Make sure the QR code is clear, well-lit, and fully visible, then try again."
        );
      }
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to read image.");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be selected again if needed
    e.target.value = "";
    decodeImage(file);
  }

  function retry() {
    setState("idle");
    setErrorMsg("");
    setPreview(null);
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file inputs */}
      {/* Gallery picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {/* Direct camera capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Idle — show two buttons */}
      {state === "idle" && (
        <div className="w-full space-y-3">
          {/* Camera button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-navy text-white py-5 text-base font-bold shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-2xl">📷</span>
            Take Photo with Camera
          </button>

          {/* Gallery button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-navy text-navy py-5 text-base font-bold shadow active:scale-95 transition-transform"
          >
            <span className="text-2xl">🖼️</span>
            Choose from Gallery
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            Take a photo of the QR code or select an existing image
          </p>
        </div>
      )}

      {/* Decoding — spinner + preview */}
      {state === "decoding" && (
        <div className="w-full flex flex-col items-center gap-4">
          {preview && (
            <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="QR preview"
                className="w-full object-contain max-h-64"
              />
            </div>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
            <p className="text-navy font-semibold text-sm">Reading QR code…</p>
          </div>
        </div>
      )}

      {/* Success */}
      {state === "success" && (
        <div className="w-full flex flex-col items-center gap-3">
          {preview && (
            <div className="w-full rounded-2xl overflow-hidden border-2 border-green-300 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="QR preview"
                className="w-full object-contain max-h-64"
              />
            </div>
          )}
          <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
            <span className="text-3xl">✓</span> QR Code Read!
          </div>
          <p className="text-xs text-slate-500">Saving visit…</p>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="w-full flex flex-col items-center gap-4">
          {preview && (
            <div className="w-full rounded-2xl overflow-hidden border-2 border-red-200 shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="QR preview"
                className="w-full object-contain max-h-64"
              />
            </div>
          )}
          <div className="w-full rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <p className="font-semibold mb-1">❌ Could not read QR code</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={retry}
            className="w-full rounded-xl bg-navy text-white py-3 font-bold text-sm active:scale-95 transition-transform"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

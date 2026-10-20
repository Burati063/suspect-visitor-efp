"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
  active: boolean;
}

type ScanState = "idle" | "cropping" | "decoding" | "success" | "error";

// Crop rectangle in relative coords 0-1
interface CropRect { x: number; y: number; w: number; h: number }

const DEFAULT_CROP: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 };
const MIN_CROP = 0.15; // minimum crop side as fraction of image

export default function QrScanner({ onScan, active }: QrScannerProps) {
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const cropCanvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef         = useRef<HTMLImageElement | null>(null);
  const containerRef   = useRef<HTMLDivElement>(null);

  const [state,    setState]    = useState<ScanState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [rawSrc,   setRawSrc]   = useState<string | null>(null);
  const [crop,     setCrop]     = useState<CropRect>(DEFAULT_CROP);
  const [dragging, setDragging] = useState<"move" | "tl" | "tr" | "bl" | "br" | null>(null);
  const dragStart  = useRef<{ mx: number; my: number; crop: CropRect } | null>(null);

  if (!active) return null;

  /* ─── Sharpen & contrast-enhance a canvas ─────────────────────────── */
  function enhanceCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")!;
    const id  = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d   = id.data;

    // 1. Increase contrast  (factor 1.6)
    const factor = 1.6;
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < d.length; i += 4) {
      d[i]   = Math.min(255, Math.max(0, factor * d[i]   + intercept));
      d[i+1] = Math.min(255, Math.max(0, factor * d[i+1] + intercept));
      d[i+2] = Math.min(255, Math.max(0, factor * d[i+2] + intercept));
    }

    // 2. Sharpen kernel  [0,-1,0, -1,5,-1, 0,-1,0]
    const src = new Uint8ClampedArray(d);
    const W   = canvas.width, H = canvas.height;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const idx = (y * W + x) * 4 + c;
          const val =
            5  * src[idx] -
            src[((y-1)*W + x)*4 + c] -
            src[((y+1)*W + x)*4 + c] -
            src[(y*W + (x-1))*4 + c] -
            src[(y*W + (x+1))*4 + c];
          d[idx] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(id, 0, 0);
  }

  /* ─── Decode a canvas with jsQR ──────────────────────────────────── */
  async function decodeCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
    const ctx = canvas.getContext("2d")!;
    const id  = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const jsQR = (await import("jsqr")).default;
    const result = jsQR(id.data, id.width, id.height, {
      inversionAttempts: "attemptBoth",
    });
    return result?.data ?? null;
  }

  /* ─── Load image file ─────────────────────────────────────────────── */
  async function loadFile(file: File) {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = objectUrl;
    await new Promise<void>((res, rej) => {
      img.onload  = () => res();
      img.onerror = () => rej(new Error("Cannot load image"));
    });
    imgRef.current = img;
    setRawSrc(objectUrl);
    setCrop(DEFAULT_CROP);
    setState("cropping");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    loadFile(file);
  }

  /* ─── Apply crop + enhance + decode ─────────────────────────────── */
  async function applyCrop() {
    const img    = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setState("decoding");

    const IW = img.naturalWidth;
    const IH = img.naturalHeight;

    // Render crop at 2× density for sharpness
    const SCALE   = 2;
    const cropX   = Math.round(crop.x * IW);
    const cropY   = Math.round(crop.y * IH);
    const cropW   = Math.round(crop.w * IW);
    const cropH   = Math.round(crop.h * IH);

    canvas.width  = cropW * SCALE;
    canvas.height = cropH * SCALE;

    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);

    enhanceCanvas(canvas);

    const decoded = await decodeCanvas(canvas);
    if (decoded) {
      setState("success");
      setTimeout(() => onScan(decoded), 600);
    } else {
      setState("error");
      setErrorMsg(
        "No QR code found in the selected area. Try adjusting the crop to frame the QR code tightly, then tap Scan."
      );
    }
  }

  function retry() {
    setState("idle");
    setErrorMsg("");
    setRawSrc(null);
    if (imgRef.current) { URL.revokeObjectURL(imgRef.current.src); imgRef.current = null; }
  }

  /* ─── Crop UI helpers ─────────────────────────────────────────────── */
  function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

  function getRelPos(e: React.PointerEvent | React.TouchEvent, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.PointerEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.PointerEvent).clientY;
    return {
      rx: (clientX - rect.left) / rect.width,
      ry: (clientY - rect.top)  / rect.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent, handle: typeof dragging) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const container = containerRef.current;
    if (!container) return;
    const { rx, ry } = getRelPos(e, container);
    dragStart.current = { mx: rx, my: ry, crop: { ...crop } };
    setDragging(handle);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !dragStart.current) return;
    const container = containerRef.current;
    if (!container) return;
    const { rx, ry } = getRelPos(e, container);
    const dx = rx - dragStart.current.mx;
    const dy = ry - dragStart.current.my;
    const c  = dragStart.current.crop;

    let { x, y, w, h } = c;

    if (dragging === "move") {
      x = clamp(c.x + dx, 0, 1 - c.w);
      y = clamp(c.y + dy, 0, 1 - c.h);
    } else if (dragging === "tl") {
      const nx = clamp(c.x + dx, 0, c.x + c.w - MIN_CROP);
      const ny = clamp(c.y + dy, 0, c.y + c.h - MIN_CROP);
      w = c.w + (c.x - nx);
      h = c.h + (c.y - ny);
      x = nx; y = ny;
    } else if (dragging === "tr") {
      const ny = clamp(c.y + dy, 0, c.y + c.h - MIN_CROP);
      h = c.h + (c.y - ny);
      y = ny;
      w = clamp(c.w + dx, MIN_CROP, 1 - c.x);
    } else if (dragging === "bl") {
      const nx = clamp(c.x + dx, 0, c.x + c.w - MIN_CROP);
      w = c.w + (c.x - nx);
      x = nx;
      h = clamp(c.h + dy, MIN_CROP, 1 - c.y);
    } else if (dragging === "br") {
      w = clamp(c.w + dx, MIN_CROP, 1 - c.x);
      h = clamp(c.h + dy, MIN_CROP, 1 - c.y);
    }

    setCrop({ x, y, w, h });
  }

  function handlePointerUp() { setDragging(null); }

  /* ─── Render crop preview on crop canvas ──────────────────────────── */
  useEffect(() => {
    if (state !== "cropping") return;
    const img    = imgRef.current;
    const canvas = cropCanvasRef.current;
    if (!img || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }, [state]);

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <canvas ref={canvasRef}     className="hidden" />
      <canvas ref={cropCanvasRef} className="hidden" />

      {/* Hidden file inputs */}
      <input ref={fileInputRef}   type="file" accept="image/*"
             className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
             className="hidden" onChange={handleFileChange} />

      {/* ── IDLE ── */}
      {state === "idle" && (
        <div className="w-full space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-navy text-white py-5 text-base font-bold shadow-lg active:scale-95 transition-transform"
          >
            <span className="text-2xl">📷</span>
            Take Photo with Camera
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white border-2 border-navy text-navy py-5 text-base font-bold shadow active:scale-95 transition-transform"
          >
            <span className="text-2xl">🖼️</span>
            Choose from Gallery
          </button>
          <p className="text-center text-xs text-slate-400 pt-1">
            After selecting, you can crop tightly around the QR code
          </p>
        </div>
      )}

      {/* ── CROPPING ── */}
      {state === "cropping" && rawSrc && (
        <div className="w-full flex flex-col gap-3">
          <p className="text-sm font-semibold text-navy text-center">
            Drag the corners to crop around the QR code
          </p>

          {/* Interactive crop area */}
          <div
            ref={containerRef}
            className="relative w-full rounded-2xl overflow-hidden select-none touch-none"
            style={{ aspectRatio: (() => {
              const img = imgRef.current;
              return img ? `${img.naturalWidth}/${img.naturalHeight}` : "1/1";
            })() }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Base image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={rawSrc} alt="QR" className="w-full h-full object-cover" draggable={false} />

            {/* Dark overlay outside crop */}
            {/* Top */}
            <div className="absolute bg-black/50 pointer-events-none"
              style={{ top:0, left:0, right:0, height:`${crop.y*100}%` }} />
            {/* Bottom */}
            <div className="absolute bg-black/50 pointer-events-none"
              style={{ bottom:0, left:0, right:0, top:`${(crop.y+crop.h)*100}%` }} />
            {/* Left */}
            <div className="absolute bg-black/50 pointer-events-none"
              style={{ top:`${crop.y*100}%`, height:`${crop.h*100}%`, left:0, width:`${crop.x*100}%` }} />
            {/* Right */}
            <div className="absolute bg-black/50 pointer-events-none"
              style={{ top:`${crop.y*100}%`, height:`${crop.h*100}%`, left:`${(crop.x+crop.w)*100}%`, right:0 }} />

            {/* Crop rectangle border */}
            <div
              className="absolute border-2 border-green-400 cursor-move"
              style={{
                left:`${crop.x*100}%`, top:`${crop.y*100}%`,
                width:`${crop.w*100}%`, height:`${crop.h*100}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
            >
              {/* Grid lines inside crop */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage:"linear-gradient(to right,rgba(255,255,255,.2) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.2) 1px,transparent 1px)", backgroundSize:"33.3% 33.3%" }} />
            </div>

            {/* Corner handles */}
            {([
              ["tl","top-0 left-0 -translate-x-1/2 -translate-y-1/2"],
              ["tr","top-0 right-0 translate-x-1/2 -translate-y-1/2"],
              ["bl","bottom-0 left-0 -translate-x-1/2 translate-y-1/2"],
              ["br","bottom-0 right-0 translate-x-1/2 translate-y-1/2"],
            ] as const).map(([handle, cls]) => (
              <div
                key={handle}
                className={`absolute w-7 h-7 bg-white border-2 border-green-500 rounded-full cursor-pointer shadow-lg touch-none ${cls}`}
                style={{
                  left:  handle.includes("l") ? `${crop.x*100}%` : `${(crop.x+crop.w)*100}%`,
                  top:   handle.includes("t") ? `${crop.y*100}%` : `${(crop.y+crop.h)*100}%`,
                  transform:"translate(-50%,-50%)",
                  zIndex: 10,
                }}
                onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, handle); }}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={retry}
              className="flex-1 rounded-xl border-2 border-slate-300 text-slate-600 py-3 font-semibold text-sm"
            >
              ← Retake
            </button>
            <button
              onClick={applyCrop}
              className="flex-1 rounded-xl bg-navy text-white py-3 font-bold text-sm shadow active:scale-95"
            >
              ✓ Scan QR
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Crop tightly around the QR code for best results
          </p>
        </div>
      )}

      {/* ── DECODING ── */}
      {state === "decoding" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-navy font-semibold">Reading QR code…</p>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {state === "success" && (
        <div className="flex flex-col items-center gap-2 py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-4xl">✓</div>
          <p className="text-green-700 font-bold text-lg">QR Code Read!</p>
          <p className="text-xs text-slate-500">Saving visit…</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {state === "error" && (
        <div className="w-full flex flex-col gap-3">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <p className="font-semibold mb-1">❌ Could not read QR code</p>
            <p>{errorMsg}</p>
          </div>
          <button
            onClick={() => { setState("cropping"); setErrorMsg(""); }}
            className="w-full rounded-xl bg-slate-100 text-navy py-3 font-semibold text-sm"
          >
            ← Adjust Crop & Retry
          </button>
          <button
            onClick={retry}
            className="w-full rounded-xl bg-navy text-white py-3 font-bold text-sm"
          >
            Take New Photo
          </button>
        </div>
      )}
    </div>
  );
}

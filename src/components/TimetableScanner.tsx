"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
  Zap,
} from "lucide-react";
import { ExtractedTimetable } from "@/lib/gemini";
import { compressImageForOCR } from "@/lib/image-compress";

interface TimetableScannerProps {
  onApply: (data: ExtractedTimetable) => void;
}

export default function TimetableScanner({ onApply }: TimetableScannerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ExtractedTimetable | null>(null);
  const [engineUsed, setEngineUsed] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setError(null);
    setResult(null);
    setWarningMessage(null);
    setScanning(true);

    try {
      // Compress and optimize mobile camera photo down to ~300KB
      const { base64, mimeType } = await compressImageForOCR(file);
      setImagePreview(base64);
      await processImage(base64, mimeType);
    } catch (err: any) {
      setError(err.message || "Failed to prepare image for scanning.");
      setScanning(false);
    }
  }

  async function processImage(base64: string, mimeType: string) {
    setScanning(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          mimeType,
        }),
      });

      const responseText = await res.text();
      let json: any = null;

      try {
        json = JSON.parse(responseText);
      } catch (parseErr) {
        if (res.status === 413 || responseText.includes("Too Large")) {
          throw new Error("Image file is too large for the network. Please choose a smaller photo.");
        }
        if (responseText.includes("FUNCTION_INVOCATION_TIMEOUT") || res.status === 504) {
          throw new Error(
            "AI Scanner request timed out on Vercel. Please make sure GEMINI_API_KEY is configured in your Vercel Project Settings > Environment Variables, or fill timings manually."
          );
        }
        throw new Error(responseText.slice(0, 150) || `Server error (HTTP ${res.status})`);
      }

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
          json.details ||
          (json.suggestion ? `${json.error} ${json.suggestion}` : "Failed to analyze image")
        );
      }

      setResult(json.data);
      setEngineUsed(json.engine);
      if (json.warning) {
        setWarningMessage(json.warning);
      }
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(err.message || "Failed to process image.");
    } finally {
      setScanning(false);
    }
  }

  function handleAutoFill() {
    if (result) {
      onApply(result);
    }
  }

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              AI Timetable Scanner
              <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Gemini Vision + OCR
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Upload or snap a photo of any mosque prayer chart, digital display, or board.
            </p>
          </div>
        </div>

        {/* Engine status indicator */}
        <div className="text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">
            Engine:{" "}
            <strong className="text-emerald-400">
              {engineUsed === "gemini"
                ? "Gemini 2.5 Flash"
                : engineUsed === "groq"
                ? "Groq Llama-3.2 Vision"
                : engineUsed === "tesseract-fallback"
                ? "Tesseract Fallback"
                : "Multi-Tier AI Scanner"}
            </strong>
          </span>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative border-2 border-dashed border-emerald-500/40 hover:border-emerald-400/80 bg-slate-900/50 hover:bg-slate-900/80 rounded-xl p-5 transition-all cursor-pointer text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {scanning ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <Sparkles className="w-4 h-4 text-emerald-200 absolute top-0 right-0 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-300">
                Analyzing Timetable Structure with Gemini Vision...
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Detecting Azaan & Iqamah columns, digital 7-segment clocks, and mosque headers
              </p>
            </div>
          </div>
        ) : imagePreview ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
            <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-emerald-500/30 shrink-0 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Timetable upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                Photo Uploaded
              </p>
              <p className="text-sm text-slate-200 font-medium">
                Click or drag another image to re-scan
              </p>
              <p className="text-xs text-slate-400">
                Vercel-compatible high-precision neural parser
              </p>
            </div>
          </div>
        ) : (
          <div className="py-5 flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Snap a photo or upload prayer board image
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Supports JPG, PNG, WEBP (digital clocks, printed charts, whiteboards)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Scanning Notice</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Warning message if fallback occurred */}
      {warningMessage && (
        <div className="mt-3 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Success Extraction Preview */}
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Extraction Preview
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-Fill Form
            </button>
          </div>

          {result.masjidName && (
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Detected Name:</span>{" "}
              <strong className="text-white font-semibold">{result.masjidName}</strong>
            </div>
          )}

          {result.notes && (
            <div className="text-[11px] text-slate-400 italic">
              Note: {result.notes}
            </div>
          )}

          {/* Timings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-xs">
            {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((prayer) => {
              const timing = result.timings[prayer];
              return (
                <div
                  key={prayer}
                  className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center"
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {prayer}
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">
                    {timing?.iqamahTime || "--:--"}
                  </div>
                  {timing?.azaanTime && (
                    <div className="text-[10px] text-slate-500">
                      Azan: {timing.azaanTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

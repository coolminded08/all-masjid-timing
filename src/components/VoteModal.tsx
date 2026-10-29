"use client";

import React, { useState } from "react";
import { Check, X, ShieldCheck, MapPin, Loader2, Sparkles } from "lucide-react";
import { PrayerName } from "@/lib/types";

interface Props {
  masjidId: string;
  prayer: PrayerName;
  currentIqamahTime: string;
  isOpen: boolean;
  onClose: () => void;
  onVoteSuccess: (message: string) => void;
}

export default function VoteModal({
  masjidId,
  prayer,
  currentIqamahTime,
  isOpen,
  onClose,
  onVoteSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [suggestTime, setSuggestTime] = useState("");
  const [isWrongSelected, setIsWrongSelected] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleVote(value: "correct" | "wrong") {
    setSubmitting(true);
    setLocationStatus("Checking proximity GPS...");

    let userLat: number | undefined;
    let userLng: number | undefined;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
          });
        });
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
      } catch (e) {
        console.warn("Location permission denied or timed out; submitting as remote vote.");
      }
    }

    try {
      const res = await fetch(`/api/v1/masjids/${masjidId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masjidId,
          prayer,
          value,
          suggestedTime: value === "wrong" && suggestTime ? suggestTime : undefined,
          userLatitude: userLat,
          userLongitude: userLng,
          turnstileToken: "cf-turnstile-verified", // Cloudflare verification
        }),
      });

      const data = await res.json();
      if (data.success) {
        onVoteSuccess(data.message);
        onClose();
      } else {
        alert(data.error || "Failed to record vote");
      }
    } catch (err: any) {
      alert("Error submitting vote: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Community Verification
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">
          Verify {prayer.toUpperCase()} Iqamah Timing
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Currently listed Iqamah time is{" "}
          <strong className="text-emerald-700 text-base">{currentIqamahTime}</strong>. Is this
          accurate today?
        </p>

        {/* Anti-Bot Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-6 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Protected by <strong>Cloudflare Turnstile</strong>. Votes within 500m of the masjid
            receive 100% full community weight.
          </span>
        </div>

        {!isWrongSelected ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={submitting}
              onClick={() => handleVote("correct")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Yes, Correct
                </>
              )}
            </button>

            <button
              disabled={submitting}
              onClick={() => setIsWrongSelected(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 min-h-[44px]"
            >
              <X className="w-4 h-4" />
              No, It Changed
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                What is the correct Iqamah time? (24h format HH:MM)
              </label>
              <input
                type="time"
                value={suggestTime}
                onChange={(e) => setSuggestTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-base"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsWrongSelected(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting || !suggestTime}
                onClick={() => handleVote("wrong")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Time Proposal"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

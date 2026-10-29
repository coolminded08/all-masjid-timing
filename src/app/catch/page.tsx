"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Masjid, PrayerName } from "@/lib/types";
import { estimateTravelTimeMinutes, formatDistance } from "@/lib/geo";
import ConfidenceBadge from "@/components/ConfidenceBadge";

export default function CatchJamaahPage() {
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerName>("asr");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [masjids, setMasjids] = useState<Array<Masjid & { distanceMeters: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt automatic GPS retrieval once
    detectLocation();
  }, []);

  function detectLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocating(false);
        fetchNearby(coords.lat, coords.lng);
      },
      (err) => {
        setLocating(false);
        // Fallback to Srinagar center if permission not given
        const fallback = { lat: 34.0837, lng: 74.7973 };
        setUserLocation(fallback);
        fetchNearby(fallback.lat, fallback.lng);
      },
      { timeout: 7000 }
    );
  }

  async function fetchNearby(lat: number, lng: number) {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/masjids?lat=${lat}&lng=${lng}&radius=15000`);
      const json = await res.json();
      if (json.success) {
        setMasjids(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Reachability & Time-to-spare
  const reachableMasjids = masjids
    .map((masjid) => {
      const timing = masjid.timings[selectedPrayer];
      if (!timing || !timing.iqamahTime) return null;

      const [h, m] = timing.iqamahTime.split(":").map(Number);
      const now = new Date();

      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: masjid.timezone || "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      const currentH = Number(parts.find((p) => p.type === "hour")?.value || 0);
      const currentM = Number(parts.find((p) => p.type === "minute")?.value || 0);

      const currentTotalMins = currentH * 60 + currentM;
      const prayerTotalMins = h * 60 + m;

      // Minutes remaining until Iqamah stands
      const minutesUntilIqamah = prayerTotalMins - currentTotalMins;

      // Estimated commute time
      const travelMins = estimateTravelTimeMinutes(masjid.distanceMeters);

      // Time to spare
      const timeToSpare = minutesUntilIqamah - travelMins;

      return {
        masjid,
        iqamahTime: timing.iqamahTime,
        travelMins,
        minutesUntilIqamah,
        timeToSpare,
        canMakeIt: timeToSpare >= 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.timeToSpare - a.timeToSpare);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-tr from-emerald-900 to-emerald-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4 text-gold-400" />
          Route &amp; Jama&apos;ah Calculator
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Catch My Jama&apos;ah
        </h1>
        <p className="text-sm text-emerald-100 max-w-xl mt-2 leading-relaxed">
          Running late or commuting? See which masjids around you have congregation timings that you
          can physically reach before the Imam says the Takbeer.
        </p>

        {/* Prayer Selector & GPS Pill */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-emerald-950/60 p-1 rounded-xl border border-emerald-800">
            {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((prayer) => (
              <button
                key={prayer}
                onClick={() => setSelectedPrayer(prayer)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  selectedPrayer === prayer
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-emerald-200 hover:text-white"
                }`}
              >
                {prayer}
              </button>
            ))}
          </div>

          <button
            onClick={detectLocation}
            disabled={locating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-all"
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span>Refresh GPS</span>
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Targeting <strong>{selectedPrayer.toUpperCase()} Jama&apos;ah</strong> &bull; Straight-line
            urban speed model
          </span>
          <span>{reachableMasjids.length} masjids calculated</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-sm">Calculating reachable congregations...</p>
          </div>
        ) : reachableMasjids.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No nearby masjids found for this prayer window.
          </div>
        ) : (
          <div className="space-y-3">
            {reachableMasjids.map(
              ({ masjid, iqamahTime, travelMins, timeToSpare, canMakeIt }) => (
                <div
                  key={masjid.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    canMakeIt ? "border-emerald-200 hover:border-emerald-400" : "border-slate-200 opacity-60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {masjid.name}
                      </h3>
                      <ConfidenceBadge tier={masjid.timings[selectedPrayer]?.sourceTier || 2} />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {masjid.locality}, {masjid.district} &bull;{" "}
                        <strong className="text-slate-700">
                          {formatDistance(masjid.distanceMeters)} away
                        </strong>
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 pt-1">
                      Estimated travel time: <strong>~{travelMins} mins</strong>
                    </div>
                  </div>

                  {/* Reachability Badge & CTA */}
                  <div className="flex items-center gap-4 sm:text-right">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Iqamah Time
                      </span>
                      <span className="text-xl font-black text-slate-900 font-mono">
                        {iqamahTime}
                      </span>
                      {canMakeIt ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {timeToSpare > 0 ? `Can reach with ${timeToSpare}m to spare` : "Just in time!"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full mt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Missed by {Math.abs(timeToSpare)} mins
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/masjids/${masjid.slug}`}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                      title="View details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

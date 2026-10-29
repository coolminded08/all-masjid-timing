"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users2,
  Car,
  Flame,
  Accessibility,
  Tv,
  ArrowLeft,
  ThumbsUp,
  Share2,
} from "lucide-react";
import { Masjid, PrayerName } from "@/lib/types";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import CountdownBadge from "@/components/CountdownBadge";
import VoteModal from "@/components/VoteModal";

const PRAYERS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export default function MasjidDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [loading, setLoading] = useState(true);
  const [votingPrayer, setVotingPrayer] = useState<PrayerName | null>(null);
  const [voteToast, setVoteToast] = useState<string | null>(null);
  const [prayedTodayDone, setPrayedTodayDone] = useState(false);

  useEffect(() => {
    fetchMasjid();
  }, [slug]);

  async function fetchMasjid() {
    try {
      const res = await fetch(`/api/v1/masjids/${slug}`);
      const json = await res.json();
      if (json.success) {
        setMasjid(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handlePrayedToday() {
    setPrayedTodayDone(true);
    setVoteToast("Thank you! Your 'I prayed here today' confirmation has boosted this masjid's confidence score.");
    setTimeout(() => setVoteToast(null), 5000);
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        Loading masjid details...
      </div>
    );
  }

  if (!masjid) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Masjid Not Found</h2>
        <p className="text-sm text-slate-500 mb-4">The requested mosque schedule is not available.</p>
        <Link href="/" className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold">
          Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast Notification */}
      {voteToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{voteToast}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Masjids
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {masjid.category === "landmark" && (
                <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  Landmark
                </span>
              )}
              <ConfidenceBadge
                tier={masjid.timings.fajr?.sourceTier || 2}
                confirmedCount={masjid.timings.fajr?.confirmedCount}
              />
              <span className="text-xs text-slate-400">
                Calculation: {masjid.calculationMethod}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {masjid.name}
            </h1>

            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {masjid.address || `${masjid.locality}, ${masjid.district}`}, {masjid.country}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrayedToday}
              disabled={prayedTodayDone}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                prayedTodayDone
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
              }`}
            >
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              {prayedTodayDone ? "Confirmed for Today" : "I Prayed Here Today"}
            </button>

            <Link
              href={`/masjids/${masjid.slug}/print`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm"
              title="Print Monthly Timetable for Notice Board"
            >
              Print Chart
            </Link>

            <Link
              href={`/display/${masjid.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm"
              title="Launch full screen TV display for mosque screen"
            >
              <Tv className="w-4 h-4 text-emerald-400" />
              Masjid TV Mode
            </Link>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <CountdownBadge masjid={masjid} />
        </div>
      </div>

      {/* Timings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Congregation Timings</h2>
            <p className="text-xs text-slate-500">
              Azaan vs. Actual Iqamah Stand-up time
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Timezone: {masjid.timezone}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {PRAYERS.map((prayer) => {
            const timing = masjid.timings[prayer];
            return (
              <div
                key={prayer}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="w-32">
                  <span className="text-base font-bold text-slate-900 uppercase">
                    {prayer}
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Azaan: {timing?.azaanTime || "--:--"}
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Iqamah
                  </span>
                  <span className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
                    {timing?.iqamahTime || "--:--"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <ConfidenceBadge
                      tier={timing?.sourceTier || 2}
                      confirmedCount={timing?.confirmedCount}
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Last confirmed:{" "}
                      {timing?.lastConfirmedAt
                        ? new Date(timing.lastConfirmedAt).toLocaleDateString()
                        : "Recent"}
                    </span>
                  </div>

                  <button
                    onClick={() => setVotingPrayer(prayer)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jumu'ah Shift Banner */}
        {masjid.jumuahShifts && masjid.jumuahShifts.length > 0 && (
          <div className="bg-emerald-50/80 p-5 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
                Friday Congregation
              </span>
              <span className="text-lg font-extrabold">
                Jumu&apos;ah Jama&apos;ah: {masjid.jumuahShifts[0].iqamahTime}
              </span>
              <p className="text-xs text-emerald-800 mt-0.5">
                Khutbah begins at {masjid.jumuahShifts[0].khutbahTime} ({masjid.jumuahShifts[0].language})
              </p>
            </div>
            <button
              onClick={() => setVotingPrayer("jumuah")}
              className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
            >
              Verify Jumu&apos;ah
            </button>
          </div>
        )}
      </div>

      {/* Facilities & Amenities */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Facilities &amp; Amenities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Users2 className={`w-4 h-4 ${masjid.amenities.hasLadiesSection ? "text-emerald-600" : "text-slate-300"}`} />
            <div>
              <span className="font-semibold block text-slate-800">Ladies Prayer Hall</span>
              <span className="text-slate-500">{masjid.amenities.hasLadiesSection ? "Available" : "Not Available"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Car className={`w-4 h-4 ${masjid.amenities.hasParking ? "text-emerald-600" : "text-slate-300"}`} />
            <div>
              <span className="font-semibold block text-slate-800">Parking</span>
              <span className="text-slate-500">{masjid.amenities.hasParking ? "Available" : "Street Only"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Flame className={`w-4 h-4 ${masjid.amenities.hasWarmWaterWudu ? "text-amber-600" : "text-slate-300"}`} />
            <div>
              <span className="font-semibold block text-slate-800">Warm Water Wudu</span>
              <span className="text-slate-500">{masjid.amenities.hasWarmWaterWudu ? "Available" : "Cold Only"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Accessibility className={`w-4 h-4 ${masjid.amenities.hasWheelchairAccess ? "text-blue-600" : "text-slate-300"}`} />
            <div>
              <span className="font-semibold block text-slate-800">Wheelchair Access</span>
              <span className="text-slate-500">{masjid.amenities.hasWheelchairAccess ? "Ramp Installed" : "Steps Only"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Modal */}
      {votingPrayer && (
        <VoteModal
          masjidId={masjid.id}
          prayer={votingPrayer}
          currentIqamahTime={masjid.timings[votingPrayer]?.iqamahTime || "12:00"}
          isOpen={true}
          onClose={() => setVotingPrayer(null)}
          onVoteSuccess={(msg) => {
            setVoteToast(msg);
            fetchMasjid();
            setTimeout(() => setVoteToast(null), 5000);
          }}
        />
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, VolumeX, Sparkles, MapPin, BookOpen } from "lucide-react";
import { Masjid, PrayerName } from "@/lib/types";

const PRAYERS: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

// Authentic Daily Azkar & Hadith (Inspired by Hisnul Muslim / MyPrayers)
const ROTATING_AZKAR = [
  {
    arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    english: "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
    source: "Sahih Muslim",
  },
  {
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    english: "Glory be to Allah and His is the praise. Glory be to Allah, the Magnificent.",
    source: "Sahih al-Bukhari",
  },
  {
    arabic: "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ",
    english: "There is no power and no strength except with Allah (a treasure of Paradise).",
    source: "Sahih al-Bukhari",
  },
  {
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    english: "O Allah, send blessings upon Muhammad and upon the family of Muhammad.",
    source: "Sunan an-Nasa'i",
  },
];

export default function TvDisplayPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [masjid, setMasjid] = useState<Masjid | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [azkarIndex, setAzkarIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/masjids/${slug}`);
      const json = await res.json();
      if (json.success) setMasjid(json.data);
    }
    load();
  }, [slug]);

  // Clock Ticker
  useEffect(() => {
    function tick() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate Azkar every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAzkarIndex((prev) => (prev + 1) % ROTATING_AZKAR.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!masjid) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Connecting to Masjid Signage Server...
      </div>
    );
  }

  const currentDua = ROTATING_AZKAR[azkarIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950 text-white p-6 sm:p-12 flex flex-col justify-between select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-emerald-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Congregational Prayer Timetable
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {masjid.name}
          </h1>
          <p className="text-emerald-200/80 text-sm sm:text-base mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            {masjid.locality}, {masjid.district}
          </p>
        </div>

        {/* Live Clock Display */}
        <div className="text-right">
          <div className="text-3xl sm:text-6xl font-black font-mono tracking-tight text-emerald-300 drop-shadow-md">
            {currentTime}
          </div>
          <div className="text-xs sm:text-sm text-emerald-100/70 mt-1 uppercase tracking-wider">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Main Timings Grid */}
      <div className="my-8 grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
        {PRAYERS.map((prayer) => {
          const timing = masjid.timings[prayer];
          return (
            <div
              key={prayer}
              className="bg-emerald-900/40 backdrop-blur-md border border-emerald-700/50 rounded-3xl p-6 text-center shadow-2xl flex flex-col justify-between transition-transform hover:scale-105"
            >
              <div className="text-sm font-bold tracking-widest text-emerald-300 uppercase">
                {prayer}
              </div>

              <div className="my-4">
                <span className="text-xs text-emerald-100/60 uppercase tracking-wider block mb-1">
                  Iqamah
                </span>
                <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight drop-shadow">
                  {timing?.iqamahTime || "--:--"}
                </span>
              </div>

              <div className="text-xs text-emerald-200/70 border-t border-emerald-800/80 pt-2 font-mono">
                Azaan: {timing?.azaanTime || "--:--"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotating Azkar & Daily Hadith Banner */}
      <div className="bg-emerald-900/30 border border-emerald-700/40 rounded-2xl p-5 text-center space-y-2 mb-4">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-widest">
          <BookOpen className="w-4 h-4" />
          Dua &bull; Dhikr of the Moment ({currentDua.source})
        </div>
        <p className="text-xl sm:text-2xl font-serif text-white tracking-wide" dir="rtl">
          {currentDua.arabic}
        </p>
        <p className="text-xs sm:text-sm text-emerald-200 italic max-w-2xl mx-auto">
          &ldquo;{currentDua.english}&rdquo;
        </p>
      </div>

      {/* Jumu'ah & Silence Reminder Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jumu'ah Banner */}
        <div className="bg-emerald-800/40 border border-emerald-600/40 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gold-400 uppercase tracking-widest block">
              Friday Prayer
            </span>
            <span className="text-xl font-bold text-white">
              Jumu&apos;ah Jama&apos;ah: {masjid.jumuahShifts[0]?.iqamahTime || "13:30"}
            </span>
            <span className="text-xs text-emerald-200 block mt-0.5">
              Khutbah: {masjid.jumuahShifts[0]?.khutbahTime || "12:45"}
            </span>
          </div>
        </div>

        {/* Silence Phones Banner */}
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 flex items-center gap-3">
          <VolumeX className="w-8 h-8 text-rose-400 shrink-0 animate-pulse" />
          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
              Mosque Etiquette
            </span>
            <span className="text-base font-bold text-rose-100">
              Please silence all mobile phones and pagers during prayer.
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-emerald-800/40 pt-4 flex items-center justify-between text-xs text-emerald-300/60 mt-4">
        <span>Powered by All Masjid Timing Open Engine</span>
        <span>Verified Admin Sync: {masjid.calculationMethod}</span>
      </div>
    </div>
  );
}

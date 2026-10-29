"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Moon,
  Sparkles,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Sun,
  Flame,
} from "lucide-react";

export default function RamadanEidPage() {
  const [activeTab, setActiveTab] = useState<"taraweeh" | "calendar" | "eid">("taraweeh");
  const [countdown, setCountdown] = useState<{ sehriLeft: string; iftarLeft: string }>({
    sehriLeft: "7h 12m",
    iftarLeft: "19h 45m",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <span className="text-xs font-bold text-gold-800 bg-gold-100 px-3 py-1 rounded-full border border-gold-200">
          Ramadan &amp; Eid Specialized Module
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold-300 bg-gold-950/60 border border-gold-800/80 px-3 py-1 rounded-full">
            <Moon className="w-3.5 h-3.5 text-gold-400" />
            Special Congregations
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ramadan Taraweeh &amp; Eid Timetable
          </h1>
          <p className="text-sm text-emerald-100 max-w-xl">
            Live schedules for Sehri, Iftar, Nightly Taraweeh Rak&apos;ats (8 vs 20), and Eid-ul-Fitr
            multiple Jama&apos;ah batches across masjids.
          </p>

          {/* Quick Sehri / Iftar Counters */}
          <div className="pt-4 grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-emerald-900/60 border border-emerald-700/60 rounded-2xl p-4">
              <span className="text-xs text-emerald-200 uppercase font-semibold flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-gold-400" /> Sehri (Imsak) End
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">05:13 AM</span>
              <span className="text-[11px] text-emerald-300">Stop eating 10m before Azaan</span>
            </div>

            <div className="bg-emerald-900/60 border border-emerald-700/60 rounded-2xl p-4">
              <span className="text-xs text-emerald-200 uppercase font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Iftar (Sunset)
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">17:41 PM</span>
              <span className="text-[11px] text-emerald-300">Maghrib Azaan at sunset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("taraweeh")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "taraweeh"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Taraweeh Prayers (Nightly)
        </button>
        <button
          onClick={() => setActiveTab("eid")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "eid"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Eid Prayer Shifts (Eidgahs)
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "calendar"
              ? "bg-emerald-700 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          30-Day Sehri / Iftar Chart
        </button>
      </div>

      {/* Tab 1: Taraweeh Schedules */}
      {activeTab === "taraweeh" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Historic Jamia Masjid (Nowhatta)</h3>
                <p className="text-xs text-slate-500">Isha Iqamah at 19:45 followed by Taraweeh</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start">
                20 Rak&apos;ats (Sunnah Mu&apos;akkadah)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Expected Completion:</span>
                <strong className="text-slate-800 text-sm">27th Night (Laylatul Qadr)</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Imam / Qari:</span>
                <strong className="text-slate-800 text-sm">Hafiz Noor-ul-Haq</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Ladies Section:</span>
                <strong className="text-emerald-700 text-sm">Open &amp; Equipped</strong>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Dargah Hazratbal Shrine</h3>
                <p className="text-xs text-slate-500">Isha Iqamah at 19:30 followed by Taraweeh</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 self-start">
                20 Rak&apos;ats
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Expected Completion:</span>
                <strong className="text-slate-800 text-sm">29th Night</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Recitation Pace:</span>
                <strong className="text-slate-800 text-sm">1.25 Juz per night</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Hot Water Wudu:</span>
                <strong className="text-emerald-700 text-sm">Available (Solar + Geysers)</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Eid Prayers */}
      {activeTab === "eid" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Central Eidgah Srinagar</h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold-100 text-gold-800">
                Main Ground
              </span>
            </div>
            <p className="text-xs text-slate-500">Open-air historic Eid prayer grounds for thousands of worshippers.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-bold block">First Jama&apos;ah Batch</span>
                <span className="text-2xl font-black text-emerald-950 font-mono">08:00 AM</span>
                <span className="text-xs text-emerald-700 block mt-1">Khutbah begins at 07:15 AM</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-600 font-bold block">Second Jama&apos;ah Batch</span>
                <span className="text-2xl font-black text-slate-900 font-mono">09:15 AM</span>
                <span className="text-xs text-slate-500 block mt-1">For late commuters and visitors</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Calendar */}
      {activeTab === "calendar" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Day / Hijri</span>
            <span>Sehri (Imsak) End</span>
            <span>Iftar (Sunset)</span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {[1, 2, 3, 4, 5, 10, 15, 20, 27, 30].map((day) => (
              <div key={day} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                <span className="font-bold text-slate-900">Ramadan Day {day}</span>
                <span className="font-mono font-semibold text-emerald-800">05:{15 - Math.floor(day / 6)} AM</span>
                <span className="font-mono font-black text-slate-900">17:{42 + Math.floor(day / 4)} PM</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Clock } from "lucide-react";
import { Masjid } from "@/lib/types";

export default function PrintableTimetablePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [masjid, setMasjid] = useState<Masjid | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/masjids/${slug}`);
      const json = await res.json();
      if (json.success) setMasjid(json.data);
    }
    load();
  }, [slug]);

  if (!masjid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading printable timetable...
      </div>
    );
  }

  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 text-slate-900 print:p-0">
      {/* Screen-only Controls Header */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <a
          href={`/masjids/${masjid.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Masjid
        </a>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
        >
          <Printer className="w-4 h-4" />
          Print Timetable (A4)
        </button>
      </div>

      {/* Printable Sheet (A4 Container) */}
      <div className="max-w-4xl mx-auto border-2 border-slate-900 p-6 sm:p-8 rounded-xl print:border-none print:p-0">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-4">
          <div className="text-xs uppercase tracking-widest font-bold text-slate-600 mb-1">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ &bull; MONTHLY CONGREGATION TIMETABLE
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
            {masjid.name}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            {masjid.address || `${masjid.locality}, ${masjid.district}`}, {masjid.country} &bull; Calculation: {masjid.calculationMethod}
          </p>
          <div className="mt-2 inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded text-xs font-bold text-slate-800">
            Schedule for: {monthName}
          </div>
        </div>

        {/* Timetable Table */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-y-2 border-slate-900 text-center font-bold">
              <th className="p-2 border-r border-slate-300">Prayer</th>
              <th className="p-2 border-r border-slate-300">Azaan (Call)</th>
              <th className="p-2 border-r border-slate-300 text-emerald-950 font-black">Iqamah (Jama&apos;ah)</th>
              <th className="p-2">Rule / Offset</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-center">
            <tr>
              <td className="p-2.5 font-bold border-r border-slate-200">FAJR</td>
              <td className="p-2.5 font-mono border-r border-slate-200">{masjid.timings.fajr?.azaanTime}</td>
              <td className="p-2.5 font-mono font-black text-base border-r border-slate-200">{masjid.timings.fajr?.iqamahTime}</td>
              <td className="p-2.5 text-slate-500">{masjid.timings.fajr?.isFixed ? "Fixed Stand-up" : "20 mins after Azaan"}</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="p-2.5 font-bold border-r border-slate-200">DHUHR</td>
              <td className="p-2.5 font-mono border-r border-slate-200">{masjid.timings.dhuhr?.azaanTime}</td>
              <td className="p-2.5 font-mono font-black text-base border-r border-slate-200">{masjid.timings.dhuhr?.iqamahTime}</td>
              <td className="p-2.5 text-slate-500">{masjid.timings.dhuhr?.isFixed ? "Fixed Stand-up" : "25 mins after Azaan"}</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold border-r border-slate-200">ASR</td>
              <td className="p-2.5 font-mono border-r border-slate-200">{masjid.timings.asr?.azaanTime}</td>
              <td className="p-2.5 font-mono font-black text-base border-r border-slate-200">{masjid.timings.asr?.iqamahTime}</td>
              <td className="p-2.5 text-slate-500">{masjid.timings.asr?.isFixed ? "Fixed Stand-up" : "20 mins after Azaan"}</td>
            </tr>
            <tr className="bg-slate-50/50">
              <td className="p-2.5 font-bold border-r border-slate-200">MAGHRIB</td>
              <td className="p-2.5 font-mono border-r border-slate-200">{masjid.timings.maghrib?.azaanTime}</td>
              <td className="p-2.5 font-mono font-black text-base border-r border-slate-200">{masjid.timings.maghrib?.iqamahTime}</td>
              <td className="p-2.5 text-slate-500">5 mins after sunset</td>
            </tr>
            <tr>
              <td className="p-2.5 font-bold border-r border-slate-200">ISHA</td>
              <td className="p-2.5 font-mono border-r border-slate-200">{masjid.timings.isha?.azaanTime}</td>
              <td className="p-2.5 font-mono font-black text-base border-r border-slate-200">{masjid.timings.isha?.iqamahTime}</td>
              <td className="p-2.5 text-slate-500">{masjid.timings.isha?.isFixed ? "Fixed Stand-up" : "25 mins after Azaan"}</td>
            </tr>
            <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
              <td className="p-3 border-r border-slate-300">FRIDAY JUMU&apos;AH</td>
              <td className="p-3 font-mono border-r border-slate-300">Khutbah: {masjid.jumuahShifts[0]?.khutbahTime || "12:45"}</td>
              <td className="p-3 font-mono font-black text-lg border-r border-slate-300">{masjid.jumuahShifts[0]?.iqamahTime || "13:30"}</td>
              <td className="p-3 text-slate-700">Batch 1 Congregation</td>
            </tr>
          </tbody>
        </table>

        {/* Notice Board Footnote */}
        <div className="mt-6 pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span>Verified by Mosque Committee &bull; Powered by All Masjid Timing Platform</span>
          </div>
          <div className="text-right">
            <span>Notice Board Copy &bull; Generated on {currentDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

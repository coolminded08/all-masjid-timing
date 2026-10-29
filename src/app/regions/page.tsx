import React from "react";
import Link from "next/link";
import { Globe2, MapPin, ChevronRight, Building2, Sparkles } from "lucide-react";
import { getAllMasjids } from "@/lib/store";

export default function RegionsPage() {
  const masjids = getAllMasjids();

  // Aggregate count by country and district
  const regionsMap: Record<string, { country: string; state: string; district: string; count: number }> = {};

  masjids.forEach((m) => {
    const key = `${m.country}-${m.state}-${m.district}`;
    if (!regionsMap[key]) {
      regionsMap[key] = {
        country: m.country,
        state: m.state,
        district: m.district,
        count: 0,
      };
    }
    regionsMap[key].count += 1;
  });

  const regions = Object.values(regionsMap);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          <Globe2 className="w-3.5 h-3.5 text-emerald-700" />
          Geographic Hierarchy (FR-9.1)
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Masjids by Region
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Explore congregational timings structured hierarchically from Country down to District
          and Locality.
        </p>
      </div>

      {/* Hierarchy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((reg) => (
          <Link
            key={`${reg.country}-${reg.district}`}
            href={`/?q=${encodeURIComponent(reg.district)}`}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex items-center justify-between group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider block">
                  {reg.country} &bull; {reg.state}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {reg.district} District
                </h3>
                <span className="text-xs text-emerald-700 font-medium">
                  {reg.count} verified masjids active
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* Pilot Region Callout */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Active Pilot Region
          </div>
          <h4 className="font-bold text-slate-900 text-base">
            Srinagar District (Jammu &amp; Kashmir)
          </h4>
          <p className="text-xs text-slate-600 max-w-xl">
            Initial crowd-verification and proximity testing is live across Srinagar central and
            neighborhood masjids.
          </p>
        </div>
        <Link
          href="/?q=Srinagar"
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm whitespace-nowrap"
        >
          Explore Srinagar Masjids
        </Link>
      </div>
    </div>
  );
}

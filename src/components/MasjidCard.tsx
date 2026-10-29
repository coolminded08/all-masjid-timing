import React from "react";
import Link from "next/link";
import {
  MapPin,
  Car,
  Accessibility,
  Flame,
  Users2,
  CalendarCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Masjid, PrayerName } from "@/lib/types";
import ConfidenceBadge from "./ConfidenceBadge";
import CountdownBadge from "./CountdownBadge";
import { formatDistance } from "@/lib/geo";

interface Props {
  masjid: Masjid & { distanceMeters?: number };
}

const PRAYER_ORDER: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export default function MasjidCard({ masjid }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {masjid.category === "landmark" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-200">
                  <Sparkles className="w-3 h-3 text-gold-600" />
                  Landmark
                </span>
              )}
              {masjid.category === "major" && (
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Central Masjid
                </span>
              )}
              <ConfidenceBadge
                tier={masjid.timings.fajr?.sourceTier || 2}
                confirmedCount={masjid.timings.fajr?.confirmedCount}
              />
            </div>

            <Link
              href={`/masjids/${masjid.slug}`}
              className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 focus:outline-none focus:underline"
            >
              {masjid.name}
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {masjid.locality}, {masjid.district}
              </span>
              {masjid.distanceMeters !== undefined && (
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
                  {formatDistance(masjid.distanceMeters)} away
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Countdown Badge */}
        <div className="mt-2 mb-4">
          <CountdownBadge masjid={masjid} />
        </div>

        {/* 5 Daily Prayers Table */}
        <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center mb-4">
          {PRAYER_ORDER.map((prayer) => {
            const timing = masjid.timings[prayer];
            return (
              <div key={prayer} className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {prayer}
                </span>
                <span className="text-sm font-bold text-slate-900 mt-0.5">
                  {timing?.iqamahTime || "--:--"}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Az: {timing?.azaanTime || "--:--"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Jumu'ah Notice */}
        {masjid.jumuahShifts && masjid.jumuahShifts.length > 0 && (
          <div className="flex items-center justify-between text-xs bg-emerald-50/70 border border-emerald-100/80 rounded-lg px-3 py-1.5 mb-3 text-emerald-950">
            <span className="font-medium flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              Jumu&apos;ah Jama&apos;ah:
            </span>
            <span className="font-bold">
              {masjid.jumuahShifts[0].iqamahTime} (Khutbah: {masjid.jumuahShifts[0].khutbahTime})
            </span>
          </div>
        )}

        {/* Amenities Bar */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
          {masjid.amenities.hasLadiesSection && (
            <span className="inline-flex items-center gap-1" title="Dedicated Ladies' Prayer Area">
              <Users2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ladies Area</span>
            </span>
          )}
          {masjid.amenities.hasParking && (
            <span className="inline-flex items-center gap-1" title="Parking Available">
              <Car className="w-3.5 h-3.5 text-slate-500" />
              <span>Parking</span>
            </span>
          )}
          {masjid.amenities.hasWarmWaterWudu && (
            <span className="inline-flex items-center gap-1" title="Warm Water Wudu in Winter">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Hot Water</span>
            </span>
          )}
          {masjid.amenities.hasWheelchairAccess && (
            <span className="inline-flex items-center gap-1" title="Wheelchair Accessible Ramp">
              <Accessibility className="w-3.5 h-3.5 text-blue-600" />
              <span>Accessible</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Card Actions */}
      <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Source: {masjid.timings.fajr?.sourceTier === 1 ? "Official Admin" : "Community Verified"}
        </span>
        <Link
          href={`/masjids/${masjid.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 focus:outline-none focus:underline"
        >
          View &amp; Vote
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

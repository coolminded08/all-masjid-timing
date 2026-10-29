"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Masjid, PrayerName } from "@/lib/types";

interface Props {
  masjid: Masjid;
  className?: string;
}

export default function CountdownBadge({ masjid, className = "" }: Props) {
  const [nextInfo, setNextInfo] = useState<{
    prayer: string;
    timeLeftStr: string;
    iqamahTime: string;
  } | null>(null);

  useEffect(() => {
    function computeNext() {
      const prayers: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      const now = new Date();

      // Get local time in masjid timezone
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

      let foundNext = null;

      for (const p of prayers) {
        const timing = masjid.timings[p];
        if (!timing || !timing.iqamahTime) continue;
        const [h, m] = timing.iqamahTime.split(":").map(Number);
        const prayerTotalMins = h * 60 + m;

        if (prayerTotalMins > currentTotalMins) {
          const diffMins = prayerTotalMins - currentTotalMins;
          const hrs = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

          foundNext = {
            prayer: p.toUpperCase(),
            timeLeftStr: timeStr,
            iqamahTime: timing.iqamahTime,
          };
          break;
        }
      }

      // If all passed today, next is Fajr tomorrow
      if (!foundNext && masjid.timings.fajr) {
        const [fh, fm] = masjid.timings.fajr.iqamahTime.split(":").map(Number);
        const minsLeft = 24 * 60 - currentTotalMins + (fh * 60 + fm);
        const hrs = Math.floor(minsLeft / 60);
        const mins = minsLeft % 60;
        foundNext = {
          prayer: "FAJR",
          timeLeftStr: `${hrs}h ${mins}m`,
          iqamahTime: masjid.timings.fajr.iqamahTime,
        };
      }

      setNextInfo(foundNext);
    }

    computeNext();
    const interval = setInterval(computeNext, 30000);
    return () => clearInterval(interval);
  }, [masjid]);

  if (!nextInfo) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
      <span>
        Next: <strong className="font-bold">{nextInfo.prayer}</strong> at{" "}
        {nextInfo.iqamahTime} (in {nextInfo.timeLeftStr})
      </span>
    </div>
  );
}

import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

export interface ComputedAstronomicalTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  hijriDate?: string;
  source: "aladhan-api" | "offline-engine";
}

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * 1. Tries to fetch exact astronomical prayer times + Hijri calendar from AlAdhan API.
 * 2. Falls back to local offline Adhan JS math engine in 0ms if offline or on network error.
 */
export async function getLiveAstronomicalTimes(
  latitude: number,
  longitude: number,
  timezone: string = "Asia/Kolkata",
  methodId: number = 1 // 1: Karachi, 3: MWL, 4: Umm Al-Qura
): Promise<ComputedAstronomicalTimes> {
  const timestamp = Math.floor(Date.now() / 1000);
  const aladhanUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${methodId}&school=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

    const res = await fetch(aladhanUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // Cache on edge for 1 hour
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const t = json.data.timings;
      const h = json.data.date.hijri;

      return {
        fajr: t.Fajr.slice(0, 5),
        sunrise: t.Sunrise.slice(0, 5),
        dhuhr: t.Dhuhr.slice(0, 5),
        asr: t.Asr.slice(0, 5),
        maghrib: t.Maghrib.slice(0, 5),
        isha: t.Isha.slice(0, 5),
        hijriDate: `${h.day} ${h.month.en} ${h.year} AH`,
        source: "aladhan-api",
      };
    }
  } catch (err) {
    // Graceful offline fallback
    console.warn("AlAdhan network fetch timed out or offline, using local calculation engine.");
  }

  // Local Offline Calculation Engine Fallback
  return computeDailyAstronomicalTimes(latitude, longitude, new Date(), "Karachi", timezone);
}

export function computeDailyAstronomicalTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method: string = "Karachi",
  timezone: string = "Asia/Kolkata"
): ComputedAstronomicalTimes {
  const coords = new Coordinates(latitude, longitude);

  let params = CalculationMethod.Karachi();
  if (method.toLowerCase().includes("mwl")) {
    params = CalculationMethod.MuslimWorldLeague();
  } else if (method.toLowerCase().includes("ummalqura")) {
    params = CalculationMethod.UmmAlQura();
  }

  const times = new PrayerTimes(coords, date, params);

  return {
    fajr: formatTime(times.fajr, timezone),
    sunrise: formatTime(times.sunrise, timezone),
    dhuhr: formatTime(times.dhuhr, timezone),
    asr: formatTime(times.asr, timezone),
    maghrib: formatTime(times.maghrib, timezone),
    isha: formatTime(times.isha, timezone),
    source: "offline-engine",
  };
}

export function getMinutesUntilTime(timeStr: string, timezone: string): number {
  const [targetH, targetM] = timeStr.split(":").map(Number);
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const currentH = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const currentM = Number(parts.find((p) => p.type === "minute")?.value || 0);

  const currentTotalMins = currentH * 60 + currentM;
  const targetTotalMins = targetH * 60 + targetM;

  return targetTotalMins - currentTotalMins;
}

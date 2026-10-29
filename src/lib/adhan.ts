import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";

export interface ComputedAstronomicalTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  hijriDate?: string;
  source: "ummah-api" | "aladhan-api" | "offline-engine";
}

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

const UMMAH_KEY = process.env.UMMAH_API_KEY || "umh_0e672a937d45f3c4a6d5eb5979d5fdebcdf152f0";

/**
 * Triple-Redundancy Astronomical Provider:
 * 1. UmmahAPI (Fastest, dedicated authenticated key)
 * 2. AlAdhan API (Global secondary fallback)
 * 3. Local Adhan JS engine (0ms offline failover)
 */
export async function getLiveAstronomicalTimes(
  latitude: number,
  longitude: number,
  timezone: string = "Asia/Kolkata",
  methodId: number = 1
): Promise<ComputedAstronomicalTimes> {
  // Strategy 1: UmmahAPI (using your developer key)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const ummahUrl = `https://ummahapi.com/api/prayer-times?lat=${latitude.toFixed(2)}&lng=${longitude.toFixed(2)}&apikey=${UMMAH_KEY}`;
    const res = await fetch(ummahUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.prayer_times) {
        const t = json.data.prayer_times;
        return {
          fajr: t.fajr,
          sunrise: t.sunrise,
          dhuhr: t.dhuhr,
          asr: t.asr,
          maghrib: t.maghrib,
          isha: t.isha,
          source: "ummah-api",
        };
      }
    }
  } catch (e) {
    // Failover to Strategy 2
    console.warn("UmmahAPI request failed or timed out; falling back to AlAdhan.");
  }

  // Strategy 2: AlAdhan Global API
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const aladhanUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=${methodId}&school=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(aladhanUrl, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const t = json.data.timings;
      const h = json.data.date?.hijri;

      return {
        fajr: t.Fajr.slice(0, 5),
        sunrise: t.Sunrise.slice(0, 5),
        dhuhr: t.Dhuhr.slice(0, 5),
        asr: t.Asr.slice(0, 5),
        maghrib: t.Maghrib.slice(0, 5),
        isha: t.Isha.slice(0, 5),
        hijriDate: h ? `${h.day} ${h.month.en} ${h.year} AH` : undefined,
        source: "aladhan-api",
      };
    }
  } catch (err) {
    console.warn("AlAdhan network fetch failed; falling back to local calculation engine.");
  }

  // Strategy 3: Local Offline Calculation Engine Fallback (0ms, 100% uptime)
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

import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from "adhan";

export interface ComputedAstronomicalTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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
  } else if (method.toLowerCase().includes("egypt")) {
    params = CalculationMethod.Egyptian();
  }

  const times = new PrayerTimes(coords, date, params);

  return {
    fajr: formatTime(times.fajr, timezone),
    sunrise: formatTime(times.sunrise, timezone),
    dhuhr: formatTime(times.dhuhr, timezone),
    asr: formatTime(times.asr, timezone),
    maghrib: formatTime(times.maghrib, timezone),
    isha: formatTime(times.isha, timezone),
  };
}

/**
 * Calculates how many minutes until a given "HH:mm" time today.
 * If the time has passed today, returns negative or minutes until tomorrow's prayer.
 */
export function getMinutesUntilTime(timeStr: string, timezone: string): number {
  const [targetH, targetM] = timeStr.split(":").map(Number);
  const now = new Date();
  
  // Format now in masjid's timezone to get current local hour & minute
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

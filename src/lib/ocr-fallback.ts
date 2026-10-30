/**
 * Islamic Prayer Schedule OCR Heuristics & Text Normalizer
 * Designed to eliminate "confused results" from OCR engines (Tesseract / raw text)
 * when parsing Mosque Timetable boards and digital displays.
 */

export interface ParsedPrayerTimings {
  fajr: { azaanTime: string; iqamahTime: string };
  dhuhr: { azaanTime: string; iqamahTime: string };
  asr: { azaanTime: string; iqamahTime: string };
  maghrib: { azaanTime: string; iqamahTime: string };
  isha: { azaanTime: string; iqamahTime: string };
  jummah?: { azaanTime?: string; iqamahTime?: string };
  masjidName?: string;
  locality?: string;
  detectedText?: string;
}

/**
 * Normalizes an ambiguous time string (e.g. "1:30", "4.45", "05:15") into 24-hour HH:mm
 * based on the canonical Islamic prayer window.
 */
export function normalizePrayerTime(
  rawTime: string,
  prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha" | "jummah"
): string {
  if (!rawTime) return "";

  // Normalize delimiters (e.g. "5.15" -> "5:15", "5-15" -> "5:15", "5 15" -> "5:15")
  const cleaned = rawTime.trim().replace(/[.\-\s]/g, ":").replace(/[^0-9:]/g, "");
  const parts = cleaned.split(":");
  if (parts.length < 2) return "";

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
    return "";
  }

  // Canonical prayer time windows for disambiguating 12h to 24h:
  switch (prayer) {
    case "fajr":
      // Fajr is early morning: 03:00 to 07:00
      if (hours >= 12) hours -= 12;
      break;

    case "dhuhr":
    case "jummah":
      // Dhuhr & Jummah are midday: 11:00 to 15:00
      // 12:xx is 12:xx, but 1:xx is 13:xx, 2:xx is 14:xx
      if (hours >= 1 && hours <= 6) {
        hours += 12;
      }
      break;

    case "asr":
      // Asr is late afternoon: 14:00 to 18:30
      // 2:xx is 14:xx, 3:xx is 15:xx, 4:xx is 16:xx, 5:xx is 17:xx
      if (hours >= 1 && hours <= 11) {
        hours += 12;
      }
      break;

    case "maghrib":
      // Maghrib is sunset/evening: 16:30 to 20:30
      // 5:xx is 17:xx, 6:xx is 18:xx, 7:xx is 19:xx, 8:xx is 20:xx
      if (hours >= 1 && hours <= 11) {
        hours += 12;
      }
      break;

    case "isha":
      // Isha is night: 18:00 to 23:30
      // 7:xx is 19:xx, 8:xx is 20:xx, 9:xx is 21:xx, 10:xx is 22:xx
      if (hours >= 1 && hours <= 11) {
        hours += 12;
      }
      break;
  }

  const paddedH = hours.toString().padStart(2, "0");
  const paddedM = minutes.toString().padStart(2, "0");
  return `${paddedH}:${paddedM}`;
}

/**
 * Robust regex rules for identifying prayers across English, Urdu, Arabic, and transliterations.
 */
const PRAYER_PATTERNS = {
  fajr: /\b(fajr|fajar|subh|subah|فجر|صبح)\b/i,
  dhuhr: /\b(dhuhr|zuhr|zohar|duhr|zuhur|ظهر|ظہر)\b/i,
  asr: /\b(asr|asar|aser|عصر)\b/i,
  maghrib: /\b(maghrib|magrib|maghreb|مغرب)\b/i,
  isha: /\b(isha|esha|ishaa|eishaa|عشاء|عشا)\b/i,
  jummah: /\b(jummah|juma|jumuah|friday|جمعہ|جمعه)\b/i,
};

const TIME_REGEX = /\b([0-1]?[0-9]|2[0-3])[:.]([0-5][0-9])\b/g;

/**
 * Extracts prayer timings from OCR raw text output
 */
export function parseTimetableFromOCR(text: string): ParsedPrayerTimings {
  const result: ParsedPrayerTimings = {
    fajr: { azaanTime: "", iqamahTime: "" },
    dhuhr: { azaanTime: "", iqamahTime: "" },
    asr: { azaanTime: "", iqamahTime: "" },
    maghrib: { azaanTime: "", iqamahTime: "" },
    isha: { azaanTime: "", iqamahTime: "" },
    jummah: { azaanTime: "", iqamahTime: "" },
    detectedText: text,
  };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Attempt to detect Mosque name from top lines
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i];
    if (/\b(masjid|mosque|jamia|markaz|جامع|مسجد)\b/i.test(line) && line.length < 60) {
      result.masjidName = line.replace(/[^a-zA-Z0-9\s&'-]/g, "").trim();
      break;
    }
  }

  // Parse lines to locate prayer rows
  for (const line of lines) {
    for (const [prayerKey, pattern] of Object.entries(PRAYER_PATTERNS)) {
      const p = prayerKey as keyof typeof PRAYER_PATTERNS;
      if (pattern.test(line)) {
        // Extract all times in this line
        const matches = Array.from(line.matchAll(TIME_REGEX));
        if (matches.length >= 2) {
          // Usually first is Azaan, second is Iqamah (or vice versa on some boards)
          const t1 = normalizePrayerTime(matches[0][0], p);
          const t2 = normalizePrayerTime(matches[1][0], p);
          if (p === "jummah") {
            result.jummah = { azaanTime: t1, iqamahTime: t2 };
          } else {
            result[p] = { azaanTime: t1, iqamahTime: t2 };
          }
        } else if (matches.length === 1) {
          const t1 = normalizePrayerTime(matches[0][0], p);
          if (p === "jummah") {
            result.jummah = { iqamahTime: t1 };
          } else {
            // Default single time to Iqamah (since jama'at time is what worshippers need most)
            result[p].iqamahTime = t1;
          }
        }
      }
    }
  }

  return result;
}

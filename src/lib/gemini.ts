import { GoogleGenAI } from "@google/genai";
import { normalizePrayerTime } from "./ocr-fallback";

export interface ExtractedTimetable {
  masjidName?: string;
  locality?: string;
  confidence: number;
  notes?: string;
  timings: {
    fajr: { azaanTime: string; iqamahTime: string };
    dhuhr: { azaanTime: string; iqamahTime: string };
    asr: { azaanTime: string; iqamahTime: string };
    maghrib: { azaanTime: string; iqamahTime: string };
    isha: { azaanTime: string; iqamahTime: string };
    jummah?: { azaanTime?: string; iqamahTime?: string };
  };
  source: "gemini" | "groq" | "tesseract-fallback";
  storagePath?: string;
}

/**
 * Extracts prayer timetable data from an image buffer or base64 using Gemini Vision AI.
 * Automatically handles 24-hour normalization and separates Azaan vs Iqamah timings.
 */
export async function extractPrayerTimetableWithGemini(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedTimetable> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // System instruction and structured guidance for high accuracy
  const prompt = `
You are an expert Islamic Mosque Timetable OCR and Vision intelligence engine.
Analyze this image of a mosque prayer schedule, digital clock display, whiteboard, or printed chart.

TASK:
1. Extract the name of the Mosque / Masjid if visible.
2. Extract the locality, city, or area if visible.
3. Extract the prayer timings for all 5 daily prayers (Fajr, Dhuhr / Zuhr, Asr, Maghrib, Isha) and Friday prayer (Jummah).
   - Support Urdu & Arabic boards (اوقات نماز): فجر (Fajr), ظہر (Zuhr/Dhuhr), عصر (Asr), مغرب (Maghrib), عشاء (Isha), جمعہ (Jummah).
   - Ignore secondary reference rows like طلوع آفتاب (Sunrise), غروب آفتاب (Sunset), and صبح صادق (Dawn/Subah Sadiq).
   - Distinguish between Azaan (start time) and Iqamah / Jama'at (congregational prayer time).
   - If only one time is listed per prayer (e.g. 5:45 فجر, 1:15 ظہر, 4:55 عصر, 6:35 مغرب, 8:10 عشاء), assign it to 'iqamahTime'.
   - Format ALL times strictly in 24-hour HH:mm format (e.g., "05:45", "13:15", "16:55", "18:35", "20:10").
   - NEVER confuse afternoon prayers with AM times (e.g., Dhuhr is around 12:xx or 13:xx, Asr is around 15:xx or 16:xx, Maghrib is around 17:xx or 18:xx, Isha is around 19:xx or 20:xx).
4. Provide a confidence score between 0.0 and 1.0 based on how clear and unambiguous the numbers are.
5. Provide any brief notes (e.g., schedule date range, "Starts from 1st of Ramadan", etc.).

Return strictly a valid JSON object matching this schema:
{
  "masjidName": "string or null",
  "locality": "string or null",
  "confidence": 0.95,
  "notes": "string or null",
  "timings": {
    "fajr": { "azaanTime": "05:15", "iqamahTime": "05:45" },
    "dhuhr": { "azaanTime": "12:30", "iqamahTime": "13:15" },
    "asr": { "azaanTime": "15:45", "iqamahTime": "16:15" },
    "maghrib": { "azaanTime": "17:45", "iqamahTime": "17:50" },
    "isha": { "azaanTime": "19:15", "iqamahTime": "19:45" },
    "jummah": { "azaanTime": "12:30", "iqamahTime": "13:30" }
  }
}
`;

  // Strip prefix data URL if present (e.g. data:image/png;base64,...)
  const cleanBase64 = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

  // Primary model: gemini-2.5-flash (or gemini-1.5-flash fallback)
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1, // low temperature for deterministic, accurate facts
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error(`Empty response received from Gemini model ${model}`);
      }

      // Parse JSON from response
      const parsed = JSON.parse(responseText);

      // Validate and ensure 24h normalization on all extracted timings
      const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
      const normalizedTimings: any = {};

      for (const p of prayers) {
        const prayerData = parsed.timings?.[p] || {};
        normalizedTimings[p] = {
          azaanTime: normalizePrayerTime(prayerData.azaanTime || "", p) || prayerData.azaanTime || "",
          iqamahTime: normalizePrayerTime(prayerData.iqamahTime || "", p) || prayerData.iqamahTime || "",
        };
      }

      if (parsed.timings?.jummah) {
        normalizedTimings.jummah = {
          azaanTime: normalizePrayerTime(parsed.timings.jummah.azaanTime || "", "jummah") || "",
          iqamahTime: normalizePrayerTime(parsed.timings.jummah.iqamahTime || "", "jummah") || "",
        };
      }

      return {
        masjidName: parsed.masjidName || undefined,
        locality: parsed.locality || undefined,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
        notes: parsed.notes || undefined,
        timings: normalizedTimings,
        source: "gemini",
      };
    } catch (err: any) {
      lastError = err;
      // If error is model not found or rate limit, loop tries the next flash model
      console.warn(`[Gemini OCR] Model ${model} failed, trying fallback:`, err.message);
    }
  }

  throw lastError || new Error("All Gemini OCR models failed.");
}

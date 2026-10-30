import Groq from "groq-sdk";
import { ExtractedTimetable } from "./gemini";
import { normalizePrayerTime } from "./ocr-fallback";

/**
 * High-speed secondary vision engine using Groq Llama-3.2 Vision.
 * Provides <400ms timetable extraction when Gemini is unavailable or rate-limited.
 */
export async function extractPrayerTimetableWithGroq(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedTimetable> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured.");
  }

  const groq = new Groq({ apiKey });

  const cleanBase64 = base64Data.includes(",")
    ? base64Data.split(",")[1]
    : base64Data;

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
   - NEVER confuse afternoon prayers with AM times.
4. Provide a confidence score between 0.0 and 1.0.
5. Provide any brief notes (e.g., validity dates).

Return strictly a valid JSON object matching this schema:
{
  "masjidName": "string or null",
  "locality": "string or null",
  "confidence": 0.92,
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

  const models = ["llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const groqPromise = groq.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${cleanBase64}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Groq ${model} request timed out`)), 5000)
      );

      const response = await Promise.race([groqPromise, timeoutPromise]);

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error(`Empty response received from Groq model ${model}`);
      }

      const parsed = JSON.parse(responseText);
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
        source: "groq",
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Groq OCR] Model ${model} failed:`, err.message);
    }
  }

  throw lastError || new Error("All Groq vision models failed.");
}

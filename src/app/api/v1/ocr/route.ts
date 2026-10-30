import { NextRequest, NextResponse } from "next/server";
import { extractPrayerTimetableWithGemini, ExtractedTimetable } from "@/lib/gemini";
import { extractPrayerTimetableWithGroq } from "@/lib/groq";
import { parseTimetableFromOCR } from "@/lib/ocr-fallback";
import { createWorker } from "tesseract.js";

export const maxDuration = 30; // Extend Vercel function timeout if on Pro

export async function POST(req: NextRequest) {
  try {
    let base64Image = "";
    let mimeType = "image/jpeg";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      base64Image = body.image;
      mimeType = body.mimeType || "image/jpeg";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided in form data" },
          { status: 400 }
        );
      }
      mimeType = file.type || "image/jpeg";
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Image = buffer.toString("base64");
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported Content-Type. Use JSON or multipart/form-data" },
        { status: 400 }
      );
    }

    if (!base64Image) {
      return NextResponse.json(
        { success: false, error: "Missing image data" },
        { status: 400 }
      );
    }

    // Clean data URL prefix if user sent full data URI
    if (base64Image.includes(",")) {
      const parts = base64Image.split(",");
      base64Image = parts[1];
    }

    // 1. Primary Engine: Google Gemini Vision AI (@google/genai)
    if (process.env.GEMINI_API_KEY) {
      try {
        const extracted = await extractPrayerTimetableWithGemini(base64Image, mimeType);
        return NextResponse.json({
          success: true,
          data: extracted,
          engine: "gemini",
          message: "Timings extracted with Gemini Vision AI.",
        });
      } catch (geminiError: any) {
        console.warn("[OCR API] Gemini extraction failed, trying secondary engine:", geminiError.message);
      }
    }

    // 2. Secondary Engine: Groq Llama-3.2 Vision (groq-sdk)
    if (process.env.GROQ_API_KEY) {
      try {
        const extracted = await extractPrayerTimetableWithGroq(base64Image, mimeType);
        return NextResponse.json({
          success: true,
          data: extracted,
          engine: "groq",
          message: "Timings extracted with Groq Llama-3.2 Vision.",
        });
      } catch (groqError: any) {
        console.warn("[OCR API] Groq extraction failed, falling back to Tesseract OCR:", groqError.message);
      }
    }

    // 3. Tertiary Engine: Vercel-compatible Tesseract.js fallback
    try {
      const imageBuffer = Buffer.from(base64Image, "base64");
      const worker = await createWorker("eng");
      const ret = await worker.recognize(imageBuffer);
      await worker.terminate();

      const rawText = ret.data.text || "";
      const parsedTimes = parseTimetableFromOCR(rawText);

      const fallbackResult: ExtractedTimetable = {
        masjidName: parsedTimes.masjidName,
        locality: parsedTimes.locality,
        confidence: 0.65, // OCR heuristics lower baseline confidence
        notes: "Parsed using local Tesseract OCR fallback engine. Please verify the timings.",
        timings: {
          fajr: parsedTimes.fajr,
          dhuhr: parsedTimes.dhuhr,
          asr: parsedTimes.asr,
          maghrib: parsedTimes.maghrib,
          isha: parsedTimes.isha,
          jummah: parsedTimes.jummah,
        },
        source: "tesseract-fallback",
      };

      return NextResponse.json({
        success: true,
        data: fallbackResult,
        engine: "tesseract-fallback",
        warning: process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY
          ? "Cloud Vision APIs were busy or reached limits. Processed with Tesseract OCR fallback."
          : "Cloud Vision API keys not configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env.local for higher accuracy.",
      });
    } catch (tesseractError: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to extract text using vision models and local OCR.",
          details: tesseractError.message,
          suggestion: "Please configure a valid GEMINI_API_KEY or GROQ_API_KEY in .env.local for reliable timetable scanning.",
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

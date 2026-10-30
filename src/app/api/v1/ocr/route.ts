import { NextRequest, NextResponse } from "next/server";
import { extractPrayerTimetableWithGemini, ExtractedTimetable } from "@/lib/gemini";
import { extractPrayerTimetableWithGroq } from "@/lib/groq";
import { parseTimetableFromOCR } from "@/lib/ocr-fallback";
import { createWorker } from "tesseract.js";
import { uploadPrivateProofImage } from "@/lib/supabase/storage";

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

    const imageBuffer = Buffer.from(base64Image, "base64");

    // Upload to private Supabase Storage concurrently in background so it never holds up OCR
    const storagePromise = uploadPrivateProofImage(imageBuffer, mimeType).catch((uploadErr) => {
      console.warn("[OCR API] Storage background upload notice:", uploadErr?.message);
      return null;
    });

    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasGroq = Boolean(process.env.GROQ_API_KEY);

    // If no vision API keys are present in Vercel environment variables,
    // fail fast immediately instead of letting local Tesseract download binaries and time out!
    if (!hasGemini && !hasGroq) {
      return NextResponse.json(
        {
          success: false,
          error: "GEMINI_API_KEY is not configured in Vercel Environment Variables.",
          details: "Please go to your Vercel Dashboard -> Project Settings -> Environment Variables, add GEMINI_API_KEY, and redeploy.",
          suggestion: "You can enter the prayer times manually into the form fields below.",
        },
        { status: 503 }
      );
    }

    let extracted: ExtractedTimetable | null = null;
    let engineUsed: "gemini" | "groq" | "tesseract-fallback" = "gemini";
    let warningMessage: string | undefined;

    // 1. Primary Engine: Google Gemini Vision AI (@google/genai)
    if (hasGemini) {
      try {
        extracted = await extractPrayerTimetableWithGemini(base64Image, mimeType);
        engineUsed = "gemini";
      } catch (geminiError: any) {
        console.warn("[OCR API] Gemini extraction failed, trying secondary engine:", geminiError?.message);
      }
    }

    // 2. Secondary Engine: Groq Llama-3.2 Vision (groq-sdk)
    if (!extracted && hasGroq) {
      try {
        extracted = await extractPrayerTimetableWithGroq(base64Image, mimeType);
        engineUsed = "groq";
      } catch (groqError: any) {
        console.warn("[OCR API] Groq extraction failed:", groqError?.message);
      }
    }

    // 3. Tertiary Engine: Vercel-compatible Tesseract.js fallback with strict 4.5s budget
    if (!extracted) {
      try {
        const tesseractPromise = (async () => {
          const worker = await createWorker("eng");
          const ret = await worker.recognize(imageBuffer);
          await worker.terminate();
          const rawText = ret.data.text || "";
          return parseTimetableFromOCR(rawText);
        })();

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Local OCR processing exceeded timeout budget")), 4500)
        );

        const parsedTimes = await Promise.race([tesseractPromise, timeoutPromise]);
        extracted = {
          masjidName: parsedTimes.masjidName,
          locality: parsedTimes.locality,
          confidence: 0.65,
          notes: "Parsed using fallback engine. Please verify the timings.",
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
        engineUsed = "tesseract-fallback";
        warningMessage = "Cloud Vision AI temporarily busy. Processed with fallback engine. Please double check timings.";
      } catch (tesseractError: any) {
        return NextResponse.json(
          {
            success: false,
            error: "Unable to process the image within the serverless time budget.",
            details: tesseractError?.message,
            suggestion: "Please verify that GEMINI_API_KEY is active in your Vercel Project Settings, or enter the prayer timings manually.",
          },
          { status: 504 }
        );
      }
    }

    // Attach private storage proof path if upload completed
    try {
      const uploadResult = await Promise.race([
        storagePromise,
        new Promise<{ path: string } | null>((resolve) => setTimeout(() => resolve(null), 1500)),
      ]);
      if (uploadResult?.path && extracted) {
        extracted.storagePath = uploadResult.path;
      }
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      data: extracted,
      engine: engineUsed,
      warning: warningMessage,
      message: `Timings successfully extracted with ${engineUsed === "gemini" ? "Gemini Vision AI" : engineUsed === "groq" ? "Groq Llama-3.2 Vision" : "Fallback OCR"}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

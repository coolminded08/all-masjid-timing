import { NextRequest, NextResponse } from "next/server";
import { getJummahSermons, addJummahSermon, JummahFilters } from "@/lib/store";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { z } from "zod";

const JummahSubmissionSchema = z.object({
  masjidName: z.string().min(3, "Masjid name must be at least 3 characters").max(100),
  locality: z.string().min(2, "Locality is required").max(100),
  city: z.string().min(2, "City is required").max(80),
  state: z.string().optional(),
  country: z.string().default("Pakistan"),
  address: z.string().optional(),
  khateebName: z.string().min(3, "Speaker name must be at least 3 characters").max(100),
  khateebTitle: z.string().min(2, "Title is required (e.g., Mufti, Maulana, Dr., Sheikh)").max(50),
  khateebBio: z.string().max(800).optional(),
  topic: z.string().min(3, "Topic must be at least 3 characters").max(200),
  description: z.string().max(1500).optional(),
  language: z.enum([
    "urdu",
    "english",
    "arabic",
    "pashto",
    "punjabi",
    "sindhi",
    "kashmiri",
    "bengali",
    "other",
  ]),
  secondaryLanguage: z.string().optional(),
  bayanTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Bayan time must be HH:mm (e.g. 12:45)"),
  khutbahTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Khutbah time must be HH:mm (e.g. 13:30)"),
  jamatTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Jama'at time must be HH:mm (e.g. 13:45)"),
  livestreamUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  recordingUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  audioOnlyUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isWeeklyRecurring: z.boolean().default(true),
  specialDate: z.string().optional(),
  contactNumber: z.string().optional(),
  turnstileToken: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: JummahFilters = {
      city: searchParams.get("city") || undefined,
      language: (searchParams.get("language") as any) || undefined,
      hasLivestream: searchParams.has("livestream")
        ? searchParams.get("livestream") === "true"
        : undefined,
      query: searchParams.get("q") || undefined,
    };

    const sermons = getJummahSermons(filters);

    return NextResponse.json({
      success: true,
      data: sermons,
      count: sermons.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch Jummah sermons" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify Cloudflare Turnstile
    if (body.turnstileToken) {
      const isHuman = await verifyTurnstileToken(body.turnstileToken);
      if (!isHuman) {
        return NextResponse.json(
          {
            success: false,
            error: "Security verification failed. Please check the captcha checkbox.",
          },
          { status: 403 }
        );
      }
    }

    const validated = JummahSubmissionSchema.parse(body);

    const newSermon = addJummahSermon({
      masjidName: validated.masjidName,
      locality: validated.locality,
      city: validated.city,
      state: validated.state,
      country: validated.country,
      address: validated.address,
      khateebName: validated.khateebName,
      khateebTitle: validated.khateebTitle,
      khateebBio: validated.khateebBio,
      topic: validated.topic,
      description: validated.description,
      language: validated.language,
      secondaryLanguage: validated.secondaryLanguage,
      bayanTime: validated.bayanTime,
      khutbahTime: validated.khutbahTime,
      jamatTime: validated.jamatTime,
      livestreamUrl: validated.livestreamUrl || undefined,
      recordingUrl: validated.recordingUrl || undefined,
      audioOnlyUrl: validated.audioOnlyUrl || undefined,
      isWeeklyRecurring: validated.isWeeklyRecurring,
      specialDate: validated.specialDate,
      status: "active",
      contactNumber: validated.contactNumber,
    });

    return NextResponse.json({
      success: true,
      data: newSermon,
      message: "Jummah sermon successfully listed in the directory.",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: err.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

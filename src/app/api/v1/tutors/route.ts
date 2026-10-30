import { NextRequest, NextResponse } from "next/server";
import { getQuranTutors, addQuranTutor, TutorFilters } from "@/lib/store";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { z } from "zod";

const TutorSubmissionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(80),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  gender: z.enum(["male", "female"]),
  bio: z.string().min(20, "Bio should be at least 20 characters").max(1500),
  photoUrl: z.string().url().optional().or(z.literal("")),
  hasIjazah: z.boolean().default(false),
  subjects: z.array(z.string()).min(1, "Select at least one teaching subject"),
  teachingMode: z.enum(["online", "in-person", "both"]),
  targetAudience: z.array(z.string()).min(1, "Select at least one student group"),
  experienceYears: z.number().min(0).max(60).default(1),
  languages: z.array(z.string()).min(1, "Specify at least one language"),
  locality: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  feeType: z.enum(["free", "paid", "flexible"]).default("paid"),
  monthlyFeeAmount: z.number().optional(),
  freeTrialAvailable: z.boolean().default(true),
  weeklyAvailabilityHours: z.number().optional(),
  whatsappNumber: z.string().min(8, "Valid WhatsApp number is required"),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: TutorFilters = {
      gender: (searchParams.get("gender") as any) || undefined,
      mode: (searchParams.get("mode") as any) || undefined,
      subject: (searchParams.get("subject") as any) || undefined,
      feeType: (searchParams.get("feeType") as any) || undefined,
      query: searchParams.get("q") || undefined,
      hasIjazah: searchParams.has("ijazah")
        ? searchParams.get("ijazah") === "true"
        : undefined,
    };

    const tutors = getQuranTutors(filters);

    return NextResponse.json({
      success: true,
      count: tutors.length,
      data: tutors,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch tutors" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Enforce Cloudflare Turnstile Verification for Database Security
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      "";

    const turnstileCheck = await verifyTurnstileToken(
      body.turnstileToken,
      clientIp
    );

    if (!turnstileCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            turnstileCheck.error ||
            "Cloudflare Turnstile challenge failed. Automated bot activity detected.",
        },
        { status: 403 }
      );
    }

    // 2. Validate Body Fields
    const validated = TutorSubmissionSchema.parse(body);

    // 3. Store Tutor
    const newTutor = addQuranTutor({
      name: validated.name,
      title: validated.title,
      gender: validated.gender,
      bio: validated.bio,
      photoUrl: validated.photoUrl || undefined,
      isVerified: false, // Community submissions start unverified
      hasIjazah: validated.hasIjazah,
      subjects: validated.subjects as any,
      teachingMode: validated.teachingMode,
      targetAudience: validated.targetAudience as any,
      experienceYears: validated.experienceYears,
      languages: validated.languages,
      locality: validated.locality,
      district: validated.district,
      state: validated.state,
      country: validated.country,
      feeType: validated.feeType,
      monthlyFeeAmount: validated.monthlyFeeAmount,
      freeTrialAvailable: validated.freeTrialAvailable,
      weeklyAvailabilityHours: validated.weeklyAvailabilityHours,
      whatsappNumber: validated.whatsappNumber,
      phoneNumber: validated.phoneNumber,
      email: validated.email || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Tutor profile posted successfully!",
        data: newTutor,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || "Failed to create tutor listing" },
      { status: 500 }
    );
  }
}

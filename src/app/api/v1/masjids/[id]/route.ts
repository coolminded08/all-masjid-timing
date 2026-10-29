import { NextRequest, NextResponse } from "next/server";
import { getMasjidBySlug } from "@/lib/store";
import { computeDailyAstronomicalTimes } from "@/lib/adhan";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const masjid = getMasjidBySlug(id);

  if (!masjid) {
    return NextResponse.json(
      { success: false, error: "Masjid not found" },
      { status: 404 }
    );
  }

  // Calculate live astronomical Azaan times for today
  const astronomical = computeDailyAstronomicalTimes(
    masjid.latitude,
    masjid.longitude,
    new Date(),
    masjid.calculationMethod,
    masjid.timezone
  );

  return NextResponse.json({
    success: true,
    data: {
      ...masjid,
      calculatedAstronomical: astronomical,
    },
    provenance: {
      sourceTier: masjid.category === "landmark" ? 1 : 2,
      astronomicalEngine: "Adhan JS (Karachi / MWL / UmmAlQura)",
      timestamp: new Date().toISOString(),
    },
  });
}

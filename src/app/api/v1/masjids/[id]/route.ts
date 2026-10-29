import { NextRequest, NextResponse } from "next/server";
import { getMasjidBySlug } from "@/lib/store";
import { getLiveAstronomicalTimes } from "@/lib/adhan";

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

  // Calculate live astronomical Azaan times via AlAdhan API with local fallback
  const astronomical = await getLiveAstronomicalTimes(
    masjid.latitude,
    masjid.longitude,
    masjid.timezone,
    masjid.calculationMethod.toLowerCase().includes("ummalqura") ? 4 : 1
  );

  return NextResponse.json({
    success: true,
    data: {
      ...masjid,
      calculatedAstronomical: astronomical,
    },
    provenance: {
      sourceTier: masjid.category === "landmark" ? 1 : 2,
      astronomicalProvider: astronomical.source === "aladhan-api" ? "AlAdhan Global API (v1)" : "Adhan JS (Offline Engine)",
      hijriDate: astronomical.hijriDate || null,
      timestamp: new Date().toISOString(),
    },
  });
}

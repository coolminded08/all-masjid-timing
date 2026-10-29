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

  // Calculate live astronomical Azaan times via UmmahAPI (primary) -> AlAdhan -> Offline engine
  const astronomical = await getLiveAstronomicalTimes(
    masjid.latitude,
    masjid.longitude,
    masjid.timezone,
    masjid.calculationMethod.toLowerCase().includes("ummalqura") ? 4 : 1
  );

  let providerLabel = "UmmahAPI (ummahapi.com)";
  if (astronomical.source === "aladhan-api") providerLabel = "AlAdhan Global API (v1)";
  if (astronomical.source === "offline-engine") providerLabel = "Adhan JS (Offline Engine)";

  return NextResponse.json({
    success: true,
    data: {
      ...masjid,
      calculatedAstronomical: astronomical,
    },
    provenance: {
      sourceTier: masjid.category === "landmark" ? 1 : 2,
      astronomicalProvider: providerLabel,
      hijriDate: astronomical.hijriDate || null,
      timestamp: new Date().toISOString(),
    },
  });
}

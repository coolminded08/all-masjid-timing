import { NextResponse } from "next/server";
import { getAllMasjids } from "@/lib/store";

export async function GET() {
  const masjids = getAllMasjids();

  const sanitized = masjids.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    status: m.status,
    latitude: m.latitude,
    longitude: m.longitude,
    locality: m.locality,
    district: m.district,
    state: m.state,
    country: m.country,
    timezone: m.timezone,
    calculationMethod: m.calculationMethod,
    amenities: m.amenities,
    timings: m.timings,
    jumuahShifts: m.jumuahShifts,
    updatedAt: m.updatedAt,
  }));

  return new NextResponse(JSON.stringify(sanitized, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="all-masjid-timing-export.json"',
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getAllMasjids, findNearbyMasjids, checkForDuplicateMasjid, createMasjid } from "@/lib/store";
import { CreateMasjidSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const radiusParam = searchParams.get("radius");
  const query = searchParams.get("q")?.toLowerCase();

  let results = getAllMasjids();

  // Proximity search
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    const radius = radiusParam ? parseInt(radiusParam, 10) : 10000;
    const nearby = findNearbyMasjids(lat, lng, radius);
    return NextResponse.json({
      success: true,
      count: nearby.length,
      provenance: {
        engine: "PostGIS-emulated Haversine",
        timestamp: new Date().toISOString(),
      },
      data: nearby,
    });
  }

  // Text search
  if (query) {
    results = results.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.locality.toLowerCase().includes(query) ||
        m.district.toLowerCase().includes(query) ||
        m.country.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    success: true,
    count: results.length,
    provenance: {
      license: "Open Data Commons Attribution License (ODC-By)",
      timestamp: new Date().toISOString(),
    },
    data: results,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateMasjidSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Duplicate check within 50 meters
    const dupCheck = checkForDuplicateMasjid(data.latitude, data.longitude, data.name);
    if (dupCheck.isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "Potential duplicate masjid detected nearby.",
          duplicateCandidate: dupCheck.duplicateCandidate,
          distanceMeters: dupCheck.distanceMeters,
        },
        { status: 409 }
      );
    }

    // Format new masjid
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const newMasjid = createMasjid({
      name: data.name,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      category: data.category,
      status: "unverified",
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || `${data.locality}, ${data.district}`,
      locality: data.locality,
      district: data.district,
      state: data.state,
      country: data.country,
      timezone: "Asia/Kolkata", // Can be resolved via geo-tz
      calculationMethod: "Karachi",
      verificationPhotoPath: data.verificationPhotoPath || undefined,
      amenities: data.amenities,
      timings: Object.entries(data.timings).reduce((acc, [prayer, timing]) => {
        acc[prayer as any] = {
          prayer: prayer as any,
          azaanTime: timing.azaanTime,
          iqamahTime: timing.iqamahTime,
          isFixed: timing.isFixed,
          sourceTier: 3, // Starts as Unconfirmed crowd submission
          lastConfirmedAt: new Date().toISOString(),
          confirmedCount: 1,
          unconfirmedCount: 0,
        };
        return acc;
      }, {} as any),
      jumuahShifts: [
        {
          batchNumber: 1,
          khutbahTime: "12:45",
          iqamahTime: "13:15",
          language: "English & Arabic",
        },
      ],
    });

    return NextResponse.json({ success: true, data: newMasjid }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

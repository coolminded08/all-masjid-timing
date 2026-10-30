import { NextRequest, NextResponse } from "next/server";
import { getQuranTutorBySlugOrId } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tutor = getQuranTutorBySlugOrId(id);

    if (!tutor) {
      return NextResponse.json(
        { success: false, error: "Quran tutor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tutor,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

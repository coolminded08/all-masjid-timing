import { NextRequest, NextResponse } from "next/server";
import { getJummahSermonBySlugOrId } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sermon = getJummahSermonBySlugOrId(id);

    if (!sermon || sermon.status === "deleted") {
      return NextResponse.json(
        { success: false, error: "Jummah sermon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sermon,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

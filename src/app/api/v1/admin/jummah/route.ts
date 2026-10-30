import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getAllJummahSermonsForAdmin } from "@/lib/store";

export async function GET() {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const sermons = getAllJummahSermonsForAdmin();
  return NextResponse.json({
    success: true,
    data: sermons,
  });
}

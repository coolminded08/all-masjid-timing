import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getAllMasjids } from "@/lib/store";

export async function GET() {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // includeHidden = true to show all active, on_hold, and unverified masjids to admin
  const masjids = getAllMasjids(true);
  return NextResponse.json({
    success: true,
    data: masjids,
  });
}

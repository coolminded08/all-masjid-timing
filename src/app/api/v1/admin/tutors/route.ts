import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getAllQuranTutorsForAdmin } from "@/lib/store";

export async function GET() {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const tutors = getAllQuranTutorsForAdmin();
  return NextResponse.json({
    success: true,
    data: tutors,
  });
}

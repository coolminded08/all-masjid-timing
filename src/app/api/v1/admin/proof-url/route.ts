import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { createPrivateProofSignedUrl } from "@/lib/supabase/storage";

export async function GET(req: NextRequest) {
  const isAuthed = await isAuthenticatedAdmin();
  if (!isAuthed) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ success: false, error: "Missing path parameter" }, { status: 400 });
  }

  const signedUrl = await createPrivateProofSignedUrl(path, 3600); // 1 hour expiry

  if (!signedUrl) {
    return NextResponse.json(
      { success: false, error: "Unable to generate signed URL. Ensure Supabase Storage is configured." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    signedUrl,
  });
}

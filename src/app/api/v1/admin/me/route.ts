import { NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const isAuthed = await isAuthenticatedAdmin();

  if (!isAuthed) {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      username: process.env.ADMIN_USERNAME || "admin",
      role: "super_admin",
    },
  });
}

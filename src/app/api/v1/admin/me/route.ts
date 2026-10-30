import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function GET() {
  const session = await getAuthenticatedAdmin();

  if (!session.authenticated) {
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: session.user,
  });
}

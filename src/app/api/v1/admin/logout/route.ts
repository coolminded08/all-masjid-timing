import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
  }

  const response = NextResponse.json({
    success: true,
    message: "Admin logged out successfully",
  });

  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { generateAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, turnstileToken } = await req.json();

    // 1. Cloudflare Turnstile bot check
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for") ||
      "";

    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileResult.success) {
      return NextResponse.json(
        { success: false, error: turnstileResult.error || "Turnstile challenge failed" },
        { status: 403 }
      );
    }

    const loginIdentifier = (email || username || "").trim();

    // 2. Primary Engine: Supabase Authentication
    const supabase = await createServerSupabaseClient();
    if (supabase && loginIdentifier.includes("@")) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginIdentifier,
        password,
      });

      if (error || !data.user) {
        return NextResponse.json(
          {
            success: false,
            error: error?.message || "Invalid Supabase email or password",
          },
          { status: 401 }
        );
      }

      // Check role in app_metadata
      const role = data.user.app_metadata?.role || "admin";
      if (role !== "admin" && role !== "super_admin" && role !== "moderator") {
        await supabase.auth.signOut();
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized. Your Supabase account does not have admin permissions.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Signed in with Supabase Auth",
        provider: "supabase",
        user: {
          id: data.user.id,
          email: data.user.email,
          role,
        },
      });
    }

    // 3. Fallback: Environment Credentials (when Supabase is unconfigured or username is provided)
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "Admin@Masjid2026";

    if (
      !loginIdentifier ||
      !password ||
      loginIdentifier !== expectedUsername ||
      password !== expectedPassword
    ) {
      // Artificial delay to prevent timing brute-force attacks
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    const sessionToken = generateAdminSessionToken(expectedUsername);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully via Fallback",
      provider: "env_fallback",
      user: { username: expectedUsername, role: "super_admin" },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication error" },
      { status: 500 }
    );
  }
}

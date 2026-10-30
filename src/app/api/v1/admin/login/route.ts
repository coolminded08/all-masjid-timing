import { NextRequest, NextResponse } from "next/server";
import { generateAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const { username, password, turnstileToken } = await req.json();

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

    // 2. Validate Credentials against Environment Variables
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "Admin@Masjid2026";

    if (
      !username ||
      !password ||
      username.trim() !== expectedUsername ||
      password !== expectedPassword
    ) {
      // Artificial delay to prevent brute-force timing attacks
      await new Promise((resolve) => setTimeout(resolve, 600));
      return NextResponse.json(
        { success: false, error: "Invalid admin username or password" },
        { status: 401 }
      );
    }

    // 3. Issue Signed Session Token & Set Cookie
    const sessionToken = generateAdminSessionToken(expectedUsername);

    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user: { username: expectedUsername, role: "super_admin" },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
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

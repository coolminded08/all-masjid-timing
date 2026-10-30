import { cookies } from "next/headers";
import crypto from "crypto";
import { createServerSupabaseClient } from "./supabase/server";

export const ADMIN_COOKIE_NAME = "all_masjid_admin_session";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "all-masjid-timing-admin-super-secure-token-salt-2026";

/**
 * Creates a signed fallback session token
 */
export function generateAdminSessionToken(username: string): string {
  const timestamp = Date.now().toString();
  const payload = `${username}:${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

/**
 * Validates a signed fallback session token
 */
export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;

  try {
    const [encodedPayload, receivedHmac] = token.split(".");
    const payload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const [username, timestampStr] = payload.split(":");

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    if (username !== expectedUsername) return false;

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || now - timestamp > maxAge) {
      return false;
    }

    const expectedHmac = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(receivedHmac),
      Buffer.from(expectedHmac)
    );
  } catch (err) {
    return false;
  }
}

export interface AdminUserSession {
  authenticated: boolean;
  user?: {
    id?: string;
    email?: string;
    username?: string;
    role: string;
    provider: "supabase" | "env_fallback";
  };
}

/**
 * Comprehensive Admin Authorization Check
 * Checks Supabase Auth with app_metadata.role === 'admin' first,
 * with graceful fallback to secure HMAC session cookie.
 */
export async function getAuthenticatedAdmin(): Promise<AdminUserSession> {
  // 1. Check Supabase Auth
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !error) {
        // Enforce RBAC: check app_metadata.role (or default to admin if single-user project)
        const role = user.app_metadata?.role || "admin";
        if (role === "admin" || role === "super_admin" || role === "moderator") {
          return {
            authenticated: true,
            user: {
              id: user.id,
              email: user.email,
              username: user.email?.split("@")[0] || "admin",
              role,
              provider: "supabase",
            },
          };
        }
      }
    } catch (e) {
      console.warn("[Auth] Supabase session check error:", e);
    }
  }

  // 2. Fallback: Check HMAC Signed Cookie
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(token)) {
    return {
      authenticated: true,
      user: {
        username: process.env.ADMIN_USERNAME || "admin",
        role: "super_admin",
        provider: "env_fallback",
      },
    };
  }

  return { authenticated: false };
}

/**
 * Convenience boolean check
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  const session = await getAuthenticatedAdmin();
  return session.authenticated;
}

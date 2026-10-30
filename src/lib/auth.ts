import { cookies } from "next/headers";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "all_masjid_admin_session";

// Secret salt for signing admin session tokens
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "all-masjid-timing-admin-super-secure-token-salt-2026";

/**
 * Creates a signed session token containing timestamp and signature
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
 * Validates a signed session token and ensures it has not expired (7 days validity)
 */
export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !token.includes(".")) return false;

  try {
    const [encodedPayload, receivedHmac] = token.split(".");
    const payload = Buffer.from(encodedPayload, "base64").toString("utf-8");
    const [username, timestampStr] = payload.split(":");

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    if (username !== expectedUsername) return false;

    // Check expiration (7 days)
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(timestamp) || now - timestamp > maxAge) {
      return false;
    }

    // Check HMAC signature
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

/**
 * Helper to check admin session on server side
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

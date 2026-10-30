/**
 * Cloudflare Turnstile Verification Utility
 * Protects database write operations (tutor postings, masjid submissions, votes)
 * against automated bots, spam, and scraping.
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  // If running in development without a configured secret key, allow testing
  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
    "1x0000000000000000000000000000000AA"; // Cloudflare official test secret (always passes)

  if (!token) {
    return {
      success: false,
      error: "Missing Cloudflare Turnstile verification token.",
    };
  }

  // Allow test mock token in development
  if (
    process.env.NODE_ENV !== "production" &&
    (token === "cf-turnstile-verified" || token === "test-token")
  ) {
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data: TurnstileVerifyResponse = await res.json();

    if (!data.success) {
      return {
        success: false,
        error: `Turnstile verification failed: ${
          data["error-codes"]?.join(", ") || "Invalid challenge token"
        }`,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Turnstile] Verification error:", err);
    // Fail secure if Cloudflare verification fails
    return {
      success: false,
      error: "Unable to verify bot protection challenge. Please try again.",
    };
  }
}

import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deviceHint, getClientIp, getUserAgent } from "@/lib/requestMeta";

/** Cookie that marks which user_sessions row belongs to THIS browser. */
export const SESSION_ROW_COOKIE = "apex-session-id";

/**
 * Records a login into user_sessions — the table has had full UI/API/RLS
 * since migration 001 but nothing ever inserted rows (docs/03 §3.6). Called
 * from the OTP login verify and the OAuth callback, which also set
 * SESSION_ROW_COOKIE from the returned id so /istunnot can truthfully mark
 * "Tämä laite". Structured location (country_code, city) comes from Vercel
 * geo headers when available. Best effort: a failure never blocks a login.
 */
export async function recordLoginSession(
  admin: SupabaseClient,
  userId: string,
  req: Request,
): Promise<{ id: string } | null> {
  try {
    const city = req.headers.get("x-vercel-ip-city");
    const { data, error } = await admin
      .from("user_sessions")
      .insert({
        user_id: userId,
        session_token: randomBytes(24).toString("base64url"),
        device_hint: deviceHint(getUserAgent(req)),
        ip_address: getClientIp(req),
        country_code: req.headers.get("x-vercel-ip-country"),
        city: city ? decodeURIComponent(city) : null,
      })
      .select("id")
      .single();
    if (error) {
      console.error("user_sessions insert failed:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("user_sessions insert failed:", err);
    return null;
  }
}

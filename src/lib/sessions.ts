import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deviceHint, getClientIp, getUserAgent } from "@/lib/requestMeta";

/**
 * Records a login into user_sessions — the table has had full UI/API/RLS
 * since migration 001 but nothing ever inserted rows (docs/03 §3.6). Called
 * from the OTP login verify and the OAuth callback. Best effort: a failed
 * insert must never block a login.
 */
export async function recordLoginSession(
  admin: SupabaseClient,
  userId: string,
  req: Request,
): Promise<void> {
  try {
    await admin.from("user_sessions").insert({
      user_id: userId,
      session_token: randomBytes(24).toString("base64url"),
      device_hint: deviceHint(getUserAgent(req)),
      ip_address: getClientIp(req),
    });
  } catch (err) {
    console.error("user_sessions insert failed:", err);
  }
}

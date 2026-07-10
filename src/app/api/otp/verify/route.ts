import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { consumeVerification, normalizeEmail } from "@/lib/verification";
import { findUserByEmail } from "@/lib/users";
import { recordLoginSession, SESSION_ROW_COOKIE } from "@/lib/sessions";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

/**
 * Verifies the 6-digit login/signup email code. Same request contract as the
 * legacy version ({ email, code }). On success this now also:
 *  - marks the account's email verified (this OTP IS the email verification)
 *  - records a user_sessions row (login history / devices — previously dead)
 * Failed attempts are rate limited per IP and logged to the account timeline.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  let email: string, code: string;
  try {
    ({ email, code } = await req.json());
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  if (!email || !code) {
    return NextResponse.json({ error: "Puuttuvia tietoja" }, { status: 400 });
  }
  const target = normalizeEmail(email);
  const ip = getClientIp(req);

  const admin = createAdminClient();

  const ipOk = ip
    ? await checkRateLimit(admin, `otp-verify:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await consumeVerification(
    admin,
    "login_2fa",
    target,
    String(code),
  );

  if (!result.ok) {
    const user = await findUserByEmail(admin, target);
    if (user) {
      await logActivity(
        admin,
        user.id,
        "failed_login",
        { method: "otp", email: target },
        {
          ipAddress: ip ?? undefined,
          userAgent: getUserAgent(req) ?? undefined,
        },
      );
    }
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  // Post-success bookkeeping is best effort — the login must not fail on it.
  const user = await findUserByEmail(admin, target);
  if (user) {
    await admin
      .from("profiles")
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("email_verified", false);
    const session = await recordLoginSession(admin, user.id, req);
    const response = NextResponse.json({ success: true });
    if (session) {
      // Lets /istunnot truthfully mark this browser's row as "Tämä laite".
      response.cookies.set(SESSION_ROW_COOKIE, session.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return response;
  }

  return NextResponse.json({ success: true });
}

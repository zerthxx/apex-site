import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  consumeToken,
  consumeVerification,
  createVerification,
  generateToken,
  normalizeEmail,
  peekToken,
  REVERT_TTL_DAYS,
} from "@/lib/verification";
import { maskEmail } from "@/lib/sms";
import { revokeAllSessions } from "@/lib/sessionRevocation";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";
import { SITE_URL } from "@/lib/constants";

const bodySchema = z.object({
  recoveryToken: z.string().min(20),
  newEmail: z.email(),
  code: z.string().min(1),
});

/**
 * Forgot-email recovery, final step: verifies the code sent to the new
 * address, consumes the recovery token and replaces the account email.
 * The OLD address gets a 7-day revert link, and every session is revoked.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const newEmail = normalizeEmail(parsed.data.newEmail);

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `email-rec-complete:ip:${ip}`, 10, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const token = await peekToken(
    admin,
    "recovery_token",
    parsed.data.recoveryToken,
  );
  if (!token.ok || !token.row.user_id) {
    return NextResponse.json(
      { error: "Virheellinen tai vanhentunut palautus. Aloita alusta." },
      { status: 400 },
    );
  }
  const userId = token.row.user_id;

  const codeResult = await consumeVerification(
    admin,
    "email_change",
    newEmail,
    parsed.data.code,
  );
  if (!codeResult.ok || codeResult.row.user_id !== userId) {
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  // Both factors verified — consume the recovery token now.
  const consumed = await consumeToken(
    admin,
    "recovery_token",
    parsed.data.recoveryToken,
  );
  if (!consumed.ok) {
    return NextResponse.json(
      { error: "Virheellinen tai vanhentunut palautus. Aloita alusta." },
      { status: 400 },
    );
  }

  const { data: userData, error: getError } =
    await admin.auth.admin.getUserById(userId);
  if (getError || !userData.user) {
    return NextResponse.json({ error: "Tiliä ei löytynyt." }, { status: 400 });
  }
  const oldEmail = userData.user.email
    ? normalizeEmail(userData.user.email)
    : null;

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email: newEmail,
    email_confirm: true,
  });
  if (updateError) {
    return NextResponse.json(
      { error: "Sähköpostiosoitetta ei voitu ottaa käyttöön." },
      { status: 400 },
    );
  }

  await admin
    .from("profiles")
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", userId);
  await admin
    .from("customers")
    .update({ email: newEmail })
    .eq("user_id", userId);

  // Kick out any session belonging to whoever held the account before.
  await revokeAllSessions(userId);

  const revertToken = generateToken();
  await createVerification(admin, {
    userId,
    purpose: "change_revert",
    channel: "token",
    target: "token",
    secret: revertToken,
    payload: { field: "email", oldValue: oldEmail, newValue: newEmail },
    ip,
    ttlMinutes: REVERT_TTL_DAYS * 24 * 60,
  });

  if (oldEmail) {
    await sendSecurityNotification(admin, {
      userId,
      event: "email_changed",
      emailTo: oldEmail,
      req,
      detail: `Uusi osoite: ${maskEmail(newEmail)}`,
      revertUrl: `${SITE_URL}/peru-muutos?token=${revertToken}`,
    });
  }

  await logActivity(
    admin,
    userId,
    "email_changed",
    { old_email: oldEmail, via: "recovery" },
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

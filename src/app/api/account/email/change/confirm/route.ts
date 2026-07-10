import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  consumeVerification,
  createVerification,
  generateToken,
  normalizeEmail,
  REVERT_TTL_DAYS,
} from "@/lib/verification";
import { maskEmail } from "@/lib/sms";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";
import { SITE_URL } from "@/lib/constants";

const bodySchema = z.object({ newEmail: z.email(), code: z.string().min(1) });

/**
 * Completes an email change after the code sent to the new address is
 * verified. The OLD address gets a security alert with a 7-day revert link
 * (Google-style recovery window) so a hijacked account can be reclaimed.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const newEmail = normalizeEmail(parsed.data.newEmail);
  const oldEmail = normalizeEmail(user.email!);

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `email-change-confirm:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await consumeVerification(
    admin,
    "email_change",
    newEmail,
    parsed.data.code,
  );
  if (!result.ok || result.row.user_id !== user.id) {
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    user.id,
    {
      email: newEmail,
      email_confirm: true,
    },
  );
  if (updateError) {
    // Covers "email already registered" without confirming it to the caller.
    return NextResponse.json(
      { error: "Sähköpostiosoitetta ei voitu ottaa käyttöön." },
      { status: 400 },
    );
  }

  // The new address was just verified by the code above.
  await admin
    .from("profiles")
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  // Keep the linked CRM record in sync so staff see the current address.
  await admin
    .from("customers")
    .update({ email: newEmail })
    .eq("user_id", user.id);

  // 7-day revert window for the old owner.
  const revertToken = generateToken();
  await createVerification(admin, {
    userId: user.id,
    purpose: "change_revert",
    channel: "token",
    target: "token",
    secret: revertToken,
    payload: { field: "email", oldValue: oldEmail, newValue: newEmail },
    ip,
    ttlMinutes: REVERT_TTL_DAYS * 24 * 60,
  });

  const { data: profile } = await admin
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", user.id)
    .single();

  await sendSecurityNotification(admin, {
    userId: user.id,
    event: "email_changed",
    emailTo: oldEmail,
    smsTo: profile?.phone_verified ? profile.phone : null,
    req,
    detail: `Uusi osoite: ${maskEmail(newEmail)}`,
    revertUrl: `${SITE_URL}/peru-muutos?token=${revertToken}`,
  });

  await logActivity(
    admin,
    user.id,
    "email_changed",
    { old_email: oldEmail },
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  consumeVerification,
  createVerification,
  generateToken,
  REVERT_TTL_DAYS,
} from "@/lib/verification";
import { maskPhone, normalizePhone } from "@/lib/sms";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";
import { SITE_URL } from "@/lib/constants";

const bodySchema = z.object({
  newPhone: z.string().min(4),
  code: z.string().min(1),
});

/**
 * Completes a phone change after the SMS code to the new number is verified.
 * The OLD number and the account email get an alert with a 7-day revert link.
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
  const newPhone = normalizePhone(parsed.data.newPhone);
  if (!newPhone) {
    return NextResponse.json(
      { error: "Virheellinen puhelinnumero." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `phone-verify:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const { data: profile } = await admin
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", user.id)
    .single();
  const oldPhone = profile?.phone_verified ? profile.phone : null;

  const result = await consumeVerification(
    admin,
    "phone_change",
    newPhone,
    parsed.data.code,
  );
  if (!result.ok || result.row.user_id !== user.id) {
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      phone: newPhone,
      phone_verified: true,
      phone_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json(
        { error: "Numero on jo käytössä toisella tilillä." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });
  }

  // 7-day revert window for the old owner.
  const revertToken = generateToken();
  await createVerification(admin, {
    userId: user.id,
    purpose: "change_revert",
    channel: "token",
    target: "token",
    secret: revertToken,
    payload: { field: "phone", oldValue: oldPhone, newValue: newPhone },
    ip,
    ttlMinutes: REVERT_TTL_DAYS * 24 * 60,
  });

  await sendSecurityNotification(admin, {
    userId: user.id,
    event: "phone_changed",
    emailTo: user.email,
    smsTo: oldPhone,
    req,
    detail: `Uusi numero: ${maskPhone(newPhone)}`,
    revertUrl: `${SITE_URL}/peru-muutos?token=${revertToken}`,
  });

  await logActivity(
    admin,
    user.id,
    "phone_changed",
    { old_phone: oldPhone },
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { consumeToken } from "@/lib/verification";
import { passwordPolicyError } from "@/lib/passwordPolicy";
import { revokeAllSessions } from "@/lib/sessionRevocation";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  resetToken: z.string().min(20),
  newPassword: z.string().min(1),
});

/**
 * Final forgot-password step: sets the new password with a valid reset token,
 * revokes every session (an attacker holding the old password is out) and
 * notifies the account's email + verified phone.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const { resetToken, newPassword } = parsed.data;

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `pw-reset-complete:ip:${ip}`, 10, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const policyError = passwordPolicyError(newPassword);
  if (policyError)
    return NextResponse.json({ error: policyError }, { status: 400 });

  const result = await consumeToken(admin, "reset_token", resetToken);
  if (!result.ok || !result.row.user_id) {
    return NextResponse.json(
      { error: "Virheellinen tai vanhentunut palautuslinkki. Aloita alusta." },
      { status: 400 },
    );
  }
  const userId = result.row.user_id;

  const { data: userData, error: getError } =
    await admin.auth.admin.getUserById(userId);
  if (getError || !userData.user) {
    return NextResponse.json({ error: "Tiliä ei löytynyt." }, { status: 400 });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
    user_metadata: { ...userData.user.user_metadata, has_password: true },
  });
  if (updateError) {
    return NextResponse.json(
      { error: "Salasanan vaihto epäonnistui" },
      { status: 500 },
    );
  }

  await admin
    .from("profiles")
    .update({ force_password_reset: false })
    .eq("id", userId)
    .eq("force_password_reset", true);

  // Session invalidation: everyone (including a possible attacker) logs in again.
  await revokeAllSessions(userId);

  const { data: profile } = await admin
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", userId)
    .single();

  await sendSecurityNotification(admin, {
    userId,
    event: "password_reset",
    emailTo: userData.user.email,
    smsTo: profile?.phone_verified ? profile.phone : null,
    req,
  });

  await logActivity(
    admin,
    userId,
    "password_reset",
    {},
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

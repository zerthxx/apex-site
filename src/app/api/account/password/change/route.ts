import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { userHasPassword, verifyReauth } from "@/lib/reauth";
import { passwordPolicyError } from "@/lib/passwordPolicy";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(1),
  logoutOthers: z.boolean().optional(),
});

/**
 * In-app password change (moves the logic server-side from the old
 * client-only /asetukset/turvallisuus flow). Requires the current password
 * when one exists; Google-only accounts may set their first password without
 * one (existing behavior). Clears any admin-mandated force_password_reset,
 * optionally signs out other devices, and notifies the account.
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
  const { currentPassword, newPassword, logoutOthers } = parsed.data;

  const admin = createAdminClient();

  const limitOk = await checkRateLimit(admin, `pw-change:${user.id}`, 5, 3600);
  if (!limitOk) return rateLimitResponse();

  const policyError = passwordPolicyError(newPassword);
  if (policyError)
    return NextResponse.json({ error: policyError }, { status: 400 });

  if (userHasPassword(user)) {
    const reauth = await verifyReauth(admin, user, {
      password: currentPassword,
    });
    if (!reauth.ok)
      return NextResponse.json({ error: reauth.error }, { status: 403 });
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    user.id,
    {
      password: newPassword,
      user_metadata: { ...user.user_metadata, has_password: true },
    },
  );
  if (updateError) {
    return NextResponse.json(
      { error: "Salasanan vaihto epäonnistui" },
      { status: 500 },
    );
  }

  await admin
    .from("profiles")
    .update({ force_password_reset: false })
    .eq("id", user.id)
    .eq("force_password_reset", true);

  if (logoutOthers) {
    // The caller's cookie-bound session can reliably end its siblings.
    await auth.supabase.auth.signOut({ scope: "others" }).catch(() => {});
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", user.id)
    .single();

  await sendSecurityNotification(admin, {
    userId: user.id,
    event: "password_changed",
    emailTo: user.email,
    smsTo: profile?.phone_verified ? profile.phone : null,
    req,
  });

  await logActivity(
    admin,
    user.id,
    "password_change",
    { logout_others: !!logoutOthers },
    {
      ipAddress: getClientIp(req) ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { consumeToken, normalizeEmail, peekToken } from "@/lib/verification";
import { maskEmail, maskPhone } from "@/lib/sms";
import { revokeAllSessions } from "@/lib/sessionRevocation";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

/**
 * Change-revert (recovery window): the OLD email/phone receives a 7-day link
 * that undoes an email or phone change if the account was compromised.
 *
 * GET  ?token=…  → masked details of what changed (for the /peru-muutos page)
 * POST { token } → restores the old value, revokes all sessions and forces a
 *                  password reset (the attacker may know the password).
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token.length < 20) {
    return NextResponse.json(
      { error: "Virheellinen linkki." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `revert-peek:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await peekToken(admin, "change_revert", token);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Linkki on virheellinen, vanhentunut tai jo käytetty." },
      { status: 400 },
    );
  }

  const payload = result.row.payload as {
    field?: string;
    oldValue?: string | null;
    newValue?: string | null;
  };
  const mask = payload.field === "phone" ? maskPhone : maskEmail;

  return NextResponse.json({
    field: payload.field,
    oldMasked: payload.oldValue ? mask(payload.oldValue) : null,
    newMasked: payload.newValue ? mask(payload.newValue) : null,
    changedAt: result.row.created_at,
  });
}

const bodySchema = z.object({ token: z.string().min(20) });

export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `revert:ip:${ip}`, 10, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await consumeToken(admin, "change_revert", parsed.data.token);
  if (!result.ok || !result.row.user_id) {
    return NextResponse.json(
      { error: "Linkki on virheellinen, vanhentunut tai jo käytetty." },
      { status: 400 },
    );
  }
  const userId = result.row.user_id;
  const payload = result.row.payload as {
    field?: string;
    oldValue?: string | null;
    newValue?: string | null;
  };

  if (payload.field === "email" && payload.oldValue) {
    const oldEmail = normalizeEmail(payload.oldValue);
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email: oldEmail,
      email_confirm: true,
    });
    if (error) {
      return NextResponse.json(
        {
          error: "Peruminen epäonnistui. Ota yhteyttä tukeen: info@apexsite.fi",
        },
        { status: 500 },
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
      .update({ email: oldEmail })
      .eq("user_id", userId);
  } else if (payload.field === "phone" && payload.oldValue) {
    const { error } = await admin
      .from("profiles")
      .update({
        phone: payload.oldValue,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) {
      return NextResponse.json(
        {
          error: "Peruminen epäonnistui. Ota yhteyttä tukeen: info@apexsite.fi",
        },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "Virheellinen linkki." },
      { status: 400 },
    );
  }

  // Secure the account: whoever made the change may hold the password.
  await revokeAllSessions(userId);
  await admin
    .from("profiles")
    .update({ force_password_reset: true })
    .eq("id", userId);

  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const { data: profile } = await admin
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", userId)
    .single();

  await sendSecurityNotification(admin, {
    userId,
    event: "change_reverted",
    emailTo: userData?.user?.email ?? null,
    smsTo: profile?.phone_verified ? profile.phone : null,
    req,
  });

  await logActivity(
    admin,
    userId,
    "change_reverted",
    { field: payload.field },
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

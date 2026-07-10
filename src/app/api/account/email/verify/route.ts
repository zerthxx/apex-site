import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { consumeVerification, normalizeEmail } from "@/lib/verification";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({ code: z.string().min(1) });

/** Confirms the email-verification code and flips profiles.email_verified. */
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

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `email-verify:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await consumeVerification(
    admin,
    "email_verify",
    normalizeEmail(user.email!),
    parsed.data.code,
  );
  if (!result.ok || result.row.user_id !== user.id) {
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  await admin
    .from("profiles")
    .update({
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await logActivity(
    admin,
    user.id,
    "email_verified",
    {},
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

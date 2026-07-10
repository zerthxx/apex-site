import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  consumeVerification,
  createVerification,
  generateToken,
  TOKEN_TTL_MINUTES,
} from "@/lib/verification";
import { maskEmail, normalizePhone } from "@/lib/sms";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  phone: z.string().min(4),
  code: z.string().min(1),
});

/**
 * Forgot-email recovery, step 2: verifies the SMS code, reveals the account
 * email in MASKED form only, and mints a 15-minute recovery token for the
 * remaining steps.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Virheellinen puhelinnumero." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `email-rec-verify:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await consumeVerification(
    admin,
    "email_recovery",
    phone,
    parsed.data.code,
  );
  if (!result.ok || !result.row.user_id) {
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  const { data: userData, error } = await admin.auth.admin.getUserById(
    result.row.user_id,
  );
  if (error || !userData.user?.email) {
    return NextResponse.json({ error: "Tiliä ei löytynyt." }, { status: 400 });
  }

  const recoveryToken = generateToken();
  const created = await createVerification(admin, {
    userId: result.row.user_id,
    purpose: "recovery_token",
    channel: "token",
    target: "token",
    secret: recoveryToken,
    payload: { phone },
    ip,
    ttlMinutes: TOKEN_TTL_MINUTES,
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  return NextResponse.json({
    success: true,
    recoveryToken,
    maskedEmail: maskEmail(userData.user.email),
  });
}

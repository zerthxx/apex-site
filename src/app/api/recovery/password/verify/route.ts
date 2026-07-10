import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  consumeVerification,
  createVerification,
  generateToken,
  normalizeEmail,
  TOKEN_TTL_MINUTES,
} from "@/lib/verification";
import { normalizePhone } from "@/lib/sms";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  identifier: z.string().min(3),
  channel: z.enum(["email", "sms"]),
  code: z.string().min(1),
});

/**
 * Verifies the 6-digit recovery code and mints a single-use, 15-minute reset
 * token. Two-step separation: the guessable 6-digit code (max 5 attempts)
 * never directly changes the password — only the 256-bit token does.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const { identifier, channel, code } = parsed.data;

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `pw-reset-verify:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const target =
    channel === "email"
      ? normalizeEmail(identifier)
      : normalizePhone(identifier);
  if (!target) {
    return NextResponse.json(
      { error: "Virheellinen tunniste." },
      { status: 400 },
    );
  }

  const result = await consumeVerification(
    admin,
    "password_reset",
    target,
    code,
  );
  if (!result.ok || !result.row.user_id) {
    return NextResponse.json(
      { error: "Väärä tai vanhentunut koodi." },
      { status: 400 },
    );
  }

  const resetToken = generateToken();
  const created = await createVerification(admin, {
    userId: result.row.user_id,
    purpose: "reset_token",
    channel: "token",
    target: "token",
    secret: resetToken,
    ip,
    ttlMinutes: TOKEN_TTL_MINUTES,
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  return NextResponse.json({ success: true, resetToken });
}

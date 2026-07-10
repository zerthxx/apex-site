import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { consumeVerification } from "@/lib/verification";
import { normalizePhone } from "@/lib/sms";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  phone: z.string().min(4),
  code: z.string().min(1),
});

/** Confirms the initial phone-verification SMS code and stores the number. */
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
    ? await checkRateLimit(admin, `phone-verify:ip:${ip}`, 20, 3600)
    : true;
  if (!ipOk) return rateLimitResponse();

  const result = await consumeVerification(
    admin,
    "phone_verify",
    phone,
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
      phone,
      phone_verified: true,
      phone_verified_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    // 23505 = another account verified this number between send and verify.
    if (updateError.code === "23505") {
      return NextResponse.json(
        { error: "Numero on jo käytössä toisella tilillä." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });
  }

  await logActivity(
    admin,
    user.id,
    "phone_verified",
    { phone },
    {
      ipAddress: ip ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

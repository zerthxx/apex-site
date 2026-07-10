import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createVerification, generateCode } from "@/lib/verification";
import { isSmsConfigured, normalizePhone, sendSms } from "@/lib/sms";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({ phone: z.string().min(4) });

/**
 * Sends the 6-digit SMS code for INITIAL phone verification (account has no
 * verified phone yet). Replacing an already-verified phone goes through
 * /api/account/phone/change/* which additionally requires re-authentication.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  if (!isSmsConfigured()) {
    return NextResponse.json(
      { error: "SMS-vahvistus ei ole tällä hetkellä käytettävissä." },
      { status: 503 },
    );
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

  const { data: profile } = await admin
    .from("profiles")
    .select("phone_verified")
    .eq("id", user.id)
    .single();
  if (profile?.phone_verified) {
    return NextResponse.json(
      { error: "Sinulla on jo vahvistettu numero. Käytä numeron vaihtoa." },
      { status: 400 },
    );
  }

  const { data: taken } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .eq("phone_verified", true)
    .neq("id", user.id)
    .maybeSingle();
  if (taken) {
    return NextResponse.json(
      { error: "Numero on jo käytössä toisella tilillä." },
      { status: 400 },
    );
  }

  const ip = getClientIp(req);
  const cooldownOk = await checkRateLimit(
    admin,
    `phone-send:cool:${phone}`,
    1,
    60,
  );
  if (!cooldownOk) {
    return NextResponse.json(
      { error: "Odota hetki ennen uuden koodin pyytämistä." },
      { status: 429 },
    );
  }
  const phoneOk = await checkRateLimit(
    admin,
    `phone-send:hour:${phone}`,
    3,
    3600,
  );
  const userOk = await checkRateLimit(
    admin,
    `phone-send:user:${user.id}`,
    5,
    3600,
  );
  const ipOk = ip
    ? await checkRateLimit(admin, `phone-send:ip:${ip}`, 10, 3600)
    : true;
  if (!phoneOk || !userOk || !ipOk) return rateLimitResponse();

  const code = generateCode();
  const created = await createVerification(admin, {
    userId: user.id,
    purpose: "phone_verify",
    channel: "sms",
    target: phone,
    secret: code,
    payload: { phone },
    ip,
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  const sent = await sendSms(
    phone,
    `ApexSite: vahvistuskoodisi on ${code}. Koodi vanhenee 10 minuutissa.`,
  );
  if (!sent.ok) {
    return NextResponse.json(
      { error: "SMS-lähetys epäonnistui" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, phone });
}

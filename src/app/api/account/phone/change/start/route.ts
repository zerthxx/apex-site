import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createVerification, generateCode } from "@/lib/verification";
import { verifyReauth } from "@/lib/reauth";
import { isSmsConfigured, normalizePhone, sendSms } from "@/lib/sms";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  newPhone: z.string().min(4),
  password: z.string().optional(),
  reauthCode: z.string().optional(),
});

/**
 * Starts replacing an already-verified phone number: re-authenticates the
 * caller, sends a code to the NEW number and an alert to the OLD one. The
 * old number stays active until the new one is confirmed.
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
  const newPhone = normalizePhone(parsed.data.newPhone);
  if (!newPhone) {
    return NextResponse.json(
      { error: "Virheellinen puhelinnumero." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("phone, phone_verified")
    .eq("id", user.id)
    .single();
  if (!profile?.phone_verified) {
    return NextResponse.json(
      {
        error:
          "Sinulla ei ole vahvistettua numeroa. Käytä numeron vahvistusta.",
      },
      { status: 400 },
    );
  }
  if (profile.phone === newPhone) {
    return NextResponse.json(
      { error: "Uusi numero on sama kuin nykyinen." },
      { status: 400 },
    );
  }

  const { data: taken } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", newPhone)
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
    `phone-send:cool:${newPhone}`,
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
    `phone-send:hour:${newPhone}`,
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

  const reauth = await verifyReauth(admin, user, parsed.data);
  if (!reauth.ok)
    return NextResponse.json({ error: reauth.error }, { status: 403 });

  const code = generateCode();
  const created = await createVerification(admin, {
    userId: user.id,
    purpose: "phone_change",
    channel: "sms",
    target: newPhone,
    secret: code,
    payload: { newPhone },
    ip,
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  const sent = await sendSms(
    newPhone,
    `ApexSite: vahvistuskoodisi on ${code}. Koodi vanhenee 10 minuutissa.`,
  );
  if (!sent.ok) {
    return NextResponse.json(
      { error: "SMS-lähetys epäonnistui" },
      { status: 500 },
    );
  }

  // Warn the old number (and email) before anything has changed.
  await sendSecurityNotification(admin, {
    userId: user.id,
    event: "phone_change_requested",
    emailTo: user.email,
    smsTo: profile.phone,
    req,
  });

  return NextResponse.json({ success: true, phone: newPhone });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createVerification, generateCode } from "@/lib/verification";
import { findUserByVerifiedPhone } from "@/lib/users";
import { isSmsConfigured, normalizePhone, sendSms } from "@/lib/sms";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({ phone: z.string().min(4) });

/**
 * Forgot-email recovery, step 1: the user proves control of their VERIFIED
 * phone. Enumeration-safe generic response. (This platform has no usernames —
 * the verified phone is the recovery key, per the approved plan.)
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  if (!isSmsConfigured()) {
    return NextResponse.json(
      { error: "SMS-palautus ei ole tällä hetkellä käytettävissä." },
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
  const ip = getClientIp(req);

  const cooldownOk = await checkRateLimit(
    admin,
    `email-rec:cool:${phone}`,
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
    `email-rec:hour:${phone}`,
    3,
    3600,
  );
  const ipOk = ip
    ? await checkRateLimit(admin, `email-rec:ip:${ip}`, 10, 3600)
    : true;
  if (!phoneOk || !ipOk) return rateLimitResponse();

  const match = await findUserByVerifiedPhone(admin, phone);
  if (match) {
    const code = generateCode();
    const created = await createVerification(admin, {
      userId: match.userId,
      purpose: "email_recovery",
      channel: "sms",
      target: phone,
      secret: code,
      ip,
    });
    if (created.ok) {
      await sendSms(
        phone,
        `ApexSite: tilin palautuskoodisi on ${code}. Koodi vanhenee 10 minuutissa. Jos et pyytänyt tätä, jätä viesti huomiotta.`,
      );
    }
  }

  return NextResponse.json({
    success: true,
    message: "Jos numeroon liittyy tili, lähetimme vahvistuskoodin.",
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  createVerification,
  generateCode,
  normalizeEmail,
} from "@/lib/verification";
import { findUserByEmail, findUserByVerifiedPhone } from "@/lib/users";
import { isSmsConfigured, normalizePhone, sendSms } from "@/lib/sms";
import { codeEmailHtml, sendEmail } from "@/lib/emails";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  identifier: z.string().min(3),
  channel: z.enum(["email", "sms"]),
});

/**
 * Starts forgot-password recovery via verified email or verified phone.
 * PUBLIC + enumeration-safe: the response is an identical generic success
 * whether or not an account matches, so this endpoint can't be used to
 * probe which emails/phones have accounts.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }
  const { identifier, channel } = parsed.data;

  if (channel === "sms" && !isSmsConfigured()) {
    return NextResponse.json(
      { error: "SMS-palautus ei ole tällä hetkellä käytettävissä." },
      { status: 503 },
    );
  }

  const admin = createAdminClient();
  const ip = getClientIp(req);

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

  const cooldownOk = await checkRateLimit(
    admin,
    `pw-reset:cool:${target}`,
    1,
    60,
  );
  if (!cooldownOk) {
    return NextResponse.json(
      { error: "Odota hetki ennen uuden koodin pyytämistä." },
      { status: 429 },
    );
  }
  const targetOk = await checkRateLimit(
    admin,
    `pw-reset:hour:${target}`,
    3,
    3600,
  );
  const ipOk = ip
    ? await checkRateLimit(admin, `pw-reset:ip:${ip}`, 10, 3600)
    : true;
  if (!targetOk || !ipOk) return rateLimitResponse();

  // Resolve the account. On no match we still return generic success below.
  let userId: string | null = null;
  if (channel === "email") {
    const user = await findUserByEmail(admin, target);
    userId = user?.id ?? null;
  } else {
    const match = await findUserByVerifiedPhone(admin, target);
    userId = match?.userId ?? null;
  }

  if (userId) {
    const code = generateCode();
    const created = await createVerification(admin, {
      userId,
      purpose: "password_reset",
      channel,
      target,
      secret: code,
      ip,
    });

    if (created.ok) {
      if (channel === "email") {
        await sendEmail(
          target,
          "Salasanan palautus — Apex Site",
          codeEmailHtml({
            headingCopper: "Palauta",
            headingRest: "salasanasi",
            intro: "Tilillesi pyydettiin salasanan palautusta.",
            code,
          }),
        );
      } else {
        await sendSms(
          target,
          `ApexSite: salasanan palautuskoodisi on ${code}. Koodi vanhenee 10 minuutissa. Jos et pyytänyt tätä, jätä viesti huomiotta.`,
        );
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: "Jos tili löytyy, lähetimme vahvistuskoodin.",
  });
}

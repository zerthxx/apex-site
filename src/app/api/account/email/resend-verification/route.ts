import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  createVerification,
  generateCode,
  normalizeEmail,
} from "@/lib/verification";
import { codeEmailHtml, sendEmail } from "@/lib/emails";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

/** Re-sends the email verification code for the caller's current address. */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("email_verified")
    .eq("id", auth.user.id)
    .single();
  if (profile?.email_verified) {
    return NextResponse.json(
      { error: "Sähköposti on jo vahvistettu." },
      { status: 400 },
    );
  }

  const target = normalizeEmail(auth.user.email!);
  const cooldownOk = await checkRateLimit(
    admin,
    `email-verify:cool:${target}`,
    1,
    60,
  );
  if (!cooldownOk) {
    return NextResponse.json(
      { error: "Odota hetki ennen uuden koodin pyytämistä." },
      { status: 429 },
    );
  }
  const hourlyOk = await checkRateLimit(
    admin,
    `email-verify:hour:${target}`,
    3,
    3600,
  );
  if (!hourlyOk) return rateLimitResponse();

  const code = generateCode();
  const created = await createVerification(admin, {
    userId: auth.user.id,
    purpose: "email_verify",
    channel: "email",
    target,
    secret: code,
    ip: getClientIp(req),
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  const sent = await sendEmail(
    target,
    "Vahvista sähköpostiosoitteesi — Apex Site",
    codeEmailHtml({
      headingCopper: "Vahvista",
      headingRest: "sähköpostiosoitteesi",
      intro:
        "Vahvista sähköpostiosoitteesi viimeistelläksesi tilisi suojauksen.",
      code,
    }),
  );
  if (!sent.ok) {
    return NextResponse.json(
      { error: "Sähköpostin lähetys epäonnistui" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

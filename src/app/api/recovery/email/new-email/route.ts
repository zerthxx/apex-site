import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  createVerification,
  generateCode,
  normalizeEmail,
  peekToken,
} from "@/lib/verification";
import { codeEmailHtml, sendEmail } from "@/lib/emails";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  recoveryToken: z.string().min(20),
  newEmail: z.email(),
});

/**
 * Forgot-email recovery, step 3: with a valid recovery token, sends a
 * verification code to the NEW address the user wants on the account. The
 * token is only peeked here — it is consumed at the final complete step.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Virheellinen sähköpostiosoite." },
      { status: 400 },
    );
  }
  const newEmail = normalizeEmail(parsed.data.newEmail);

  const admin = createAdminClient();
  const ip = getClientIp(req);
  const ipOk = ip
    ? await checkRateLimit(admin, `email-rec-new:ip:${ip}`, 10, 3600)
    : true;
  const targetOk = await checkRateLimit(
    admin,
    `email-change:target:${newEmail}`,
    3,
    3600,
  );
  if (!ipOk || !targetOk) return rateLimitResponse();

  const token = await peekToken(
    admin,
    "recovery_token",
    parsed.data.recoveryToken,
  );
  if (!token.ok || !token.row.user_id) {
    return NextResponse.json(
      { error: "Virheellinen tai vanhentunut palautus. Aloita alusta." },
      { status: 400 },
    );
  }
  const userId = token.row.user_id;

  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const oldEmail = userData?.user?.email ?? null;
  if (oldEmail && normalizeEmail(oldEmail) === newEmail) {
    return NextResponse.json(
      { error: "Uusi osoite on sama kuin nykyinen." },
      { status: 400 },
    );
  }

  const code = generateCode();
  const created = await createVerification(admin, {
    userId,
    purpose: "email_change",
    channel: "email",
    target: newEmail,
    secret: code,
    payload: { newEmail, via: "recovery" },
    ip,
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  const sent = await sendEmail(
    newEmail,
    "Vahvista uusi sähköpostiosoitteesi — Apex Site",
    codeEmailHtml({
      headingCopper: "Vahvista",
      headingRest: "uusi sähköpostiosoitteesi",
      intro:
        "Tilin palautuksessa pyydettiin sähköpostin vaihtoa tähän osoitteeseen.",
      code,
    }),
  );
  if (!sent.ok) {
    return NextResponse.json(
      { error: "Sähköpostin lähetys epäonnistui" },
      { status: 500 },
    );
  }

  // Warn the current (soon old) address that a recovery is in progress.
  if (oldEmail) {
    await sendSecurityNotification(admin, {
      userId,
      event: "email_change_requested",
      emailTo: oldEmail,
      req,
    });
  }

  return NextResponse.json({ success: true });
}

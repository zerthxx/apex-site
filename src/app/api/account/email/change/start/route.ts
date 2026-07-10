import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  createVerification,
  generateCode,
  normalizeEmail,
} from "@/lib/verification";
import { verifyReauth } from "@/lib/reauth";
import { codeEmailHtml, sendEmail } from "@/lib/emails";
import { sendSecurityNotification } from "@/lib/securityNotify";
import { getClientIp, sameOriginOk } from "@/lib/requestMeta";

const bodySchema = z.object({
  newEmail: z.email(),
  password: z.string().optional(),
  reauthCode: z.string().optional(),
});

/**
 * Starts an email change: re-authenticates the caller, sends a 6-digit code
 * to the NEW address, and warns the OLD address that a change was requested.
 * The old email stays active until the new one is confirmed.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Virheellinen sähköpostiosoite." },
      { status: 400 },
    );
  }
  const newEmail = normalizeEmail(parsed.data.newEmail);
  if (newEmail === normalizeEmail(user.email!)) {
    return NextResponse.json(
      { error: "Uusi osoite on sama kuin nykyinen." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const ip = getClientIp(req);

  const userOk = await checkRateLimit(
    admin,
    `email-change:user:${user.id}`,
    3,
    3600,
  );
  const targetOk = await checkRateLimit(
    admin,
    `email-change:target:${newEmail}`,
    3,
    3600,
  );
  if (!userOk || !targetOk) return rateLimitResponse();

  const reauth = await verifyReauth(admin, user, parsed.data);
  if (!reauth.ok)
    return NextResponse.json({ error: reauth.error }, { status: 403 });

  const code = generateCode();
  const created = await createVerification(admin, {
    userId: user.id,
    purpose: "email_change",
    channel: "email",
    target: newEmail,
    secret: code,
    payload: { newEmail },
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
        "Tilillesi pyydettiin sähköpostiosoitteen vaihtoa tähän osoitteeseen.",
      code,
    }),
  );
  if (!sent.ok) {
    return NextResponse.json(
      { error: "Sähköpostin lähetys epäonnistui" },
      { status: 500 },
    );
  }

  // Warn the old address immediately — before anything has changed.
  await sendSecurityNotification(admin, {
    userId: user.id,
    event: "email_change_requested",
    emailTo: user.email,
    req,
  });

  return NextResponse.json({ success: true });
}

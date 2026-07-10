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

/**
 * Sends a re-authentication code to the caller's current email. Used by
 * Google-only accounts (no password) before sensitive changes.
 */
export async function POST(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const target = normalizeEmail(auth.user.email!);

  const cooldownOk = await checkRateLimit(
    admin,
    `reauth-send:cool:${target}`,
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
    `reauth-send:hour:${target}`,
    3,
    3600,
  );
  if (!hourlyOk) return rateLimitResponse();

  const code = generateCode();
  const created = await createVerification(admin, {
    userId: auth.user.id,
    purpose: "reauth",
    channel: "email",
    target,
    secret: code,
    ip: getClientIp(req),
  });
  if (!created.ok)
    return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  const sent = await sendEmail(
    target,
    "Vahvista henkilöllisyytesi — Apex Site",
    codeEmailHtml({
      headingCopper: "Vahvista",
      headingRest: "henkilöllisyytesi",
      intro:
        "Tilisi tietojen muuttaminen vaatii henkilöllisyyden vahvistuksen.",
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

/**
 * SMS delivery via Twilio Programmable SMS (plain REST, no SDK dependency).
 *
 * Env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
 * (TWILIO_FROM may be an E.164 number or an alphanumeric sender ID like
 * "ApexSite" — alphanumeric works in Finland without pre-registration).
 *
 * When unconfigured, isSmsConfigured() lets callers degrade gracefully
 * (email-only recovery keeps working without a Twilio account).
 */

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM,
  );
}

/**
 * Normalizes a phone number to E.164. Finnish national format ("040 123 4567")
 * becomes +35840…, "00" international prefix becomes "+". Returns null when
 * the result is not a plausible E.164 number.
 */
export function normalizePhone(input: string): string | null {
  let p = input.trim().replace(/[\s\-().]/g, "");
  if (p.startsWith("00")) p = `+${p.slice(2)}`;
  if (p.startsWith("0")) p = `+358${p.slice(1)}`;
  if (!/^\+[1-9]\d{6,14}$/.test(p)) return null;
  return p;
}

/** "+358401234567" → "+358•••••67" — safe to show/send without exposing the number. */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return "•••";
  return `${phone.slice(0, 4)}${"•".repeat(Math.max(phone.length - 6, 3))}${phone.slice(-2)}`;
}

/** "matti.meikalainen@example.com" → "ma•••@ex•••.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  const dot = domain.lastIndexOf(".");
  const domainName = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";
  return `${local.slice(0, 2)}•••@${domainName.slice(0, 2)}•••${tld}`;
}

export async function sendSms(
  to: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from)
    return { ok: false, error: "SMS ei ole käytössä" };

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Twilio send failed:", res.status, detail.slice(0, 500));
      return { ok: false, error: "SMS-lähetys epäonnistui" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Twilio request error:", err);
    return { ok: false, error: "SMS-lähetys epäonnistui" };
  }
}

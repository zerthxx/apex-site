import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const RATE: Map<string, number> = new Map();

export async function POST(req: NextRequest) {
  let email: string;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  if (!email) return NextResponse.json({ error: "Email puuttuu" }, { status: 400 });

  const last = RATE.get(email) ?? 0;
  if (Date.now() - last < 60_000) {
    return NextResponse.json({ error: "Odota hetki ennen uuden koodin pyytämistä." }, { status: 429 });
  }
  RATE.set(email, Date.now());

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const supabase = adminClient();
  await supabase.from("otp_codes").delete().eq("email", email);

  const { error: dbErr } = await supabase.from("otp_codes").insert({ email, code, expires_at: expiresAt });
  if (dbErr) return NextResponse.json({ error: "Tietokantavirhe" }, { status: 500 });

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error: mailErr } = await resend.emails.send({
    from: "Apex Site <noreply@apexsite.fi>",
    to: email,
    subject: "Vahvistuskoodisi — Apex Site",
    html: `<!DOCTYPE html>
<html lang="fi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0C10;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;">
  <tr><td align="center">

    <!-- Background image header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td align="center" style="padding:0;">
        <img src="https://apexsite.fi/email-otp.png" alt="Apex Site" width="520" style="width:100%;max-width:520px;display:block;border:0;" />
      </td></tr>

      <!-- OTP code overlay section -->
      <tr><td align="center" style="background:#0A0C10;padding:0 32px 16px;">
        <table cellpadding="0" cellspacing="0" style="background:#10141C;border:1.5px solid #C8813A44;border-radius:16px;padding:24px 32px;width:100%;">
          <tr><td align="center" style="padding-bottom:8px;">
            <p style="margin:0;color:#A8A49C;font-size:11px;letter-spacing:3px;font-family:sans-serif;font-weight:700;">VAHVISTUSKOODISI</p>
          </td></tr>
          <tr><td align="center">
            <div style="font-size:52px;font-weight:900;letter-spacing:16px;color:#F0EEE8;font-family:monospace;">${code}</div>
          </td></tr>
        </table>
      </td></tr>

      <!-- Expiry note -->
      <tr><td align="center" style="background:#0A0C10;padding:12px 32px 32px;">
        <p style="margin:0;color:#5E5C58;font-size:12px;font-family:sans-serif;">
          Koodi vanhenee <span style="color:#2ABFBF;">10 minuutissa</span>. Älä jaa koodia kenellekään.
        </p>
      </td></tr>
    </table>

  </td></tr>
</table>
</body>
</html>`,
  });

  if (mailErr) return NextResponse.json({ error: "Sähköpostin lähetys epäonnistui" }, { status: 500 });

  return NextResponse.json({ success: true });
}

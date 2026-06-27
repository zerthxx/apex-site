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
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;min-height:100vh;">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

      <!-- Logo -->
      <tr><td align="center" style="padding-bottom:28px;">
        <div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;font-family:sans-serif;">
          <span style="color:#C8813A;">Apex</span><span style="color:#F0EEE8;">Site</span>
        </div>
      </td></tr>

      <!-- Headline -->
      <tr><td align="center" style="padding-bottom:8px;">
        <h1 style="margin:0;font-size:26px;font-weight:800;font-family:sans-serif;">
          <span style="color:#C8813A;">Vahvista</span>
          <span style="color:#F0EEE8;"> sähköpostiosoitteesi</span>
        </h1>
      </td></tr>

      <!-- Divider -->
      <tr><td align="center" style="padding-bottom:24px;">
        <div style="width:48px;height:2px;background:linear-gradient(90deg,#C8813A,#2ABFBF);border-radius:2px;margin:0 auto;"></div>
      </td></tr>

      <!-- Intro text -->
      <tr><td align="center" style="padding-bottom:28px;">
        <p style="margin:0;color:#A8A49C;font-size:15px;line-height:1.6;font-family:sans-serif;text-align:center;">
          <strong style="color:#F0EEE8;">Hei!</strong><br>
          Kiitos rekisteröitymisestä ApexSiteen.<br>
          Syötä alla oleva 6-numeroinen vahvistuskoodi jatkaaksesi.
        </p>
      </td></tr>

      <!-- Code box -->
      <tr><td align="center" style="padding-bottom:28px;">
        <table cellpadding="0" cellspacing="0" style="background:#10141C;border:1.5px solid #252B38;border-radius:16px;padding:28px 36px;width:100%;max-width:420px;">
          <tr><td align="center" style="padding-bottom:14px;">
            <div style="width:40px;height:40px;border:2px solid #2ABFBF;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin:0 auto;">
              <span style="color:#2ABFBF;font-size:20px;">✓</span>
            </div>
          </td></tr>
          <tr><td align="center" style="padding-bottom:16px;">
            <p style="margin:0;color:#A8A49C;font-size:11px;letter-spacing:3px;font-family:sans-serif;font-weight:700;">VAHVISTUSKOODI</p>
          </td></tr>
          <tr><td align="center">
            <div style="font-size:48px;font-weight:900;letter-spacing:14px;color:#F0EEE8;font-family:monospace;padding:0 8px;">${code}</div>
          </td></tr>
        </table>
      </td></tr>

      <!-- CTA button -->
      <tr><td align="center" style="padding-bottom:16px;">
        <table cellpadding="0" cellspacing="0">
          <tr><td align="center" style="border-radius:12px;background:linear-gradient(135deg,#C8813A,#2ABFBF);">
            <a href="https://apexsite.fi" style="display:block;padding:14px 48px;color:#0A0C10;font-size:16px;font-weight:800;text-decoration:none;font-family:sans-serif;letter-spacing:0.3px;">
              🔒 Vahvista sähköposti
            </a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Expiry -->
      <tr><td align="center" style="padding-bottom:32px;">
        <p style="margin:0;color:#5E5C58;font-size:13px;font-family:sans-serif;">
          ⏱ Koodi vanhenee <span style="color:#2ABFBF;">10 minuutissa</span>.
        </p>
      </td></tr>

      <!-- Divider -->
      <tr><td style="padding-bottom:24px;">
        <div style="height:1px;background:linear-gradient(90deg,transparent,#252B38,transparent);"></div>
      </td></tr>

      <!-- Footer -->
      <tr><td align="center" style="padding-bottom:10px;">
        <div style="font-size:18px;font-weight:900;font-family:sans-serif;">
          <span style="color:#C8813A;">Apex</span><span style="color:#F0EEE8;">Site</span>
        </div>
      </td></tr>
      <tr><td align="center" style="padding-bottom:20px;">
        <p style="margin:0;color:#5E5C58;font-size:12px;font-family:sans-serif;">Modernit verkkosivut yrityksille</p>
      </td></tr>
      <tr><td align="center">
        <p style="margin:0;color:#3D3D3D;font-size:11px;font-family:sans-serif;text-align:center;line-height:1.5;">
          🛡 Jos et pyytänyt tätä sähköpostia,<br>voit jättää tämän viestin huomiotta.
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

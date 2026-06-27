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
<body style="margin:0;padding:0;background:#060810;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060810;min-height:100%;">
<tr><td align="center" style="padding:48px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:linear-gradient(160deg,#0e1420 0%,#060810 60%);border:1px solid #1e2535;border-radius:20px;overflow:hidden;">

  <!-- Logo -->
  <tr><td align="center" style="padding:36px 32px 20px;">
    <img src="https://apexsite.fi/icon.png" alt="Apex Site" width="320" style="display:block;margin:0 auto 16px;width:320px;max-width:100%;" />
    <div style="font-size:32px;font-weight:900;font-family:sans-serif;letter-spacing:-0.5px;">
      <span style="color:#C8813A;">Apex</span><span style="color:#F0EEE8;">Site</span>
    </div>
  </td></tr>

  <!-- Headline -->
  <tr><td align="center" style="padding:0 32px 6px;">
    <h1 style="margin:0;font-size:22px;font-weight:800;font-family:sans-serif;line-height:1.3;">
      <span style="color:#C8813A;">Vahvista</span>
      <span style="color:#F0EEE8;"> sähköpostiosoitteesi</span>
    </h1>
  </td></tr>

  <!-- Divider dot -->
  <tr><td align="center" style="padding-bottom:20px;">
    <div style="width:40px;height:2px;background:linear-gradient(90deg,#C8813A,#2ABFBF);margin:0 auto;border-radius:2px;"></div>
  </td></tr>

  <!-- Intro -->
  <tr><td align="center" style="padding:0 36px 28px;">
    <p style="margin:0;color:#A8A49C;font-size:14px;line-height:1.7;font-family:sans-serif;text-align:left;">
      <strong style="color:#F0EEE8;">Hei!</strong><br>
      Kiitos rekisteröitymisestä ApexSiteen.<br>
      Syötä alla oleva 6-numeroinen vahvistuskoodi jatkaaksesi.
    </p>
  </td></tr>

  <!-- Code box -->
  <tr><td align="center" style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e18;border:1.5px solid #2ABFBF55;border-radius:14px;">
      <tr><td align="center" style="padding:20px 24px 8px;">
        <!-- Shield icon -->
        <div style="width:36px;height:36px;border:2px solid #2ABFBF;border-radius:8px;margin:0 auto 10px;line-height:36px;text-align:center;">
          <span style="color:#2ABFBF;font-size:16px;">✓</span>
        </div>
        <p style="margin:0 0 14px;color:#A8A49C;font-size:10px;letter-spacing:3px;font-family:sans-serif;font-weight:700;">VAHVISTUSKOODI</p>
      </td></tr>
      <!-- Individual digit boxes -->
      <tr><td align="center" style="padding:0 16px 20px;">
        <table cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:6px;">
          <tr>
            ${code.split("").map(d => `<td align="center" style="width:48px;height:58px;background:#10141C;border:1.5px solid #C8813A66;border-radius:10px;font-size:28px;font-weight:900;color:#F0EEE8;font-family:monospace;">${d}</td>`).join("")}
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- Button -->
  <tr><td align="center" style="padding:0 28px 14px;">
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr><td align="center" style="border-radius:12px;background:linear-gradient(135deg,#E8A020,#2ABFBF);">
        <a href="https://apexsite.fi" style="display:block;padding:14px 32px;color:#060810;font-size:15px;font-weight:800;text-decoration:none;font-family:sans-serif;">
          🔒&nbsp; Vahvista sähköposti
        </a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Expiry -->
  <tr><td align="center" style="padding:0 28px 28px;">
    <p style="margin:0;color:#5E5C58;font-size:12px;font-family:sans-serif;">
      ⏱&nbsp; Koodi vanhenee <span style="color:#2ABFBF;font-weight:600;">10 minuutissa</span>.
    </p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 28px 20px;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#1e2535,transparent);"></div>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding:0 28px 12px;">
    <div style="font-size:16px;font-weight:900;font-family:sans-serif;">
      <span style="color:#C8813A;">Apex</span><span style="color:#F0EEE8;">Site</span>
    </div>
    <p style="margin:4px 0 0;color:#5E5C58;font-size:11px;font-family:sans-serif;">Modernit verkkosivut yrityksille</p>
  </td></tr>
  <tr><td align="center" style="padding:0 28px 32px;">
    <p style="margin:0;color:#3a3a4a;font-size:10px;font-family:sans-serif;line-height:1.5;">
      🛡&nbsp; Jos et pyytänyt tätä sähköpostia,<br>voit jättää tämän viestin huomiotta.
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

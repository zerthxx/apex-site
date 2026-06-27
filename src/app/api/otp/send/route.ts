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
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#10141C;color:#F0EEE8;padding:40px;border-radius:12px;">
        <h2 style="color:#C8813A;margin-top:0;">Vahvista sähköpostiosoitteesi</h2>
        <p style="color:#A8A49C;">Kirjoita alla oleva 6-numeroinen koodi Apex Site -sivulle:</p>
        <div style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#F0EEE8;margin:24px 0;font-family:monospace;">${code}</div>
        <p style="color:#5E5C58;font-size:13px;">Koodi vanhenee 10 minuutissa. Älä jaa koodia kenellekään.</p>
      </div>
    `,
  });

  if (mailErr) return NextResponse.json({ error: "Sähköpostin lähetys epäonnistui" }, { status: 500 });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  let name: string, email: string, problem: string, history: { role: string; content: string }[];
  try {
    ({ name, email, problem, history } = await req.json());
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const historyHtml = history
    .map(m => `<tr><td style="padding:4px 8px;color:${m.role === "user" ? "#b45309" : "#6b7280"};font-weight:${m.role === "user" ? "600" : "400"}">${m.role === "user" ? "Asiakas" : "AI"}</td><td style="padding:4px 8px">${m.content.replace(/</g, "&lt;")}</td></tr>`)
    .join("");

  await resend.emails.send({
    from: "Apex Site AI <noreply@apexsite.fi>",
    to: "0zerthx0@gmail.com",
    subject: `🔴 Live-tukipyyntö: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#b45309">Uusi live-tukipyyntö</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:6px 0;font-weight:600;width:120px">Nimi:</td><td>${name}</td></tr>
          <tr><td style="padding:6px 0;font-weight:600">Sähköposti:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:6px 0;font-weight:600;vertical-align:top">Ongelma:</td><td>${problem.replace(/</g, "&lt;")}</td></tr>
        </table>
        <h3 style="color:#374151">Keskusteluhistoria</h3>
        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden">
          ${historyHtml}
        </table>
        <p style="margin-top:24px;color:#9ca3af;font-size:12px">Lähetetty automaattisesti Apex Site -chatbotista</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}

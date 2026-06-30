import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  nimi: z.string().min(2, "Nimi on liian lyhyt"),
  sahkoposti: z.string().email("Virheellinen sähköpostiosoite"),
  puhelin: z.string().optional(),
  yritys: z.string().optional(),
  palvelu: z.enum(["verkkosivut", "startti", "kasvu", "pro", "perus", "standardi", "premium", "verkkokaupat", "mobiilisovellukset", "ai-ratkaisut", "ohjelmistot", "muu"]),
  budjetti: z.string().optional(),
  aikataulu: z.string().optional(),
  yhteydenotto: z.string().optional(),
  viesti: z.string().min(20, "Viesti on liian lyhyt").max(2000, "Viesti on liian pitkä"),
  honeypot: z.string().max(0),
});

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

const RATE_LIMIT: Map<string, { count: number; resetAt: number }> = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + 3600_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

const SERVICE_LABELS: Record<string, string> = {
  verkkosivut: "Verkkosivut (räätälöity)",
  startti: "Verkkosivut — Startti",
  kasvu: "Verkkosivut — Kasvu",
  pro: "Verkkosivut — Pro",
  perus: "Ylläpito — Perus",
  standardi: "Ylläpito — Standardi",
  premium: "Ylläpito — Premium",
  verkkokaupat: "Verkkokauppa",
  mobiilisovellukset: "Mobiilisovellus",
  "ai-ratkaisut": "AI-ratkaisut",
  ohjelmistot: "Ohjelmistot / SaaS",
  muu: "Muu / En ole varma",
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Liian monta yhteydenottoa. Odota hetki." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Validointivirhe", issues: result.error.issues }, { status: 422 });
  }

  const { nimi, sahkoposti, puhelin, yritys, palvelu, budjetti, aikataulu, yhteydenotto, viesti, honeypot } = result.data;

  if (honeypot && honeypot.length > 0) {
    return NextResponse.json({ success: true });
  }

  const serviceLabel = SERVICE_LABELS[palvelu] ?? palvelu;
  const toEmail = process.env.CONTACT_EMAIL ?? "info@apexsite.fi";
  const nameParts = nimi.trim().split(/\s+/);
  const firstName = nameParts[0] ?? nimi;
  const lastName = nameParts.slice(1).join(" ") || null;

  // Create lead in database (service role bypasses RLS)
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use service role client for DB writes (contact form is unauthenticated)
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if customer already exists with this email
    const { data: existingCustomer } = await serviceSupabase
      .from("customers")
      .select("id, status")
      .eq("email", sahkoposti)
      .single();

    let customerId: string | null = null;

    if (!existingCustomer) {
      // Create new lead
      const { data: newCustomer } = await serviceSupabase
        .from("customers")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: sahkoposti,
          phone: puhelin ?? null,
          status: "lead",
          notes: `Palvelu: ${serviceLabel}${budjetti ? `\nBudjetti: ${budjetti}` : ""}${aikataulu ? `\nAikataulu: ${aikataulu}` : ""}\n\nViesti:\n${viesti}`,
        })
        .select("id")
        .single();
      customerId = newCustomer?.id ?? null;

      // If company name provided, check/create company
      if (yritys && customerId) {
        const { data: existingCompany } = await serviceSupabase
          .from("companies")
          .select("id")
          .eq("name", yritys)
          .single();

        const companyId = existingCompany?.id ?? (
          await serviceSupabase
            .from("companies")
            .insert({ name: yritys })
            .select("id")
            .single()
        ).data?.id;

        if (companyId) {
          await serviceSupabase
            .from("customers")
            .update({ company_id: companyId })
            .eq("id", customerId);
        }
      }
    } else {
      customerId = existingCustomer.id;
      // Upgrade to lead if they were inactive
      if (existingCustomer.status === "inactive") {
        await serviceSupabase
          .from("customers")
          .update({ status: "lead" })
          .eq("id", existingCustomer.id);
      }
    }

    // Notify owners about the new lead
    const { data: owners } = await serviceSupabase
      .from("profiles")
      .select("id")
      .in("role", ["owner", "admin"]);

    if (owners && owners.length > 0) {
      await serviceSupabase.from("notifications").insert(
        owners.map((o) => ({
          user_id: o.id,
          type: "system",
          title: "Uusi liidi",
          body: `${nimi} otti yhteyttä: ${serviceLabel}${yritys ? ` (${yritys})` : ""}`,
          href: customerId ? `/crm/asiakkaat/${customerId}` : "/crm/asiakkaat",
        }))
      );
    }
  } catch {
    // Lead creation is best-effort — don't fail the contact form
  }

  // Send emails
  try {
    const resend = getResend();
    await Promise.all([
      resend.emails.send({
        from: "Apex Site <noreply@apexsite.fi>",
        to: toEmail,
        subject: `Uusi yhteydenotto: ${serviceLabel} — ${nimi}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#C8813A;">Uusi yhteydenotto — Apex Site</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:120px;">Nimi</td><td style="padding:8px 0;font-weight:600;">${nimi}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Sähköposti</td><td style="padding:8px 0;"><a href="mailto:${sahkoposti}">${sahkoposti}</a></td></tr>
              ${puhelin ? `<tr><td style="padding:8px 0;color:#666;">Puhelin</td><td style="padding:8px 0;">${puhelin}</td></tr>` : ""}
              ${yritys ? `<tr><td style="padding:8px 0;color:#666;">Yritys</td><td style="padding:8px 0;">${yritys}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#666;">Palvelu</td><td style="padding:8px 0;">${serviceLabel}</td></tr>
              ${budjetti ? `<tr><td style="padding:8px 0;color:#666;">Budjetti</td><td style="padding:8px 0;">${budjetti}</td></tr>` : ""}
              ${aikataulu ? `<tr><td style="padding:8px 0;color:#666;">Aikataulu</td><td style="padding:8px 0;">${aikataulu}</td></tr>` : ""}
              ${yhteydenotto ? `<tr><td style="padding:8px 0;color:#666;">Yhteydenottotapa</td><td style="padding:8px 0;">${yhteydenotto}</td></tr>` : ""}
            </table>
            <div style="margin-top:16px;padding:16px;background:#f5f5f5;border-radius:8px;">
              <strong>Viesti:</strong><br/><br/>${viesti.replace(/\n/g, "<br/>")}
            </div>
          </div>
        `,
      }),
      resend.emails.send({
        from: "Apex Site <noreply@apexsite.fi>",
        to: sahkoposti,
        subject: "Kiitos yhteydenotostasi — Apex Site",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#C8813A;">Hei ${firstName},</h2>
            <p>Kiitos yhteydenotostasi! Olemme vastaanottaneet viestisi koskien: <strong>${serviceLabel}</strong>.</p>
            <p>Vastaamme sinulle 24 tunnin kuluessa arkipäivisin.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#666;font-size:14px;">Apex Site · info@apexsite.fi · Helsinki, Suomi</p>
          </div>
        `,
      }),
    ]);
  } catch {
    // Email sending is best-effort
  }

  return NextResponse.json({ success: true });
}

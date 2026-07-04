import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const contactSchema = z.object({
  nimi: z.string().min(2, "Nimi on liian lyhyt"),
  sahkoposti: z.string().email("Virheellinen sähköpostiosoite"),
  puhelin: z.string().optional(),
  yritys: z.string().optional(),
  palvelu: z.enum([
    "verkkosivut",
    "startti",
    "kasvu",
    "pro",
    "perus",
    "standardi",
    "premium",
    "verkkokaupat",
    "mobiilisovellukset",
    "ai-ratkaisut",
    "ohjelmistot",
    "muu",
  ]),
  budjetti: z.string().optional(),
  aikataulu: z.string().optional(),
  yhteydenotto: z.string().optional(),
  viesti: z
    .string()
    .min(20, "Viesti on liian lyhyt")
    .max(2000, "Viesti on liian pitkä"),
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
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Liian monta yhteydenottoa. Odota hetki." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const result = contactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validointivirhe", issues: result.error.issues },
      { status: 422 },
    );
  }

  const {
    nimi,
    sahkoposti,
    puhelin,
    yritys,
    palvelu,
    budjetti,
    aikataulu,
    yhteydenotto,
    viesti,
    honeypot,
  } = result.data;

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Use service role client for DB writes (contact form is unauthenticated)
    const { createClient: createServiceClient } =
      await import("@supabase/supabase-js");
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Check if customer already exists with this email.
    // Use limit(1) instead of single() — repeated test submissions can leave
    // duplicate rows for the same email, and single() errors (rather than
    // returning null) when more than one row matches, which used to be
    // silently misread as "no existing customer".
    const { data: existingCustomers, error: lookupError } =
      await serviceSupabase
        .from("customers")
        .select("id, status")
        .eq("email", sahkoposti)
        .order("created_at", { ascending: false })
        .limit(1);

    if (lookupError)
      console.error(
        "[api/contact] customer lookup failed:",
        lookupError.message,
      );
    const existingCustomer = existingCustomers?.[0] ?? null;

    let customerId: string | null = null;
    let isNewLead = false;

    // Full structured summary of the submission — used both as the new-lead's
    // notes field and as a customer_notes history entry, so the contact
    // preference (yhteydenotto) and the full message are always visible
    // somewhere that isn't a 3-row textarea.
    const contactSummary = `Palvelu: ${serviceLabel}${budjetti ? `\nBudjetti: ${budjetti}` : ""}${aikataulu ? `\nAikataulu: ${aikataulu}` : ""}${yhteydenotto ? `\nToivottu yhteydenottotapa: ${yhteydenotto}` : ""}\n\nViesti:\n${viesti}`;

    if (!existingCustomer) {
      // Create new lead
      const { data: newCustomer, error: insertError } = await serviceSupabase
        .from("customers")
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: sahkoposti,
          phone: puhelin ?? null,
          status: "lead",
          notes: contactSummary,
        })
        .select("id")
        .single();

      if (insertError)
        console.error("[api/contact] lead insert failed:", insertError.message);
      customerId = newCustomer?.id ?? null;
      isNewLead = customerId !== null;

      if (customerId) {
        const { error: noteError } = await serviceSupabase
          .from("customer_notes")
          .insert({
            customer_id: customerId,
            body: `Uusi liidi lomakkeen kautta\n\n${contactSummary}`,
          });
        if (noteError)
          console.error(
            "[api/contact] lead note insert failed:",
            noteError.message,
          );
      }

      // If company name provided, check/create company
      if (yritys && customerId) {
        const { data: existingCompany } = await serviceSupabase
          .from("companies")
          .select("id")
          .eq("name", yritys)
          .single();

        const companyId =
          existingCompany?.id ??
          (
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
        const { error: updateError } = await serviceSupabase
          .from("customers")
          .update({ status: "lead" })
          .eq("id", existingCustomer.id);
        if (updateError)
          console.error(
            "[api/contact] lead status update failed:",
            updateError.message,
          );
        isNewLead = !updateError;
      }

      // Existing customers don't get their message written into `notes` (that only
      // happens on first-time lead creation above) — without this, a request like
      // "I'd like a second project" would leave no trace once the notification is
      // marked read. Log it as a customer_notes entry so it shows up on the
      // Customer 360 Muistiinpanot tab.
      const { error: noteError } = await serviceSupabase
        .from("customer_notes")
        .insert({
          customer_id: existingCustomer.id,
          body: `Uusi yhteydenotto lomakkeen kautta${yritys ? ` (${yritys})` : ""}\n\n${contactSummary}`,
        });
      if (noteError)
        console.error(
          "[api/contact] customer note insert failed:",
          noteError.message,
        );
    }

    // Always log this submission as its own request event, regardless of the
    // matched customer's status. customers.status only ever moves toward
    // "lead" for a brand-new email or a returning "inactive" customer — an
    // existing "active" (paying) customer's new request must not flip their
    // status back to "lead" (that would misrepresent a real customer as an
    // unconfirmed one), but staff still need to see it on CRM -> Liidit. See
    // migration 012.
    const { error: requestLogError } = await serviceSupabase
      .from("lead_requests")
      .insert({
        customer_id: customerId,
        first_name: firstName,
        last_name: lastName,
        email: sahkoposti,
        phone: puhelin ?? null,
        company: yritys ?? null,
        service: serviceLabel,
        message: contactSummary,
      });
    if (requestLogError)
      console.error(
        "[api/contact] lead request log insert failed:",
        requestLogError.message,
      );

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
          title: isNewLead ? "Uusi liidi" : "Yhteydenotto asiakkaalta",
          body: `${nimi} otti yhteyttä: ${serviceLabel}${yritys ? ` (${yritys})` : ""}`,
          href: customerId ? `/crm/asiakkaat/${customerId}` : "/crm/asiakkaat",
        })),
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

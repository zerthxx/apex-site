import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { invoice_id } = await req.json();
  if (!invoice_id) return NextResponse.json({ error: "invoice_id vaaditaan" }, { status: 400 });

  // Fetch invoice and verify customer ownership
  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, status, customer_id, projects(name)")
    .eq("id", invoice_id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Laskua ei löydy" }, { status: 404 });
  if (!["sent", "overdue"].includes(invoice.status)) {
    return NextResponse.json({ error: "Lasku ei ole maksettavissa" }, { status: 400 });
  }
  if (!invoice.amount || invoice.amount <= 0) {
    return NextResponse.json({ error: "Laskun summa on virheellinen" }, { status: 400 });
  }

  // Verify the caller is the invoice's customer (or staff)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  if (!isStaff) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!customer || customer.id !== invoice.customer_id) {
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    }
  }

  // Check for an existing pending or completed payment to prevent duplicates
  const adminSupabase = createAdminClient();
  const { data: existingPayment } = await adminSupabase
    .from("payments")
    .select("id, stripe_checkout_session, status")
    .eq("invoice_id", invoice_id)
    .in("status", ["pending", "completed"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPayment?.status === "completed") {
    return NextResponse.json({ error: "Lasku on jo maksettu" }, { status: 400 });
  }

  const host = req.headers.get("host") ?? "apexsite.fi";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // Create a pending payment record first (idempotency: reuse if already pending)
  let paymentId: string;
  if (existingPayment?.status === "pending" && existingPayment.stripe_checkout_session) {
    paymentId = existingPayment.id;
    // Retrieve and redirect to existing session if it's still valid
    try {
      const session = await stripe.checkout.sessions.retrieve(existingPayment.stripe_checkout_session);
      if (session.status === "open" && session.url) {
        return NextResponse.json({ url: session.url });
      }
    } catch {
      // Session expired — fall through to create a new one
    }
  }

  // Insert new pending payment record
  const { data: newPayment, error: insertError } = await adminSupabase
    .from("payments")
    .insert({
      invoice_id: invoice.id,
      customer_id: invoice.customer_id,
      amount: invoice.amount,
      currency: "eur",
      status: "pending",
      type: "one_time",
    })
    .select("id")
    .single();

  if (insertError || !newPayment) {
    return NextResponse.json({ error: "Maksutietueen luonti epäonnistui" }, { status: 500 });
  }
  paymentId = newPayment.id;

  const projectName = (invoice.projects as any)?.name ?? "Palvelumaksu";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Lasku ${invoice.invoice_number ?? invoice.id.slice(0, 8)}`,
            description: projectName,
          },
          unit_amount: Math.round(invoice.amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id: invoice.id,
      customer_id: String(invoice.customer_id),
      internal_payment_id: paymentId,
    },
    payment_intent_data: {
      metadata: {
        invoice_id: invoice.id,
        internal_payment_id: paymentId,
      },
    },
    success_url: `${baseUrl}/portaali/maksut/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/portaali/maksut/cancel?payment_id=${paymentId}`,
    locale: "fi",
  });

  // Update payment record with the session ID
  await adminSupabase
    .from("payments")
    .update({ stripe_checkout_session: session.id })
    .eq("id", paymentId);

  return NextResponse.json({ url: session.url });
}

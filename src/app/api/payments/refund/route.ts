import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Vain admin voi tehdä palautuksia" }, { status: 403 });
  }

  const { payment_id, reason } = await req.json();
  if (!payment_id) return NextResponse.json({ error: "payment_id vaaditaan" }, { status: 400 });

  const adminSupabase = createAdminClient();

  const { data: payment } = await adminSupabase
    .from("payments")
    .select("id, stripe_payment_intent, amount, currency, status, invoice_id")
    .eq("id", payment_id)
    .single();

  if (!payment) return NextResponse.json({ error: "Maksua ei löydy" }, { status: 404 });
  if (payment.status !== "completed") {
    return NextResponse.json({ error: "Vain valmistuneen maksun voi palauttaa" }, { status: 400 });
  }
  if (!payment.stripe_payment_intent) {
    return NextResponse.json({ error: "Stripe-maksutieto puuttuu" }, { status: 400 });
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripe_payment_intent,
    reason: (reason ?? "requested_by_customer") as "duplicate" | "fraudulent" | "requested_by_customer",
  });

  const now = new Date().toISOString();

  await adminSupabase
    .from("payments")
    .update({ status: "refunded", refunded_at: now, refund_id: refund.id })
    .eq("id", payment_id);

  if (payment.invoice_id) {
    await adminSupabase
      .from("invoices")
      .update({ status: "refunded", refunded_at: now, refund_id: refund.id })
      .eq("id", payment.invoice_id);
  }

  await logActivity(supabase, user.id, "payment_refunded", {
    payment_id,
    invoice_id: payment.invoice_id,
    amount: payment.amount,
    refund_id: refund.id,
  });

  return NextResponse.json({ success: true, refund_id: refund.id });
}

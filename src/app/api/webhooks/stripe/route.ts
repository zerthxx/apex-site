import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook secret puuttuu" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    console.error("Stripe webhook signature error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.internal_payment_id;
        const invoiceId = session.metadata?.invoice_id;

        if (!paymentId || !invoiceId) break;

        const now = new Date().toISOString();
        const paymentIntentId = typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

        // Retrieve receipt URL from charge if available
        let receiptUrl: string | null = null;
        if (paymentIntentId) {
          try {
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
              expand: ["latest_charge"],
            });
            const charge = pi.latest_charge as Stripe.Charge | null;
            receiptUrl = charge?.receipt_url ?? null;
          } catch {
            // Non-critical — continue
          }
        }

        await supabase
          .from("payments")
          .update({
            status: "completed",
            stripe_payment_intent: paymentIntentId,
            payment_method: session.payment_method_types?.[0] ?? "card",
            paid_at: now,
            receipt_url: receiptUrl,
          })
          .eq("id", paymentId);

        await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: now,
            stripe_payment_intent: paymentIntentId,
            stripe_checkout_session: session.id,
          })
          .eq("id", invoiceId);

        // Notify the customer
        const { data: invoice } = await supabase
          .from("invoices")
          .select("customer_id, customers(user_id)")
          .eq("id", invoiceId)
          .single();

        if (invoice) {
          const customersData = invoice.customers as any;
          const userId = customersData?.user_id;
          if (userId) {
            await supabase.from("notifications").insert({
              user_id: userId,
              title: "Maksu vastaanotettu",
              message: "Laskusi on maksettu onnistuneesti.",
              type: "payment",
              link: "/portaali/maksut",
            });
          }

          await supabase.from("activity_logs").insert({
            user_id: null,
            event_type: "invoice_paid_via_stripe",
            event_data: {
              invoice_id: invoiceId,
              payment_id: paymentId,
              session_id: session.id,
              amount: (session.amount_total ?? 0) / 100,
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentId = pi.metadata?.internal_payment_id;
        if (!paymentId) break;

        await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", paymentId);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (!piId) break;

        const refundId = charge.refunds?.data?.[0]?.id ?? null;
        const now = new Date().toISOString();

        const { data: payment } = await supabase
          .from("payments")
          .select("id, invoice_id")
          .eq("stripe_payment_intent", piId)
          .single();

        if (!payment) break;

        await supabase
          .from("payments")
          .update({ status: "refunded", refunded_at: now, refund_id: refundId })
          .eq("id", payment.id);

        if (payment.invoice_id) {
          await supabase
            .from("invoices")
            .update({ status: "refunded", refunded_at: now, refund_id: refundId })
            .eq("id", payment.invoice_id);
        }
        break;
      }

      case "payment_intent.succeeded": {
        // Handled via checkout.session.completed — no separate action needed
        break;
      }
    }
  } catch (err) {
    console.error(`Error processing Stripe event ${event.type}:`, err);
    // Return 200 so Stripe doesn't retry (we log and monitor separately)
  }

  return NextResponse.json({ received: true });
}

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
    return NextResponse.json(
      { error: "Webhook secret puuttuu" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Signature verification failed";
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

        // Idempotency: Stripe may redeliver this event. Skip side effects (duplicate
        // notifications/activity log) if we've already processed this payment.
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("status")
          .eq("id", paymentId)
          .single();
        if (existingPayment?.status === "completed") break;

        const now = new Date().toISOString();
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null);

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

        const { error: paymentUpdateError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            stripe_payment_intent: paymentIntentId,
            payment_method: session.payment_method_types?.[0] ?? "card",
            paid_at: now,
            receipt_url: receiptUrl,
          })
          .eq("id", paymentId);
        if (paymentUpdateError)
          console.error("Failed to update payment:", paymentUpdateError);

        const { error: invoiceUpdateError } = await supabase
          .from("invoices")
          .update({
            status: "paid",
            paid_at: now,
            stripe_payment_intent: paymentIntentId,
            stripe_checkout_session: session.id,
          })
          .eq("id", invoiceId);
        if (invoiceUpdateError)
          console.error("Failed to update invoice:", invoiceUpdateError);

        // Notify the customer
        const { data: invoice } = await supabase
          .from("invoices")
          .select("customer_id, customers(user_id)")
          .eq("id", invoiceId)
          .single();

        if (invoice) {
          const customersData = invoice.customers as
            | { user_id: string | null }
            | { user_id: string | null }[]
            | null;
          const userId = Array.isArray(customersData)
            ? customersData[0]?.user_id
            : customersData?.user_id;
          if (userId) {
            const { error: notifError } = await supabase
              .from("notifications")
              .insert({
                user_id: userId,
                title: "Maksu vastaanotettu",
                body: "Laskusi on maksettu onnistuneesti.",
                type: "invoice",
                href: "/portaali/maksut",
              });
            if (notifError)
              console.error(
                "Failed to insert payment notification:",
                notifError,
              );
          }

          const { error: logError } = await supabase
            .from("activity_logs")
            .insert({
              user_id: null,
              event_type: "invoice_paid_via_stripe",
              event_data: {
                invoice_id: invoiceId,
                payment_id: paymentId,
                session_id: session.id,
                amount: (session.amount_total ?? 0) / 100,
              },
            });
          if (logError)
            console.error("Failed to insert activity log:", logError);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const paymentId = pi.metadata?.internal_payment_id;
        if (!paymentId) break;

        const { error: failedUpdateError } = await supabase
          .from("payments")
          .update({ status: "failed" })
          .eq("id", paymentId);
        if (failedUpdateError)
          console.error("Failed to mark payment as failed:", failedUpdateError);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId =
          typeof charge.payment_intent === "string"
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

        const { error: refundPaymentError } = await supabase
          .from("payments")
          .update({ status: "refunded", refunded_at: now, refund_id: refundId })
          .eq("id", payment.id);
        if (refundPaymentError)
          console.error(
            "Failed to mark payment as refunded:",
            refundPaymentError,
          );

        if (payment.invoice_id) {
          const { error: refundInvoiceError } = await supabase
            .from("invoices")
            .update({
              status: "refunded",
              refunded_at: now,
              refund_id: refundId,
            })
            .eq("id", payment.invoice_id);
          if (refundInvoiceError)
            console.error(
              "Failed to mark invoice as refunded:",
              refundInvoiceError,
            );
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

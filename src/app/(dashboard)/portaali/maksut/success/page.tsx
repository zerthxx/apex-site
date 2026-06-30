import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Receipt, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export const metadata = { title: "Maksu onnistui — Apex Site" };

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  let invoiceNumber: string | null = null;
  let amount: number | null = null;
  let receiptUrl: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        amount = session.amount_total ? session.amount_total / 100 : null;
        // Get invoice number from our DB
        const invoiceId = session.metadata?.invoice_id;
        if (invoiceId) {
          const { data: invoice } = await supabase
            .from("invoices")
            .select("invoice_number")
            .eq("id", invoiceId)
            .single();
          invoiceNumber = invoice?.invoice_number ?? null;
        }
        // Get receipt URL from payment record
        const { data: payment } = await supabase
          .from("payments")
          .select("receipt_url")
          .eq("stripe_checkout_session", session_id)
          .single();
        receiptUrl = payment?.receipt_url ?? null;
      }
    } catch {
      // Session not found or invalid — still show success page
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-ok/15 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-ok" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-ink mb-2">Maksu onnistui!</h1>
        <p className="text-ink-ghost text-sm mb-6">
          {invoiceNumber
            ? `Lasku #${invoiceNumber} on nyt maksettu.`
            : "Laskusi on nyt maksettu onnistuneesti."}
          {amount != null && (
            <> Veloitettu summa: <span className="font-semibold text-ink">{amount.toLocaleString("fi-FI", { minimumFractionDigits: 2 })} €</span>.</>
          )}
        </p>

        <p className="text-xs text-ink-ghost mb-8">
          Saat vahvistuksen sähköpostiisi. Kuitti on saatavilla alla.
        </p>

        <div className="flex flex-col gap-3">
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-wire bg-elevated text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              <Receipt size={15} />
              Lataa kuitti
            </a>
          )}
          <Link
            href="/portaali/maksut"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-copper text-white text-sm font-medium hover:bg-copper/90 transition-colors"
          >
            Näytä maksuhistoria
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/portaali"
            className="text-sm text-ink-ghost hover:text-ink transition-colors"
          >
            Takaisin etusivulle
          </Link>
        </div>
      </div>
    </div>
  );
}

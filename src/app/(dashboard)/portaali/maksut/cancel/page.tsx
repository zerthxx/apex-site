import Link from "next/link";
import { XCircle, RefreshCw } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Maksu peruutettu — Apex Site" };

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_id?: string }>;
}) {
  const { payment_id } = await searchParams;

  if (payment_id) {
    const adminSupabase = createAdminClient();
    await adminSupabase
      .from("payments")
      .update({ status: "failed" })
      .eq("id", payment_id)
      .eq("status", "pending");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-bad/10 flex items-center justify-center">
            <XCircle size={36} className="text-bad" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-ink mb-2">Maksu epäonnistui</h1>
        <p className="text-ink-ghost text-sm mb-8">
          Maksu keskeytettiin eikä veloitusta tehty. Voit yrittää uudelleen milloin tahansa.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/portaali/laskut"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-copper text-white text-sm font-medium hover:bg-copper/90 transition-colors"
          >
            <RefreshCw size={15} />
            Palaa laskuihin
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

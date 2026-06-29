import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FileText, ArrowLeft } from "lucide-react";

export default async function TarjouksetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link href="/portaali" className="inline-flex items-center gap-1.5 text-sm text-ink-ghost hover:text-ink transition-colors mb-6">
        <ArrowLeft size={14} /> Portaali
      </Link>
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-wire bg-elevated">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-copper/10 border border-copper/20 mb-4">
          <FileText size={26} className="text-copper" />
        </div>
        <h2 className="text-lg font-bold text-ink">Tarjoukset</h2>
        <p className="text-sm text-ink-dim mt-2 max-w-xs leading-relaxed">
          Tarjousnäkymä on tulossa pian. Täältä näet kaikki saamasi tarjoukset ja voit hyväksyä tai hylätä ne.
        </p>
        <span className="mt-4 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-copper/10 text-copper border border-copper/20">
          Tulossa pian
        </span>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreditCard } from "lucide-react";

export const metadata = { title: "Laskutus — Apex Site" };

export default async function LaskutusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) redirect("/dashboard");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Laskutus</h1>
        <p className="text-sm text-ink-ghost mt-1">Maksujen hallinta ja Stripe-integraatio</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-wire bg-elevated">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-surface border border-wire mb-4">
          <CreditCard size={26} className="text-ink-dim" />
        </div>
        <h2 className="text-lg font-bold text-ink">Laskutus tulossa pian</h2>
        <p className="text-sm text-ink-dim mt-2 max-w-xs leading-relaxed">
          Stripe-integraatio, tilausten hallinta ja automaattinen laskutus ovat valmisteilla (Phase 6).
        </p>
        <span className="mt-4 inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full bg-surface text-ink-dim border border-wire">
          Phase 6
        </span>
      </div>
    </div>
  );
}

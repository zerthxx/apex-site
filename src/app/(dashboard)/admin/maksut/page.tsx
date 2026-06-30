import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPaymentsClient } from "./AdminPaymentsClient";

export const metadata = { title: "Maksut — Admin — Apex Site" };

export default async function AdminMaksutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) redirect("/portaali");

  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoices(invoice_number, amount), customers(first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(500);

  const all = payments ?? [];
  const totalCollected = all.filter((p) => p.status === "completed").reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalPending = all.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalRefunded = all.filter((p) => p.status === "refunded").reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink">Maksut</h1>
          <p className="text-sm text-ink-ghost mt-1">Kaikki maksutapahtumat, haku, palautukset ja vienti</p>
        </div>
      </div>

      <AdminPaymentsClient
        payments={all as any}
        stats={{ totalCollected, totalPending, totalRefunded, count: all.length }}
      />
    </div>
  );
}

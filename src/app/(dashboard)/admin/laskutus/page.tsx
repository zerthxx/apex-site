import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = { title: "Laskutus — Apex Site" };

const STATUS_LABELS: Record<string, string> = {
  pending: "Odottaa", sent: "Lähetetty", paid: "Maksettu", overdue: "Myöhässä", cancelled: "Peruttu",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-surface text-ink-ghost border-wire",
  sent: "bg-copper/10 text-copper border-copper/20",
  paid: "bg-ok/10 text-ok border-ok/20",
  overdue: "bg-bad/10 text-bad border-bad/20",
  cancelled: "bg-surface text-ink-ghost border-wire",
};

export default async function LaskutusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, status, due_date, paid_at, created_at, customers(id, first_name, last_name, email)")
    .order("created_at", { ascending: false })
    .limit(10);

  const all = invoices ?? [];

  const paid = all.filter((i) => i.status === "paid").reduce((s, i) => s + (i.amount ?? 0), 0);
  const open = all.filter((i) => i.status === "pending" || i.status === "sent").reduce((s, i) => s + (i.amount ?? 0), 0);
  const overdue = all.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Laskutus</h1>
        <p className="text-sm text-ink-ghost mt-1">Laskujen yhteenveto</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <p className="text-xs text-ink-ghost font-medium uppercase tracking-wider">Maksettu</p>
          <p className="text-2xl font-bold text-ok mt-2">{paid.toLocaleString("fi-FI")} €</p>
        </div>
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <p className="text-xs text-ink-ghost font-medium uppercase tracking-wider">Avoinna</p>
          <p className="text-2xl font-bold text-copper mt-2">{open.toLocaleString("fi-FI")} €</p>
        </div>
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <p className="text-xs text-ink-ghost font-medium uppercase tracking-wider">Myöhässä</p>
          <p className="text-2xl font-bold text-bad mt-2">{overdue.toLocaleString("fi-FI")} €</p>
        </div>
      </div>

      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-wire flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">Viimeisimmät laskut</p>
          <Link href="/portaali/laskut" className="text-xs text-copper hover:text-copper/80 transition-colors">
            Näytä kaikki →
          </Link>
        </div>
        {all.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-ghost">Ei laskuja</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-wire">
              <tr className="text-xs text-ink-ghost">
                <th className="text-left px-5 py-3 font-medium">Lasku</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Asiakas</th>
                <th className="text-left px-5 py-3 font-medium">Summa</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Eräpäivä</th>
                <th className="text-left px-5 py-3 font-medium">Tila</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {all.map((inv: any) => {
                const customerName = inv.customers
                  ? [inv.customers.first_name, inv.customers.last_name].filter(Boolean).join(" ") || inv.customers.email
                  : "—";
                return (
                  <tr key={inv.id} className="hover:bg-surface/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-ink">{inv.invoice_number ?? "—"}</p>
                      <p className="text-xs text-ink-ghost">{new Date(inv.created_at).toLocaleDateString("fi-FI")}</p>
                    </td>
                    <td className="px-5 py-3 text-ink hidden md:table-cell">{customerName}</td>
                    <td className="px-5 py-3 font-medium text-ink">
                      {inv.amount != null ? `${Number(inv.amount).toLocaleString("fi-FI")} €` : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-ghost hidden lg:table-cell">
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString("fi-FI") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_COLORS[inv.status] ?? "bg-surface text-ink-ghost border-wire"}`}>
                        {STATUS_LABELS[inv.status] ?? inv.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

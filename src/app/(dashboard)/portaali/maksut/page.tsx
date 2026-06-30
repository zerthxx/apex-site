import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PaymentsClient } from "./PaymentsClient";

export const metadata = { title: "Maksut — Apex Site" };

export default async function MaksutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  if (isStaff) {
    const { data: payments } = await supabase
      .from("payments")
      .select("*, invoices(invoice_number, amount), customers(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .limit(100);

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Maksut</h1>
          <p className="text-sm text-ink-ghost mt-1">Kaikki asiakkaiden maksutapahtumat</p>
        </div>
        <PaymentsClient payments={(payments ?? []) as any} isStaff />
      </div>
    );
  }

  // Customer view
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!customer) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Maksut</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-wire bg-elevated">
          <p className="text-sm text-ink-ghost">Ei maksutapahtumia</p>
        </div>
      </div>
    );
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("*, invoices(invoice_number, amount)")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Maksut</h1>
        <p className="text-sm text-ink-ghost mt-1">Maksutapahtumahistoriasi</p>
      </div>
      <PaymentsClient payments={(payments ?? []) as any} isStaff={false} />
    </div>
  );
}

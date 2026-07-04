import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoicesClient } from "./InvoicesClient";

export const metadata = { title: "Laskut — Apex Site" };

export default async function LaskutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");
  const isAdmin = ["owner", "admin"].includes(profile?.role ?? "");

  if (isStaff) {
    const [{ data: invoices }, { data: customers }, { data: projects }] =
      await Promise.all([
        supabase
          .from("invoices")
          .select(
            "id, invoice_number, amount, status, due_date, paid_at, created_at, customers(id, first_name, last_name, email), projects(id, name)",
          )
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("customers")
          .select("id, first_name, last_name, email")
          .is("deleted_at", null)
          .order("first_name")
          .limit(200),
        supabase
          .from("projects")
          .select("id, name, customer_id")
          .not("status", "eq", "cancelled")
          .is("deleted_at", null)
          .order("name")
          .limit(200),
      ]);

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Laskut</h1>
          <p className="text-sm text-ink-ghost mt-1">
            Hallinnoi laskutusta ja seuraa maksuja
          </p>
        </div>
        <InvoicesClient
          invoices={(invoices ?? []) as any}
          customers={(customers ?? []) as any}
          projects={(projects ?? []) as any}
          isStaff
          isAdmin={isAdmin}
        />
      </div>
    );
  }

  // Customer view
  const { data: customerRecord } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!customerRecord) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Laskut</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-wire bg-elevated">
          <p className="text-sm text-ink-ghost">Ei laskuja saatavilla</p>
        </div>
      </div>
    );
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, amount, status, due_date, paid_at, created_at, projects(id, name)",
    )
    .eq("customer_id", customerRecord.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Laskut</h1>
        <p className="text-sm text-ink-ghost mt-1">Omat laskusi ja maksutila</p>
      </div>
      <InvoicesClient
        invoices={(invoices ?? []) as any}
        customers={[]}
        projects={[]}
        isStaff={false}
      />
    </div>
  );
}

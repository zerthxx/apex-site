import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CustomerDetailClient } from "./CustomerDetailClient";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) redirect("/dashboard");

  const [customerRes, quotesRes, projectsRes, invoicesRes] = await Promise.all([
    supabase.from("customers").select("*, companies(id, name)").eq("id", id).single(),
    supabase.from("quotes").select("id, title, status, amount, created_at").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("projects").select("id, name, status, progress_pct, deadline").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("invoices").select("id, invoice_number, status, amount, due_date").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (customerRes.error || !customerRes.data) notFound();

  return (
    <div>
      <Link href="/crm/asiakkaat" className="inline-flex items-center gap-1.5 text-sm text-ink-ghost hover:text-ink mb-5 transition-colors">
        <ChevronLeft size={15} />Asiakkaat
      </Link>
      <CustomerDetailClient
        customer={customerRes.data}
        quotes={quotesRes.data ?? []}
        projects={projectsRes.data ?? []}
        invoices={invoicesRes.data ?? []}
      />
    </div>
  );
}

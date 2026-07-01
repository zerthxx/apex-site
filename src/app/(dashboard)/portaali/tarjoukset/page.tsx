import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { QuotesClient } from "./QuotesClient";

export const metadata = { title: "Tarjoukset — Apex Site" };

export default async function QuotesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");
  const canModerate = ["owner","admin"].includes(profile?.role ?? "");

  let quotes = null;

  if (isStaff) {
    const { data } = await supabase
      .from("quotes")
      .select(`id, title, status, amount, valid_until, created_at, customers(id, first_name, last_name, email), companies(id, name)`)
      .order("created_at", { ascending: false })
      .limit(100);
    quotes = data;
  } else {
    const { data: customerRecord } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (customerRecord) {
      const { data } = await supabase
        .from("quotes")
        .select(`id, title, status, amount, valid_until, created_at, customers(id, first_name, last_name, email), companies(id, name)`)
        .eq("customer_id", customerRecord.id)
        .order("created_at", { ascending: false });
      quotes = data;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Tarjoukset</h1>
        <p className="text-sm text-ink-ghost mt-1">
          {isStaff ? "Hallitse asiakkaiden tarjouksia" : "Sinulle lähetetyt tarjoukset"}
        </p>
      </div>
      <QuotesClient initial={(quotes ?? []) as any} isStaff={isStaff} canModerate={canModerate} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompaniesClient } from "./CompaniesClient";

export const metadata = { title: "Yritykset — Apex Site" };

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: companies } = await supabase
    .from("companies")
    .select("id, name, business_id, email, phone, city, created_at")
    .order("name")
    .limit(100);

  const { data: customerCounts } = await supabase
    .from("customers")
    .select("company_id")
    .not("company_id", "is", null);

  const countMap: Record<string, number> = {};
  (customerCounts ?? []).forEach((c) => {
    if (c.company_id) countMap[c.company_id] = (countMap[c.company_id] ?? 0) + 1;
  });

  const companiesWithCounts = (companies ?? []).map((c) => ({
    ...c,
    contact_count: countMap[c.id] ?? 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Yritykset</h1>
        <p className="text-sm text-ink-ghost mt-1">Hallitse yrityksiä ja niiden kontakteja</p>
      </div>
      <CompaniesClient initial={companiesWithCounts} />
    </div>
  );
}

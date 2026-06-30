import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomersClient } from "./CustomersClient";

export const metadata = { title: "Asiakkaat — Apex Site" };

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: customers } = await supabase
    .from("customers")
    .select(`id, first_name, last_name, email, phone, status, created_at, companies(id, name)`)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Asiakkaat</h1>
        <p className="text-sm text-ink-ghost mt-1">Hallitse asiakkaitasi ja yhteystietoja</p>
      </div>
      <CustomersClient initial={(customers ?? []) as any} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomersClient } from "../asiakkaat/CustomersClient";

export const metadata = { title: "Liidit — Apex Site" };

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: leads } = await supabase
    .from("customers")
    .select(`id, first_name, last_name, email, phone, status, created_at, companies(id, name)`)
    .eq("status", "lead")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Liidit</h1>
        <p className="text-sm text-ink-ghost mt-1">Ei vielä vahvistetut asiakkaat</p>
      </div>
      <CustomersClient
        initial={(leads ?? []) as any}
        initialStatusFilter="lead"
        title="Hae liidejä..."
        emptyText="Ei liidejä vielä"
      />
    </div>
  );
}

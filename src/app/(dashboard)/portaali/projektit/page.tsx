import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectsClient } from "./ProjectsClient";

export const metadata = { title: "Projektit — Apex Site" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");
  const canModerate = ["owner","admin"].includes(profile?.role ?? "");

  let projects = null;

  if (isStaff) {
    const { data } = await supabase
      .from("projects")
      .select(`id, name, status, progress_pct, deadline, budget, created_at, customers(id, first_name, last_name, email)`)
      .order("created_at", { ascending: false })
      .limit(100);
    projects = data;
  } else {
    const { data: customerRecord } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (customerRecord) {
      const { data } = await supabase
        .from("projects")
        .select(`id, name, status, progress_pct, deadline, budget, created_at, customers(id, first_name, last_name, email)`)
        .eq("customer_id", customerRecord.id)
        .order("created_at", { ascending: false });
      projects = data;
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Projektit</h1>
        <p className="text-sm text-ink-ghost mt-1">
          {isStaff ? "Hallitse kaikkia projekteja" : "Omat projektisi"}
        </p>
      </div>
      <ProjectsClient initial={(projects ?? []) as any} isStaff={isStaff} canModerate={canModerate} />
    </div>
  );
}

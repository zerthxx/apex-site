import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TasksClient } from "./TasksClient";

export const metadata = { title: "Tehtävät — Apex Site" };

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, priority, status, assigned_to, project_id, projects(id, name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Tehtävät</h1>
        <p className="text-sm text-ink-ghost mt-1">Hallitse ja seuraa tehtäviä</p>
      </div>
      <TasksClient initial={(tasks ?? []) as any} />
    </div>
  );
}

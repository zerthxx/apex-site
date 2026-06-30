import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailClient } from "./ProjectDetailClient";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");

  const [projectRes, tasksRes, filesRes] = await Promise.all([
    supabase.from("projects").select(`*, customers(id, first_name, last_name, email)`).eq("id", id).single(),
    supabase.from("tasks").select("id, title, status, priority, due_date").eq("project_id", id).order("created_at", { ascending: false }).then((r) => ({ data: r.data ?? [], error: r.error })),
    supabase.from("project_files").select("id, name, mime_type, size_bytes, version, created_at, uploaded_by").eq("project_id", id).order("created_at", { ascending: false }).then((r) => ({ data: r.data ?? [], error: r.error })),
  ]);

  if (projectRes.error || !projectRes.data) notFound();

  const project = projectRes.data as any;

  // Fetch assignee profile separately (assigned_to → auth.users → public.profiles)
  let assignedProfile: { id: string; first_name?: string | null; last_name?: string | null } | null = null;
  if (project.assigned_to) {
    const { data } = await supabase.from("profiles").select("id, first_name, last_name").eq("id", project.assigned_to).single();
    assignedProfile = data;
  }

  return (
    <div>
      <Link href="/portaali/projektit" className="inline-flex items-center gap-1.5 text-sm text-ink-ghost hover:text-ink mb-5 transition-colors">
        <ChevronLeft size={15} />Projektit
      </Link>
      <ProjectDetailClient
        project={project}
        tasks={tasksRes.data ?? []}
        files={filesRes.data ?? []}
        isStaff={isStaff}
        assignedProfile={assignedProfile}
      />
    </div>
  );
}

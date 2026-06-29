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
    supabase.from("projects").select(`*, customers(id, first_name, last_name, email), quotes(id, title, status, amount)`).eq("id", id).single(),
    supabase.from("tasks").select("id, title, status, priority, due_date").eq("project_id", id).order("created_at", { ascending: false }),
    supabase.from("project_files").select("id, name, mime_type, size_bytes, version, created_at").eq("project_id", id).order("created_at", { ascending: false }),
  ]);

  if (projectRes.error || !projectRes.data) notFound();

  return (
    <div>
      <Link href="/portaali/projektit" className="inline-flex items-center gap-1.5 text-sm text-ink-ghost hover:text-ink mb-5 transition-colors">
        <ChevronLeft size={15} />Projektit
      </Link>
      <ProjectDetailClient
        project={projectRes.data}
        tasks={tasksRes.data ?? []}
        files={filesRes.data ?? []}
        isStaff={isStaff}
      />
    </div>
  );
}

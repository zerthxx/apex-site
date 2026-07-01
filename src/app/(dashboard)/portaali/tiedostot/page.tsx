import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FilesClient } from "./FilesClient";

export const metadata = { title: "Tiedostot — Apex Site" };

export default async function TiedostotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  // For customers: resolve their customers.id (projects.customer_id references customers.id, not auth.users.id)
  let customerId: string | null = null;
  if (!isStaff) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    customerId = customer?.id ?? null;
  }

  const [{ data: projects }, { data: files }, { data: fileRequests }] = await Promise.all([
    isStaff
      ? supabase.from("projects").select("id, name, customer_id").order("name")
      : customerId
        ? supabase.from("projects").select("id, name, customer_id").eq("customer_id", customerId).order("name")
        : Promise.resolve({ data: [] }),
    supabase
      .from("project_files")
      .select("id, name, storage_path, mime_type, size_bytes, version, uploaded_by, created_at, project_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("file_requests")
      .select("id, project_id, customer_id, title, description, due_date, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Tiedostot</h1>
        <p className="text-sm text-ink-ghost mt-1">Projektitiedostot ja jaetut dokumentit</p>
      </div>
      <FilesClient
        projects={projects ?? []}
        files={files ?? []}
        fileRequests={fileRequests ?? []}
        isStaff={isStaff}
      />
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  const { data: file } = await supabase
    .from("project_files")
    .select("storage_path, name, project_id")
    .eq("id", id)
    .single();

  if (!file) return NextResponse.json({ error: "Tiedostoa ei löydy" }, { status: 404 });

  if (!isStaff) {
    // Customers can only download files from their own projects
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!customer) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", file.project_id)
      .eq("customer_id", customer.id)
      .single();

    if (!project) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const { data: signedUrl, error } = await supabase.storage
    .from("project-files")
    .createSignedUrl(file.storage_path, 3600);

  if (error || !signedUrl) return NextResponse.json({ error: "URL:n luonti epäonnistui" }, { status: 500 });

  return NextResponse.json({ url: signedUrl.signedUrl, name: file.name });
}

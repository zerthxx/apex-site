import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;

  if (!file)
    return NextResponse.json({ error: "Tiedosto puuttuu" }, { status: 400 });

  // Customers can only upload to their own projects
  if (!isStaff) {
    if (!projectId)
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();
    if (!customer)
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("customer_id", customer.id)
      .is("deleted_at", null)
      .single();
    if (!project)
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const storagePath = projectId
    ? `${projectId}/${Date.now()}_${file.name}`
    : `shared/${Date.now()}_${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Use admin client for storage to bypass bucket RLS
  const adminClient = createAdminClient();
  const { error: uploadError } = await adminClient.storage
    .from("project-files")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: existing } = await supabase
    .from("project_files")
    .select("version")
    .eq("name", file.name)
    .eq("project_id", projectId ?? null)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const version = (existing?.version ?? 0) + 1;

  const { data: fileRecord, error: dbError } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId ?? null,
      name: file.name,
      storage_path: storagePath,
      size_bytes: file.size,
      mime_type: file.type,
      version,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logActivity(supabase, user.id, "file_uploaded", {
    file_id: fileRecord.id,
    name: file.name,
    project_id: projectId,
  });

  return NextResponse.json({ file: fileRecord }, { status: 201 });
}

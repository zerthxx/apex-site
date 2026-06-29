import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;

  if (!file) return NextResponse.json({ error: "Tiedosto puuttuu" }, { status: 400 });

  const storagePath = projectId
    ? `${projectId}/${Date.now()}_${file.name}`
    : `shared/${Date.now()}_${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("project-files")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

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

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ file: fileRecord }, { status: 201 });
}

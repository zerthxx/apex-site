import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { softDelete } from "@/lib/softDelete";

async function getStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("project_id");
  const customerId = req.nextUrl.searchParams.get("customer_id");

  let query = supabase
    .from("project_files")
    .select(
      "id, name, storage_path, mime_type, size_bytes, version, category, uploaded_by, created_at, project_id, projects(id, name)",
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  if (customerId) {
    const { data: customerProjects } = await supabase
      .from("projects")
      .select("id")
      .eq("customer_id", customerId);
    const projectIds = (customerProjects ?? []).map((p) => p.id);
    if (projectIds.length === 0) return NextResponse.json({ files: [] });
    query = query.in("project_id", projectIds);
  }

  const { data, error } = await query.limit(200);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ files: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name || !body.storage_path)
    return NextResponse.json(
      { error: "Nimi ja polku vaaditaan" },
      { status: 400 },
    );

  const { data: existing } = await supabase
    .from("project_files")
    .select("version")
    .eq("name", body.name)
    .eq("project_id", body.project_id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const version = (existing?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from("project_files")
    .insert({ ...body, uploaded_by: user.id, version })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ file: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  // Soft-delete only — the underlying Storage object is intentionally left in
  // place so a Trash restore can still serve it. It's only actually removed
  // by the Trash's permanent-delete action.
  const { error } = await softDelete(supabase, "project_files", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "file_deleted", { file_id: id });
  return NextResponse.json({ success: true });
}

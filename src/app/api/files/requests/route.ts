import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("project_id");

  let query = supabase
    .from("file_requests")
    .select("id, project_id, customer_id, title, description, due_date, status, requested_by, created_at, fulfilled_at")
    .order("created_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const body = await req.json();
  const { project_id, customer_id, title, description, due_date } = body;

  if (!project_id || !customer_id || !title) {
    return NextResponse.json({ error: "project_id, customer_id ja title vaaditaan" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("file_requests")
    .insert({ project_id, customer_id, title, description: description ?? null, due_date: due_date ?? null, requested_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ request: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id ja status vaaditaan" }, { status: 400 });

  const updates: Record<string, unknown> = { status };
  if (status === "fulfilled") updates.fulfilled_at = new Date().toISOString();

  const { error } = await supabase.from("file_requests").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

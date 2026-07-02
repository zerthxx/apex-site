import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

async function getStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const mine = req.nextUrl.searchParams.get("mine") === "1";
  const projectId = req.nextUrl.searchParams.get("project_id");
  const customerId = req.nextUrl.searchParams.get("customer_id");

  let query = supabase
    .from("tasks")
    .select(`id, title, description, due_date, priority, status, assigned_to, project_id, created_at, projects(id, name)`)
    .order("created_at", { ascending: false });

  if (mine) query = query.eq("assigned_to", user.id);
  if (projectId) query = query.eq("project_id", projectId);

  if (customerId) {
    const { data: customerProjects } = await supabase.from("projects").select("id").eq("customer_id", customerId);
    const projectIds = (customerProjects ?? []).map((p) => p.id);
    if (projectIds.length === 0) return NextResponse.json({ tasks: [] });
    query = query.in("project_id", projectIds);
  }

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tasks: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Otsikko vaaditaan" }, { status: 400 });

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...body, created_by: user.id, status: body.status ?? "todo", priority: body.priority ?? "medium" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "task_created", { task_id: data.id, title: data.title });
  return NextResponse.json({ task: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const { data, error } = await supabase.from("tasks").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "task_updated", { task_id: id });
  return NextResponse.json({ task: data });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status");
  const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");

  let query = supabase
    .from("projects")
    .select(`
      id, name, status, progress_pct, deadline, budget, created_at,
      customers(id, first_name, last_name, email)
    `)
    .order("created_at", { ascending: false });

  if (!isStaff) {
    const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).single();
    if (customer) query = query.eq("customer_id", customer.id);
    else return NextResponse.json({ projects: [] });
  }
  if (status) query = query.eq("status", status);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ projects: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "Nimi vaaditaan" }, { status: 400 });

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...body, status: body.status ?? "planning", progress_pct: 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "project_created", { project_id: data.id, name: data.name });
  return NextResponse.json({ project: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "project_updated", { project_id: id });
  return NextResponse.json({ project: data });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "project_deleted", { project_id: id });
  return NextResponse.json({ success: true });
}

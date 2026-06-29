import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null };
  const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(p?.role ?? "")) return { supabase, user: null };
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  const { data, error } = await supabase.from("email_templates").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  const body = await req.json();
  if (!body.name || !body.subject || !body.body) return NextResponse.json({ error: "Nimi, aihe ja sisältö vaaditaan" }, { status: 400 });
  const { data, error } = await supabase.from("email_templates").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ template: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  const { id, ...rest } = await req.json();
  const { error } = await supabase.from("email_templates").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  const { id } = await req.json();
  const { error } = await supabase.from("email_templates").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

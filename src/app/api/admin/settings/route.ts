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
  const { data, error } = await supabase.from("system_settings").select("key, value, updated_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "Key vaaditaan" }, { status: 400 });
  const { error } = await supabase.from("system_settings").upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

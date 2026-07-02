import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getStaffUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, profile };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("customer_notes")
    .select("id, body, created_by, created_at, updated_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { body } = await req.json().catch(() => ({})) as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "Muistiinpano ei voi olla tyhjä" }, { status: 400 });

  const { data, error } = await supabase
    .from("customer_notes")
    .insert({ customer_id: id, body: body.trim(), created_by: user.id })
    .select("id, body, created_by, created_at, updated_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data }, { status: 201 });
}

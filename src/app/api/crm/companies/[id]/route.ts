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

  const [companyRes, contactsRes, projectsRes] = await Promise.all([
    supabase.from("companies").select("*").eq("id", id).single(),
    supabase.from("customers").select("id, first_name, last_name, email, phone, status").eq("company_id", id).order("first_name"),
    supabase.from("projects").select("id, name, status, progress_pct, deadline").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (companyRes.error) return NextResponse.json({ error: "Yritystä ei löydy" }, { status: 404 });

  return NextResponse.json({
    company: companyRes.data,
    contacts: contactsRes.data ?? [],
    projects: projectsRes.data ?? [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = await supabase.from("companies").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

async function getStaffUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");
  const status = req.nextUrl.searchParams.get("status");

  let query = supabase
    .from("customers")
    .select(`
      id, first_name, last_name, email, phone, status, notes, created_at,
      assigned_to,
      companies(id, name)
    `)
    .order("created_at", { ascending: false });

  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (status) query = query.eq("status", status);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ customers: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  const { first_name, last_name, email, phone, status, company_id, notes, assigned_to } = body;

  if (!first_name && !last_name && !email) {
    return NextResponse.json({ error: "Nimi tai sähköposti vaaditaan" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({ first_name, last_name, email, phone, status: status ?? "active", company_id, notes, assigned_to })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity(supabase, user.id, "customer_created", { customer_id: data.id, name: [data.first_name, data.last_name].filter(Boolean).join(" ") });
  return NextResponse.json({ customer: data }, { status: 201 });
}

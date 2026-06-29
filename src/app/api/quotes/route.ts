import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    .from("quotes")
    .select(`
      id, title, status, amount, valid_until, notes, created_at,
      customers(id, first_name, last_name, email),
      companies(id, name)
    `)
    .order("created_at", { ascending: false });

  if (!isStaff) query = query.eq("customers.user_id", user.id);
  if (status) query = query.eq("status", status);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ quotes: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Otsikko vaaditaan" }, { status: 400 });

  const { data, error } = await supabase
    .from("quotes")
    .insert({ ...body, status: body.status ?? "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quote: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getUser();
  if (!user) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const isStaff = ["owner","admin","employee"].includes(profile?.role ?? "");
  const allowedCustomerUpdates = ["status"];

  if (!isStaff) {
    const keys = Object.keys(updates);
    if (!keys.every((k) => allowedCustomerUpdates.includes(k))) {
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    }
    const onlyAcceptReject = ["accepted","rejected"].includes(updates.status);
    if (!onlyAcceptReject) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("quotes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quote: data });
}

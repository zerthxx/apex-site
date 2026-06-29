import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
  let query = supabase.from("calendar_events").select("*").order("start_at");

  if (month) {
    const start = `${month}-01`;
    const [y, m] = month.split("-").map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    query = query.gte("start_at", start).lt("start_at", nextMonth);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.title || !body.start_at) return NextResponse.json({ error: "Otsikko ja alkamisaika vaaditaan" }, { status: 400 });

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({ ...body, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase.from("calendar_events").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getStaff();
  if (!user || !["owner","admin","employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  const { error } = await supabase.from("calendar_events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

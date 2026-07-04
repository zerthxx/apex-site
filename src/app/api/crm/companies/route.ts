import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { softDelete } from "@/lib/softDelete";

async function getStaffUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, profile };
}

export async function GET(req: NextRequest) {
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");

  let query = supabase
    .from("companies")
    .select("id, name, business_id, email, phone, city, created_at")
    .is("deleted_at", null)
    .order("name");

  if (q) query = query.ilike("name", `%${q}%`);

  const { data, error } = await query.limit(100);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: counts } = await supabase
    .from("customers")
    .select("company_id")
    .not("company_id", "is", null)
    .is("deleted_at", null);

  const countMap: Record<string, number> = {};
  (counts ?? []).forEach((c) => {
    if (c.company_id)
      countMap[c.company_id] = (countMap[c.company_id] ?? 0) + 1;
  });

  return NextResponse.json({
    companies: (data ?? []).map((c) => ({
      ...c,
      contact_count: countMap[c.id] ?? 0,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name)
    return NextResponse.json(
      { error: "Yrityksen nimi vaaditaan" },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("companies")
    .insert(body)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner", "admin", "employee"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company: data });
}

export async function DELETE(req: NextRequest) {
  const { supabase, user, profile } = await getStaffUser();
  if (!user || !["owner", "admin"].includes(profile?.role ?? "")) {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id vaaditaan" }, { status: 400 });

  const { error } = await softDelete(supabase, "companies", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

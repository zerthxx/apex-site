import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { data, error } = await supabase
    .from("customers")
    .select("company_name, y_tunnus, toimiala, lisatiedot")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ info: data ?? null });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { company_name, y_tunnus, toimiala, lisatiedot } = body as {
    company_name?: string;
    y_tunnus?: string;
    toimiala?: string;
    lisatiedot?: string;
  };

  // Upsert: create customer record if it doesn't exist yet
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("customers")
      .update({ company_name, y_tunnus, toimiala, lisatiedot })
      .eq("user_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const meta = authUser?.user_metadata ?? {};
    const { error } = await supabase
      .from("customers")
      .insert({
        user_id: user.id,
        first_name: meta.first_name ?? null,
        last_name: meta.last_name ?? null,
        email: authUser?.email ?? null,
        phone: meta.phone ?? null,
        company_name,
        y_tunnus,
        toimiala,
        lisatiedot,
      });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

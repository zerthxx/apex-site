import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { companySchema, fieldErrors } from "@/lib/validation";
import { sameOriginOk } from "@/lib/requestMeta";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

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
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const parsed = companySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Tarkista lomakkeen tiedot.",
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }
  const { company_name, y_tunnus, toimiala, lisatiedot } = parsed.data;

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
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const meta = authUser?.user_metadata ?? {};
    const { error } = await supabase.from("customers").insert({
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
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

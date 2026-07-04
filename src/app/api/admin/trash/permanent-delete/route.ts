import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TRASH_ENTITIES, permanentlyDeleteEntity } from "@/lib/trashEntities";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const { entity_type, id } = await req.json().catch(() => ({}));
  if (!entity_type || !TRASH_ENTITIES[entity_type] || !id)
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });

  const { error } = await permanentlyDeleteEntity(supabase, entity_type, id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Ei voida poistaa pysyvästi: kohteeseen liittyy vielä aktiivisia (ei roskakorissa olevia) tietueita.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

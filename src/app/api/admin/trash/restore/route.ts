import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TRASH_ENTITIES } from "@/lib/trashEntities";

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
  const cfg = entity_type ? TRASH_ENTITIES[entity_type] : null;
  if (!cfg || !id)
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });

  // deleted_by is cleared server-side by the guard_soft_delete /
  // guard_own_soft_delete trigger the moment deleted_at goes back to null.
  const { error } = await supabase
    .from(cfg.table)
    .update({ deleted_at: null })
    .eq("id", id)
    .not("deleted_at", "is", null);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

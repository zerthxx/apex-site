import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SESSION_ROW_COOKIE } from "@/lib/sessions";
import { sameOriginOk } from "@/lib/requestMeta";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_sessions")
    .select(
      "id, device_hint, ip_address, country_code, city, created_at, last_seen",
    )
    .eq("user_id", user.id)
    .is("logged_out_at", null)
    .order("last_seen", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // The login flow set this httpOnly cookie to the row created for THIS
  // browser — the only truthful way to label "current device" (RLS already
  // guarantees every returned row belongs to the caller).
  const currentSessionId = req.cookies.get(SESSION_ROW_COOKIE)?.value ?? null;

  return NextResponse.json({ sessions: data, currentSessionId });
}

export async function DELETE(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { logoutOthers, sessionId } = await req.json().catch(() => ({}));

  if (logoutOthers) {
    await supabase.auth.signOut({ scope: "others" });
    const current = req.cookies.get(SESSION_ROW_COOKIE)?.value;
    let query = supabase
      .from("user_sessions")
      .update({ logged_out_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("logged_out_at", null);
    if (current) query = query.neq("id", current);
    await query;
    return NextResponse.json({ success: true });
  }

  if (sessionId) {
    await supabase
      .from("user_sessions")
      .update({ logged_out_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("user_id", user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
}

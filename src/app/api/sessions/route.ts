import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { data, error } = await supabase
    .from("user_sessions")
    .select("id, device_hint, ip_address, created_at, last_seen")
    .eq("user_id", user.id)
    .is("logged_out_at", null)
    .order("last_seen", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sessions: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { logoutOthers, sessionId } = await req.json().catch(() => ({}));

  if (logoutOthers) {
    await supabase.auth.signOut({ scope: "others" });
    await supabase
      .from("user_sessions")
      .update({ logged_out_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("logged_out_at", null);
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

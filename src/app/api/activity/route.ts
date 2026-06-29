import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "50"), 200);
  const targetUserId = req.nextUrl.searchParams.get("userId");

  // Only admins/owners can view other users' activity
  if (targetUserId && targetUserId !== user.id) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!["owner", "admin"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    }
  }

  const userId = targetUserId ?? user.id;
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, event_type, event_data, ip_address, user_agent, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { event_type, event_data } = await req.json().catch(() => ({}));
  if (!event_type) return NextResponse.json({ error: "event_type vaaditaan" }, { status: 400 });

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    event_type,
    event_data: event_data ?? {},
    ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    user_agent: req.headers.get("user-agent") ?? null,
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, supabase, error: "Ei kirjautunut" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) {
    return { user: null, supabase, error: "Ei admin-oikeuksia" };
  }
  return { user, supabase, error: null };
}

export async function GET() {
  const { user, error } = await requireAdmin();
  if (!user) return NextResponse.json({ error }, { status: error === "Ei kirjautunut" ? 401 : 403 });

  const admin = createAdminClient();

  // List all auth users (paginated, max 1000)
  const { data: { users }, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  // Fetch all profiles for role/suspension data
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, role, is_suspended, avatar_url");

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const result = users.map((u) => {
    const p = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      first_name: u.user_metadata?.first_name ?? null,
      last_name: u.user_metadata?.last_name ?? null,
      phone: u.user_metadata?.phone ?? null,
      role: p?.role ?? "customer",
      is_suspended: p?.is_suspended ?? false,
      avatar_url: p?.avatar_url ?? null,
      provider: u.app_metadata?.provider ?? "email",
    };
  });

  return NextResponse.json({ users: result });
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAdmin();
  if (!user) return NextResponse.json({ error }, { status: error === "Ei kirjautunut" ? 401 : 403 });

  const body = await req.json().catch(() => ({}));
  const { userId, action, role } = body as { userId?: string; action?: string; role?: string };

  if (!userId || !action) return NextResponse.json({ error: "userId ja action vaaditaan" }, { status: 400 });

  const supabase = await createClient();

  if (action === "suspend") {
    await supabase.from("profiles").update({ is_suspended: true }).eq("id", userId);
    const admin = createAdminClient();
    await admin.auth.admin.signOut(userId, "global");
    return NextResponse.json({ success: true });
  }

  if (action === "unsuspend") {
    await supabase.from("profiles").update({ is_suspended: false }).eq("id", userId);
    return NextResponse.json({ success: true });
  }

  if (action === "role") {
    const validRoles = ["owner", "admin", "employee", "customer"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Virheellinen rooli" }, { status: 400 });
    }
    await supabase.from("profiles").update({ role }).eq("id", userId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Tuntematon toiminto" }, { status: 400 });
}

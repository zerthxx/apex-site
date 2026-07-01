import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthedUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const { supabase, user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const adminDb = createAdminClient();

  const { data: comments, error } = await adminDb
    .from("project_comments")
    .select("id, body, created_at, user_id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch author names from auth metadata
  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  const authorMap: Record<string, string> = {};
  for (const uid of userIds) {
    const { data } = await adminDb.auth.admin.getUserById(uid);
    const m = data.user?.user_metadata ?? {};
    const name = [m.first_name, m.last_name].filter(Boolean).join(" ") || data.user?.email || "Tuntematon";
    authorMap[uid] = name;
  }

  const result = (comments ?? []).map((c) => ({
    ...c,
    author_name: authorMap[c.user_id] ?? "Tuntematon",
    is_own: c.user_id === user.id,
  }));

  return NextResponse.json({ comments: result });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const { supabase, user } = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Ei kirjautunut" }, { status: 401 });

  const { body } = await req.json().catch(() => ({})) as { body?: string };
  if (!body?.trim()) return NextResponse.json({ error: "Viesti ei voi olla tyhjä" }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  if (!isStaff) {
    // Verify customer owns this project
    const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).single();
    if (!customer) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
    const { data: project } = await supabase.from("projects").select("id").eq("id", projectId).eq("customer_id", customer.id).single();
    if (!project) return NextResponse.json({ error: "Ei oikeuksia" }, { status: 403 });
  }

  const adminDb = createAdminClient();

  // Fetch project name for notification
  const { data: projectRow } = await adminDb
    .from("projects")
    .select("name, customers(user_id)")
    .eq("id", projectId)
    .single();

  const { data: comment, error } = await adminDb
    .from("project_comments")
    .insert({ project_id: projectId, user_id: user.id, body: body.trim() })
    .select("id, body, created_at, user_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const meta = (await adminDb.auth.admin.getUserById(user.id)).data.user?.user_metadata ?? {};
  const author_name = [meta.first_name, meta.last_name].filter(Boolean).join(" ") || user.email || "Sinä";

  const preview = body.trim().slice(0, 80) + (body.trim().length > 80 ? "..." : "");
  const href = `/portaali/projektit/${projectId}`;

  if (isStaff) {
    // Staff commented → notify the customer if project has one
    const customerUserId = (projectRow?.customers as any)?.user_id;
    if (customerUserId) {
      await adminDb.from("notifications").insert({
        user_id: customerUserId,
        type: "message",
        title: `Uusi kommentti — ${projectRow?.name ?? "projekti"}`,
        body: `${author_name}: ${preview}`,
        href,
      });
    }
  } else {
    // Customer commented → notify all staff (owner, admin, employee)
    const { data: staffProfiles } = await adminDb
      .from("profiles")
      .select("id")
      .in("role", ["owner", "admin", "employee"]);

    if (staffProfiles && staffProfiles.length > 0) {
      await adminDb.from("notifications").insert(
        staffProfiles.map((p) => ({
          user_id: p.id,
          type: "message",
          title: `Uusi kommentti — ${projectRow?.name ?? "projekti"}`,
          body: `${author_name}: ${preview}`,
          href,
        }))
      );
    }
  }

  return NextResponse.json({ comment: { ...comment, author_name, is_own: true } }, { status: 201 });
}

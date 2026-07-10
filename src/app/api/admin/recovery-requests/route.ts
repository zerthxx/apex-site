import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/adminAudit";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

/** Lost-phone recovery ticket queue. Staff read; owner/admin update. */
export async function GET() {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("recovery_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ requests: data ?? [] });
}

const patchSchema = z.object({
  id: z.uuid(),
  status: z.enum(["open", "in_progress", "resolved", "rejected"]),
  resolution: z.string().max(2000).optional(),
  reason: z.string().min(5).max(1000),
});

export async function PATCH(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Virheellinen pyyntö — perustelu vaaditaan (väh. 5 merkkiä)." },
      { status: 400 },
    );
  }
  const { id, status, resolution, reason } = parsed.data;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("recovery_requests")
    .select("id, status, user_id, email")
    .eq("id", id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Pyyntöä ei löytynyt" }, { status: 404 });
  }

  const audit = await logAdminAction(admin, {
    adminId: auth.user.id,
    adminEmail: auth.user.email ?? "",
    targetUserId: existing.user_id,
    targetEmail: existing.email,
    action: "recovery_request_update",
    oldValue: { status: existing.status },
    newValue: { status, resolution: resolution ?? null },
    reason,
    ip: getClientIp(req),
    userAgent: getUserAgent(req),
  });
  if (!audit.ok) {
    return NextResponse.json(
      { error: "Auditlokin kirjaus epäonnistui — toimintoa ei suoritettu." },
      { status: 500 },
    );
  }

  const { error } = await admin
    .from("recovery_requests")
    .update({
      status,
      resolution: resolution ?? null,
      handled_by: auth.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

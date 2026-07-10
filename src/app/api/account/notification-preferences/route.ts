import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { sameOriginOk } from "@/lib/requestMeta";

/**
 * Notification preferences, stored in user_notification_preferences
 * (migration 016) instead of auth user_metadata — application settings live
 * in application tables. RLS: own row only.
 */

const DEFAULTS = {
  email_projects: true,
  email_invoices: true,
  email_news: false,
  browser_enabled: false,
};

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const { data } = await auth.supabase
    .from("user_notification_preferences")
    .select("email_projects, email_invoices, email_news, browser_enabled")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  return NextResponse.json({ preferences: data ?? DEFAULTS });
}

const patchSchema = z.object({
  email_projects: z.boolean(),
  email_invoices: z.boolean(),
  email_news: z.boolean(),
  browser_enabled: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("user_notification_preferences")
    .upsert(
      {
        user_id: auth.user.id,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) {
    return NextResponse.json(
      { error: "Tallennus epäonnistui" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

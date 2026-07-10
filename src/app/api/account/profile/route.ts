import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { profileSchema, fieldErrors } from "@/lib/validation";
import { logActivity } from "@/lib/supabase/activityLog";
import { getClientIp, getUserAgent, sameOriginOk } from "@/lib/requestMeta";

/**
 * Validated profile save. Replaces the old client-side-only
 * supabase.auth.updateUser() call, which had no validation and never synced
 * the profiles/customers tables (staff saw stale names in the CRM).
 *
 * Deliberately does NOT touch any phone field — the verified recovery phone
 * lives in profiles.phone and is managed only via /api/account/phone/*.
 */
export async function PATCH(req: NextRequest) {
  if (!sameOriginOk(req)) {
    return NextResponse.json({ error: "Virheellinen pyyntö" }, { status: 403 });
  }
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Tarkista lomakkeen tiedot.",
        fields: fieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }
  const { firstName, lastName, address, postalCode, city } = parsed.data;

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`.trim(),
      address,
      postal_code: postalCode,
      city,
    },
  });
  if (metaError) {
    return NextResponse.json(
      { error: "Tallennus epäonnistui" },
      { status: 500 },
    );
  }

  // Keep the tables the rest of the app reads in sync (RLS: own row).
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      address: address || null,
      postal_code: postalCode || null,
      city: city || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileError) {
    return NextResponse.json(
      { error: "Tallennus epäonnistui" },
      { status: 500 },
    );
  }

  // Linked CRM record (may not exist yet — that's fine, layout self-heals it).
  await supabase
    .from("customers")
    .update({ first_name: firstName, last_name: lastName })
    .eq("user_id", user.id);

  await logActivity(
    supabase,
    user.id,
    "profile_update",
    {},
    {
      ipAddress: getClientIp(req) ?? undefined,
      userAgent: getUserAgent(req) ?? undefined,
    },
  );

  return NextResponse.json({ success: true });
}

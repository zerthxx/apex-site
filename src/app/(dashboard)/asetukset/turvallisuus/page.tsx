import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TurvallisuusClient } from "./TurvallisuusClient";

/**
 * Security settings: Security Score, password/email/phone management with
 * verification status, and the account timeline. Data is fetched server-side;
 * all mutations go through /api/account/*.
 */
export default async function TurvallisuusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "email_verified, email_verified_at, phone, phone_verified, phone_verified_at, force_password_reset, created_at",
    )
    .eq("id", user.id)
    .single();

  const { data: timeline } = await supabase
    .from("activity_logs")
    .select("id, event_type, ip_address, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  // MFA factors are service-role-only by design (secrets never hit the
  // browser); only the on/off status is read here.
  let mfaEnabled = false;
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("user_mfa_factors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("verified_at", "is", null);
    mfaEnabled = (count ?? 0) > 0;
  } catch {
    // table may not exist before migration 015 — score just shows 2FA off
  }

  const hasPassword =
    user.identities?.some((i) => i.provider === "email") ||
    user.user_metadata?.has_password === true;

  return (
    <TurvallisuusClient
      email={user.email ?? ""}
      provider={user.app_metadata?.provider ?? "email"}
      hasPassword={!!hasPassword}
      emailVerified={profile?.email_verified ?? false}
      phone={profile?.phone ?? null}
      phoneVerified={profile?.phone_verified ?? false}
      mfaEnabled={mfaEnabled}
      forcePasswordReset={profile?.force_password_reset ?? false}
      accountCreatedAt={profile?.created_at ?? null}
      timeline={timeline ?? []}
    />
  );
}

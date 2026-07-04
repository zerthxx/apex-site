import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role, is_suspended")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "customer";

  // Self-heal: link this account to a CRM customer record with a matching email
  // that was created (e.g. via CRM) before the customer ever signed up. If no such
  // record exists at all (e.g. self-service signup with no prior CRM contact),
  // create one — otherwise the account is invisible to staff and can never be
  // attached to a quote/project/invoice.
  if (role === "customer" && user.email) {
    const { data: linkedCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!linkedCustomer) {
      const adminDb = createAdminClient();
      const { data: updated } = await adminDb
        .from("customers")
        .update({ user_id: user.id })
        .is("user_id", null)
        .ilike("email", user.email)
        .select("id");

      if (!updated || updated.length === 0) {
        const meta = user.user_metadata ?? {};
        const { error: insertError } = await adminDb.from("customers").insert({
          user_id: user.id,
          email: user.email,
          first_name: profile?.first_name ?? meta.first_name ?? null,
          last_name: profile?.last_name ?? meta.last_name ?? null,
          phone: meta.phone ?? null,
          status: "active",
        });
        // 23505 = unique_violation: a concurrent request (e.g. a duplicate page
        // load) already inserted this user's customer row first — that's fine,
        // the row exists either way. Requires the unique index from migration 011.
        if (insertError && insertError.code !== "23505") {
          console.error("Failed to self-heal customer record:", insertError);
        }
      }
    }
  }

  const { count: unread } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const firstName =
    profile?.first_name ?? user.user_metadata?.first_name ?? null;
  const lastName = profile?.last_name ?? user.user_metadata?.last_name ?? null;

  return (
    <DashboardShell
      firstName={firstName}
      lastName={lastName}
      email={user.email}
      role={role}
      unreadNotifications={unread ?? 0}
    >
      {children}
    </DashboardShell>
  );
}

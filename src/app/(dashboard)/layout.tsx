import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role, is_suspended")
    .eq("id", user.id)
    .single();

  const { count: unread } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  const firstName = profile?.first_name ?? user.user_metadata?.first_name ?? null;
  const lastName = profile?.last_name ?? user.user_metadata?.last_name ?? null;

  return (
    <DashboardShell
      firstName={firstName}
      lastName={lastName}
      email={user.email}
      role={profile?.role ?? "customer"}
      unreadNotifications={unread ?? 0}
    >
      {children}
    </DashboardShell>
  );
}

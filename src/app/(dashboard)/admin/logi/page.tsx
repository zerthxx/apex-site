import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export const dynamic = "force-dynamic";

export default async function AdminLogiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(myProfile?.role ?? "")) redirect("/dashboard");

  // Fetch recent activity from all users (admin view)
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("id, user_id, event_type, event_data, ip_address, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Aktiviteettiloki</h1>
        <p className="text-sm text-ink-dim mt-1">100 viimeisintä tapahtumaa.</p>
      </div>
      <div className="rounded-xl border border-wire bg-elevated px-4">
        <ActivityFeed logs={logs ?? []} emptyText="Ei tapahtumia vielä." />
      </div>
    </div>
  );
}

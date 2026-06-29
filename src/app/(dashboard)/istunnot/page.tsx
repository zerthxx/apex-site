import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionsClient } from "./SessionsClient";

export const dynamic = "force-dynamic";

export default async function IstunnotPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: sessions } = await supabase
    .from("user_sessions")
    .select("id, device_hint, ip_address, created_at, last_seen, session_token")
    .eq("user_id", user.id)
    .is("logged_out_at", null)
    .order("last_seen", { ascending: false });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Aktiiviset istunnot</h1>
        <p className="text-sm text-ink-dim mt-1">
          Hallitse laitteita joissa olet kirjautunut sisään.
        </p>
      </div>
      <SessionsClient sessions={sessions ?? []} />
    </div>
  );
}

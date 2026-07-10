import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SESSION_ROW_COOKIE } from "@/lib/sessions";
import { SessionsClient } from "./SessionsClient";

export const dynamic = "force-dynamic";

export default async function IstunnotPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: sessions } = await supabase
    .from("user_sessions")
    .select(
      "id, device_hint, ip_address, country_code, city, created_at, last_seen",
    )
    .eq("user_id", user.id)
    .is("logged_out_at", null)
    .order("last_seen", { ascending: false });

  // Set by the login flow for THIS browser — the truthful "current device"
  // marker (older sessions from before this feature simply show unmarked).
  const cookieStore = await cookies();
  const currentSessionId = cookieStore.get(SESSION_ROW_COOKIE)?.value ?? null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Aktiiviset istunnot</h1>
        <p className="text-sm text-ink-dim mt-1">
          Laitteet, joilla tilillesi on kirjauduttu. Jos et tunnista laitetta,
          kirjaa se ulos ja vaihda salasanasi.
        </p>
      </div>
      <SessionsClient
        sessions={sessions ?? []}
        currentSessionId={currentSessionId}
      />
    </div>
  );
}

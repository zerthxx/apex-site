import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotificationsClient } from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function IlmoituksetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, href, is_read, created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Ilmoitukset</h1>
        <p className="text-sm text-ink-dim mt-1">
          Kaikki ilmoituksesi yhdessä paikassa.
        </p>
      </div>
      <NotificationsClient notifications={notifications ?? []} />
    </div>
  );
}

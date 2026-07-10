import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecoveryRequestsClient } from "./RecoveryRequestsClient";

export const dynamic = "force-dynamic";

/** Lost-phone recovery ticket queue (staff view; owner/admin can resolve). */
export default async function PalautuspyynnotPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role ?? "customer";
  if (!["owner", "admin", "employee"].includes(role)) redirect("/dashboard");

  const { data: requests } = await supabase
    .from("recovery_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <RecoveryRequestsClient
      initialRequests={requests ?? []}
      canModerate={["owner", "admin"].includes(role)}
    />
  );
}

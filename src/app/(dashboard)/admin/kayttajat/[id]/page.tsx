import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserDetailClient } from "./UserDetailClient";

export const dynamic = "force-dynamic";

/** Admin support view for a single account — data loads via GET /api/admin/users/[id]. */
export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!["owner", "admin"].includes(myProfile?.role ?? ""))
    redirect("/dashboard");

  return <UserDetailClient userId={id} currentUserId={user.id} />;
}

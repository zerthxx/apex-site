import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserTable } from "@/components/dashboard/UserTable";

export const dynamic = "force-dynamic";

export default async function AdminKayttajatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Role check
  const { data: myProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(myProfile?.role ?? "")) redirect("/dashboard");

  // List users via service role
  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    return (
      <div className="p-6 text-sm text-bad">
        Käyttäjätietojen lataaminen epäonnistui: {error.message}
      </div>
    );
  }

  // Fetch profiles for role/suspension
  const { data: profiles } = await supabase.from("profiles").select("id, role, is_suspended, avatar_url");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const tableUsers = users.map((u) => {
    const p = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      first_name: u.user_metadata?.first_name ?? null,
      last_name: u.user_metadata?.last_name ?? null,
      phone: u.user_metadata?.phone ?? null,
      role: p?.role ?? "customer",
      is_suspended: p?.is_suspended ?? false,
      avatar_url: p?.avatar_url ?? null,
      provider: String(u.app_metadata?.provider ?? "email"),
    };
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Käyttäjähallinta</h1>
        <p className="text-sm text-ink-dim mt-1">
          {users.length} rekisteröitynyttä käyttäjää.
        </p>
      </div>
      <UserTable users={tableUsers} />
    </div>
  );
}

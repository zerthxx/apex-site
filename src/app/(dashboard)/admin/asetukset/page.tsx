import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SystemSettingsClient } from "./SystemSettingsClient";

export const metadata = { title: "Järjestelmäasetukset — Apex Site" };

export default async function AdminAsetuksetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: settings } = await supabase.from("system_settings").select("key, value, updated_at");

  const defaultSettings = [
    { key: "company_name", label: "Yrityksen nimi", type: "text" },
    { key: "support_email", label: "Tukisähköposti", type: "email" },
    { key: "maintenance_mode", label: "Huoltotila", type: "boolean" },
  ];

  const settingsMap = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Järjestelmäasetukset</h1>
        <p className="text-sm text-ink-ghost mt-1">Hallinnoi alustan asetuksia</p>
      </div>
      <SystemSettingsClient fields={defaultSettings} initial={settingsMap} />
    </div>
  );
}

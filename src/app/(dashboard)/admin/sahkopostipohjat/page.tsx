import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplatesClient } from "./TemplatesClient";

export const metadata = { title: "Sähköpostipohjat — Apex Site" };

export default async function SahkopostipohjatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner", "admin"].includes(profile?.role ?? "")) redirect("/dashboard");

  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Sähköpostipohjat</h1>
        <p className="text-sm text-ink-ghost mt-1">Hallinnoi sähköpostiviestipohjia</p>
      </div>
      <TemplatesClient initial={templates ?? []} />
    </div>
  );
}

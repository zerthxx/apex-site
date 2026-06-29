import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./CalendarClient";

export const metadata = { title: "Kalenteri — Apex Site" };

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["owner","admin","employee"].includes(profile?.role ?? "")) redirect("/dashboard");

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const nextM = now.getMonth() === 11
    ? `${y + 1}-01-01`
    : `${y}-${String(now.getMonth() + 2).padStart(2, "0")}-01`;

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, description, start_at, end_at, all_day, type")
    .gte("start_at", `${y}-${m}-01`)
    .lt("start_at", nextM)
    .order("start_at");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Kalenteri</h1>
        <p className="text-sm text-ink-ghost mt-1">Tapaamiset, deadlinet ja muistutukset</p>
      </div>
      <CalendarClient initial={events ?? []} />
    </div>
  );
}

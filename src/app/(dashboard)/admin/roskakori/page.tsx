import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrashClient } from "./TrashClient";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Owner-only — stricter than every other /admin page (owner-or-admin).
  // The trash API routes independently re-check this and RLS enforces it at
  // the database layer too; this is just the page-level gate.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "owner") redirect("/dashboard");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Roskakori</h1>
        <p className="text-sm text-ink-ghost mt-1">
          Poistetut tietueet — vain omistaja näkee tämän. Palauta tai poista
          pysyvästi.
        </p>
      </div>
      <TrashClient />
    </div>
  );
}

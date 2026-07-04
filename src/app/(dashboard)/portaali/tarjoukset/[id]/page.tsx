import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuoteDetailClient } from "./QuoteDetailClient";

export default async function QuoteDetailPage({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isStaff = ["owner", "admin", "employee"].includes(profile?.role ?? "");

  const { data: quote, error } = await supabase
    .from("quotes")
    .select(
      `*, customers(id, first_name, last_name, email), companies(id, name)`,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !quote) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href="/portaali/tarjoukset"
        className="inline-flex items-center gap-1.5 text-sm text-ink-ghost hover:text-ink mb-5 transition-colors"
      >
        <ChevronLeft size={15} />
        Tarjoukset
      </Link>
      <QuoteDetailClient quote={quote} isStaff={isStaff} />
    </div>
  );
}

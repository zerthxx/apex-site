import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiivinen",
  inactive: "Ei aktiivinen",
  lead: "Liidi",
};
const STATUS_COLORS: Record<string, string> = {
  active: "bg-ok/10 text-ok border-ok/20",
  inactive: "bg-surface text-ink-ghost border-wire",
  lead: "bg-copper/10 text-copper border-copper/20",
};

export default async function CompanyDetailPage({
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
  if (!["owner", "admin", "employee"].includes(profile?.role ?? ""))
    redirect("/dashboard");

  const [companyRes, contactsRes] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone, status")
      .eq("company_id", id)
      .is("deleted_at", null)
      .order("first_name"),
  ]);

  if (companyRes.error || !companyRes.data) notFound();
  const company = companyRes.data;
  const contacts = contactsRes.data ?? [];

  return (
    <div className="max-w-4xl">
      <Link
        href="/crm/yritykset"
        className="inline-flex items-center gap-1.5 text-sm text-ink-ghost hover:text-ink mb-5 transition-colors"
      >
        <ChevronLeft size={15} />
        Yritykset
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">{company.name}</h1>
        {company.business_id && (
          <p className="text-sm text-ink-ghost mt-0.5">
            Y-tunnus: {company.business_id}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info */}
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-4">
            Tiedot
          </h2>
          <div className="flex flex-col gap-3 text-sm">
            {[
              { label: "Sähköposti", value: company.email },
              { label: "Puhelin", value: company.phone },
              { label: "Osoite", value: company.address },
              { label: "Kaupunki", value: company.city },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-ink-ghost">{label}</p>
                <p className="text-ink mt-0.5">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-3">
            Yhteyshenkilöt ({contacts.length})
          </h2>
          {contacts.length === 0 ? (
            <div className="bg-elevated border border-wire rounded-xl py-10 text-center text-sm text-ink-ghost">
              Ei yhteyshenkilöitä
            </div>
          ) : (
            <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-wire">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                      Nimi
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">
                      Sähköposti
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">
                      Tila
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wire/50">
                  {contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/crm/asiakkaat/${c.id}`}
                          className="font-medium text-ink hover:text-copper transition-colors"
                        >
                          {[c.first_name, c.last_name]
                            .filter(Boolean)
                            .join(" ") ||
                            c.email ||
                            "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-ink-dim hidden md:table-cell">
                        {c.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
                            STATUS_COLORS[c.status] ??
                              "bg-surface text-ink-ghost border-wire",
                          )}
                        >
                          {STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

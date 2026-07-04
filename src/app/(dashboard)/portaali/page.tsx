import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FileText,
  FolderOpen,
  Receipt,
  Paperclip,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PortaaliPage() {
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

  if (isStaff) {
    // Staff sees aggregate counts
    const [projects, quotes, invoices, files] = await Promise.all([
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .not("status", "in", '("completed","cancelled")')
        .is("deleted_at", null),
      supabase
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .is("deleted_at", null),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "sent"])
        .is("deleted_at", null),
      supabase
        .from("project_files")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null),
    ]);

    const modules = [
      {
        href: "/portaali/tarjoukset",
        icon: <FileText size={22} />,
        label: "Tarjoukset",
        description: "Hallinnoi tarjouksia ja lähetä asiakkaille",
        accent: "text-copper bg-copper/10 border-copper/20",
        count: quotes.count ?? 0,
        countLabel: "odottaa vastausta",
      },
      {
        href: "/portaali/projektit",
        icon: <FolderOpen size={22} />,
        label: "Projektit",
        description: "Seuraa projektien etenemistä",
        accent: "text-teal-400 bg-teal-400/10 border-teal-400/20",
        count: projects.count ?? 0,
        countLabel: "käynnissä",
      },
      {
        href: "/portaali/laskut",
        icon: <Receipt size={22} />,
        label: "Laskut",
        description: "Hallinnoi laskutusta",
        accent: "text-ok bg-ok/10 border-ok/20",
        count: invoices.count ?? 0,
        countLabel: "avoinna",
      },
      {
        href: "/portaali/tiedostot",
        icon: <Paperclip size={22} />,
        label: "Tiedostot",
        description: "Jaa ja hallinnoi projektin tiedostoja",
        accent: "text-ink-dim bg-surface border-wire",
        count: files.count ?? 0,
        countLabel: "tiedostoa",
      },
    ];

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-xl font-bold text-ink">Asiakasportaali</h1>
          <p className="text-sm text-ink-dim mt-1">
            Hallinnoi asiakkaiden projekteja, tarjouksia ja laskuja.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="flex items-start gap-4 p-5 rounded-xl border border-wire bg-elevated hover:border-wire-bold hover:bg-surface/50 transition-all duration-150 group"
            >
              <span
                className={`flex items-center justify-center w-11 h-11 rounded-xl border shrink-0 ${m.accent}`}
              >
                {m.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink text-sm">{m.label}</p>
                  {m.count > 0 && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-copper/10 text-copper border border-copper/20 leading-none shrink-0">
                      {m.count} {m.countLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-ink-dim mt-1 leading-relaxed">
                  {m.description}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="text-ink-ghost group-hover:text-copper transition-colors shrink-0 mt-1"
              />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Customer view — show their own data
  const { data: customerRecord } = await supabase
    .from("customers")
    .select("id, first_name")
    .eq("user_id", user.id)
    .single();

  const cid = customerRecord?.id;

  const [projectData, quoteData, invoiceData, fileData] = cid
    ? await Promise.all([
        supabase
          .from("projects")
          .select("id, name, status, progress_pct, deadline")
          .eq("customer_id", cid)
          .not("status", "eq", "cancelled")
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("quotes")
          .select("id, title, status, amount, created_at")
          .eq("customer_id", cid)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("invoices")
          .select("id, invoice_number, amount, status, due_date")
          .eq("customer_id", cid)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("project_files")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null)
          .in(
            "project_id",
            (
              await supabase
                .from("projects")
                .select("id")
                .eq("customer_id", cid)
                .is("deleted_at", null)
            ).data?.map((p) => p.id) ?? [],
          ),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { count: 0 }];

  const projects = (projectData as any)?.data ?? [];
  const quotes = (quoteData as any)?.data ?? [];
  const invoices = (invoiceData as any)?.data ?? [];
  const fileCount = (fileData as any)?.count ?? 0;

  const STATUS_FI: Record<string, string> = {
    planning: "Suunnittelu",
    development: "Kehitys",
    testing: "Testaus",
    review: "Katselmus",
    completed: "Valmis",
    draft: "Luonnos",
    sent: "Lähetetty",
    accepted: "Hyväksytty",
    rejected: "Hylätty",
    pending: "Odottaa",
    paid: "Maksettu",
    overdue: "Myöhässä",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-ink">
          {customerRecord?.first_name
            ? `Hei, ${customerRecord.first_name}`
            : "Asiakasportaali"}
        </h1>
        <p className="text-sm text-ink-dim mt-1">
          Seuraa projektejasi, tarjouksiasi ja laskujasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-wire">
            <div className="flex items-center gap-2.5">
              <FolderOpen size={16} className="text-teal-400" />
              <h2 className="text-sm font-semibold text-ink">Projektit</h2>
            </div>
            <Link
              href="/portaali/projektit"
              className="text-xs text-copper hover:underline"
            >
              Näytä kaikki →
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-ghost text-center">
              Ei projekteja vielä
            </p>
          ) : (
            <div className="divide-y divide-wire/50">
              {projects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/portaali/projektit/${p.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-copper transition-colors truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div
                          className="h-full bg-copper rounded-full"
                          style={{ width: `${p.progress_pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink-ghost">
                        {p.progress_pct}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-ink-ghost">
                    {STATUS_FI[p.status] ?? p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quotes */}
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-wire">
            <div className="flex items-center gap-2.5">
              <FileText size={16} className="text-copper" />
              <h2 className="text-sm font-semibold text-ink">Tarjoukset</h2>
            </div>
            <Link
              href="/portaali/tarjoukset"
              className="text-xs text-copper hover:underline"
            >
              Näytä kaikki →
            </Link>
          </div>
          {quotes.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-ghost text-center">
              Ei tarjouksia vielä
            </p>
          ) : (
            <div className="divide-y divide-wire/50">
              {quotes.map((q: any) => (
                <Link
                  key={q.id}
                  href={`/portaali/tarjoukset/${q.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface/30 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink group-hover:text-copper transition-colors truncate">
                      {q.title}
                    </p>
                    <p className="text-xs text-ink-ghost">
                      {new Date(q.created_at).toLocaleDateString("fi-FI")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {q.amount != null && (
                      <span className="text-sm text-ink">
                        {q.amount.toLocaleString("fi-FI")} €
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                        q.status === "accepted"
                          ? "bg-ok/10 text-ok border-ok/20"
                          : q.status === "sent"
                            ? "bg-copper/10 text-copper border-copper/20"
                            : q.status === "rejected"
                              ? "bg-bad/10 text-bad border-bad/20"
                              : "bg-surface text-ink-ghost border-wire"
                      }`}
                    >
                      {STATUS_FI[q.status] ?? q.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-wire">
            <div className="flex items-center gap-2.5">
              <Receipt size={16} className="text-ok" />
              <h2 className="text-sm font-semibold text-ink">Laskut</h2>
            </div>
            <Link
              href="/portaali/laskut"
              className="text-xs text-copper hover:underline"
            >
              Näytä kaikki →
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-ghost text-center">
              Ei laskuja vielä
            </p>
          ) : (
            <div className="divide-y divide-wire/50">
              {invoices.map((inv: any) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {inv.invoice_number ?? "Lasku"}
                    </p>
                    {inv.due_date && (
                      <p className="text-xs text-ink-ghost">
                        Eräpäivä:{" "}
                        {new Date(inv.due_date).toLocaleDateString("fi-FI")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {inv.amount != null && (
                      <span className="text-sm text-ink">
                        {inv.amount.toLocaleString("fi-FI")} €
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                        inv.status === "paid"
                          ? "bg-ok/10 text-ok border-ok/20"
                          : inv.status === "overdue"
                            ? "bg-bad/10 text-bad border-bad/20"
                            : "bg-surface text-ink-ghost border-wire"
                      }`}
                    >
                      {STATUS_FI[inv.status] ?? inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files + summary */}
        <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-wire">
            <div className="flex items-center gap-2.5">
              <Paperclip size={16} className="text-ink-dim" />
              <h2 className="text-sm font-semibold text-ink">Tiedostot</h2>
            </div>
            <Link
              href="/portaali/tiedostot"
              className="text-xs text-copper hover:underline"
            >
              Avaa →
            </Link>
          </div>
          <div className="px-5 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface border border-wire flex items-center justify-center">
              <Paperclip size={20} className="text-ink-ghost" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{fileCount}</p>
              <p className="text-xs text-ink-ghost">tiedostoa projektissasi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

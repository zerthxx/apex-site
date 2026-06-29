"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Check, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  notes?: string | null;
  companies?: { id: string; name: string } | null;
}

interface Quote { id: string; title: string; status: string; amount?: number | null; created_at: string; }
interface Project { id: string; name: string; status: string; progress_pct: number; deadline?: string | null; }
interface Invoice { id: string; invoice_number?: string | null; status: string; amount?: number | null; due_date?: string | null; }

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiivinen", inactive: "Ei aktiivinen", lead: "Liidi",
  draft: "Luonnos", sent: "Lähetetty", accepted: "Hyväksytty", rejected: "Hylätty",
  planning: "Suunnittelu", development: "Kehitys", testing: "Testaus", review: "Katselmus", completed: "Valmis",
  pending: "Odottaa", paid: "Maksettu", overdue: "Myöhässä", cancelled: "Peruttu",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-ok/10 text-ok border-ok/20",
  inactive: "bg-surface text-ink-ghost border-wire",
  lead: "bg-copper/10 text-copper border-copper/20",
  draft: "bg-surface text-ink-ghost border-wire",
  sent: "bg-copper/10 text-copper border-copper/20",
  accepted: "bg-ok/10 text-ok border-ok/20",
  rejected: "bg-bad/10 text-bad border-bad/20",
  planning: "bg-surface text-ink-ghost border-wire",
  development: "bg-copper/10 text-copper border-copper/20",
  completed: "bg-ok/10 text-ok border-ok/20",
  paid: "bg-ok/10 text-ok border-ok/20",
  overdue: "bg-bad/10 text-bad border-bad/20",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface Props {
  customer: Customer;
  quotes: Quote[];
  projects: Project[];
  invoices: Invoice[];
}

export function CustomerDetailClient({ customer: initial, quotes, projects, invoices }: Props) {
  const [customer, setCustomer] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: initial.first_name ?? "",
    last_name: initial.last_name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    status: initial.status,
    notes: initial.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"quotes"|"projects"|"invoices">("quotes");
  const router = useRouter();

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/crm/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setCustomer({ ...customer, ...data.customer });
      setEditing(false);
    }
  }

  async function deleteCustomer() {
    if (!confirm("Poistetaanko asiakas?")) return;
    await fetch(`/api/crm/customers/${customer.id}`, { method: "DELETE" });
    router.push("/crm/asiakkaat");
  }

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Asiakas";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge status={customer.status} />
            {customer.companies && (
              <span className="text-sm text-ink-ghost">{customer.companies.name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="p-2 rounded-lg border border-wire text-ink-ghost hover:text-ink transition-colors"><X size={15} /></button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                <Check size={14} />{saving ? "..." : "Tallenna"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 border border-wire rounded-lg text-sm text-ink-ghost hover:text-ink hover:border-wire-bold transition-colors">
                <Edit2 size={14} />Muokkaa
              </button>
              <button onClick={deleteCustomer} className="p-2 rounded-lg border border-wire text-ink-ghost hover:text-bad hover:border-bad/30 transition-colors">
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info card */}
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-4">Tiedot</h2>
          {editing ? (
            <div className="flex flex-col gap-3">
              {[
                { key: "first_name", label: "Etunimi" },
                { key: "last_name", label: "Sukunimi" },
                { key: "email", label: "Sähköposti" },
                { key: "phone", label: "Puhelin" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-ink-ghost mb-1">{label}</label>
                  <input
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-ink-ghost mb-1">Tila</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors">
                  <option value="active">Aktiivinen</option>
                  <option value="lead">Liidi</option>
                  <option value="inactive">Ei aktiivinen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-ghost mb-1">Muistiinpanot</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
                  className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm">
              {[
                { label: "Sähköposti", value: customer.email },
                { label: "Puhelin", value: customer.phone },
                { label: "Yritys", value: customer.companies?.name },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-ink-ghost">{label}</p>
                  <p className="text-ink mt-0.5">{value ?? "—"}</p>
                </div>
              ))}
              {customer.notes && (
                <div>
                  <p className="text-xs text-ink-ghost">Muistiinpanot</p>
                  <p className="text-ink mt-0.5 whitespace-pre-wrap">{customer.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related data */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 mb-4 border-b border-wire">
            {(["quotes","projects","invoices"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
                  tab === t ? "border-copper text-copper" : "border-transparent text-ink-ghost hover:text-ink"
                )}
              >
                {t === "quotes" ? `Tarjoukset (${quotes.length})` : t === "projects" ? `Projektit (${projects.length})` : `Laskut (${invoices.length})`}
              </button>
            ))}
          </div>

          {tab === "quotes" && (
            <div className="flex flex-col gap-2">
              {quotes.length === 0 ? <p className="text-sm text-ink-ghost py-4 text-center">Ei tarjouksia</p> : quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-ink">{q.title}</p>
                    <p className="text-xs text-ink-ghost">{new Date(q.created_at).toLocaleDateString("fi-FI")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {q.amount != null && <span className="text-sm text-ink">{q.amount.toLocaleString("fi-FI")} €</span>}
                    <Badge status={q.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "projects" && (
            <div className="flex flex-col gap-2">
              {projects.length === 0 ? <p className="text-sm text-ink-ghost py-4 text-center">Ei projekteja</p> : projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full bg-copper rounded-full" style={{ width: `${p.progress_pct}%` }} />
                      </div>
                      <span className="text-xs text-ink-ghost">{p.progress_pct}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.deadline && <span className="text-xs text-ink-ghost">{new Date(p.deadline).toLocaleDateString("fi-FI")}</span>}
                    <Badge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "invoices" && (
            <div className="flex flex-col gap-2">
              {invoices.length === 0 ? <p className="text-sm text-ink-ghost py-4 text-center">Ei laskuja</p> : invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-ink">{inv.invoice_number ?? "Lasku"}</p>
                    {inv.due_date && <p className="text-xs text-ink-ghost">Eräpäivä: {new Date(inv.due_date).toLocaleDateString("fi-FI")}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {inv.amount != null && <span className="text-sm text-ink">{inv.amount.toLocaleString("fi-FI")} €</span>}
                    <Badge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

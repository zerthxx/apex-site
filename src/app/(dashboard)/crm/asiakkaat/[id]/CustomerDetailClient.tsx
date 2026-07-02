"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Check, X, Trash2, Plus, ArrowRight, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/dashboard/Badge";

interface Company {
  id: string;
  name: string;
  business_id?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
}

interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  notes?: string | null;
  company_name?: string | null;
  y_tunnus?: string | null;
  toimiala?: string | null;
  lisatiedot?: string | null;
  companies?: Company | null;
}

interface Quote { id: string; title: string; status: string; amount?: number | null; created_at: string; }
interface Project { id: string; name: string; status: string; progress_pct: number; deadline?: string | null; }
interface Invoice { id: string; invoice_number?: string | null; status: string; amount?: number | null; due_date?: string | null; }
interface Payment { id: string; amount?: number | null; currency?: string | null; status: string; payment_method?: string | null; receipt_url?: string | null; created_at: string; paid_at?: string | null; }
interface CustomerNote { id: string; body: string; created_at: string; }
interface CustomerFile { id: string; name: string; mime_type?: string | null; size_bytes?: number | null; created_at: string; project_id: string; projects?: { id: string; name: string } | null; }
interface CustomerTask { id: string; title: string; status: string; priority: string; due_date?: string | null; project_id: string; projects?: { id: string; name: string } | null; }

const TASK_LABELS: Record<string, string> = { todo: "Tekemättä", in_progress: "Työn alla", review: "Katselmus", done: "Valmis" };

function NewQuoteModal({ customerId, companyId, onClose, onCreated }: {
  customerId: string;
  companyId?: string | null;
  onClose: () => void;
  onCreated: (q: Quote) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    valid_until: "",
    notes: "",
    status: "draft" as "draft" | "sent",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Otsikko vaaditaan"); return; }
    setSaving(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        customer_id: customerId,
        company_id: companyId ?? null,
        amount: form.amount ? parseFloat(form.amount) : null,
        valid_until: form.valid_until || null,
        notes: form.notes || null,
        status: form.status,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.quote);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi tarjous</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Otsikko *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="esim. Verkkosivuprojekti 2025"
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Summa (€)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00" min="0" step="0.01"
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Voimassa asti</label>
              <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Muistiinpanot</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "sent" })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="draft">Luonnos</option>
              <option value="sent">Lähetä asiakkaalle</option>
            </select>
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "..." : "Luo tarjous"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewInvoiceModal({ customerId, projects, onClose, onCreated }: {
  customerId: string;
  projects: Project[];
  onClose: () => void;
  onCreated: (inv: Invoice) => void;
}) {
  const [form, setForm] = useState({ project_id: "", amount: "", due_date: "", status: "pending" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        project_id: form.project_id || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        due_date: form.due_date || null,
        status: form.status,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.invoice);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi lasku</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Projekti</label>
            <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="">Ei projektia</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Summa (€)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                min="0" step="0.01"
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Eräpäivä</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
              <option value="pending">Odottaa</option>
              <option value="sent">Lähetetty</option>
            </select>
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "..." : "Luo lasku"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const TABS = [
  { key: "yhteystiedot", label: "Yhteystiedot" },
  { key: "yritys", label: "Yrityksen tiedot" },
  { key: "muistiinpanot", label: "Muistiinpanot" },
  { key: "tarjoukset", label: "Tarjoukset" },
  { key: "projektit", label: "Projektit" },
  { key: "laskut", label: "Laskut" },
  { key: "maksut", label: "Maksut" },
  { key: "tiedostot", label: "Tiedostot" },
  { key: "tehtavat", label: "Tehtävät" },
] as const;
type TabKey = typeof TABS[number]["key"];

interface Props {
  customer: Customer;
  quotes: Quote[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
}

export function CustomerDetailClient({ customer: initial, quotes: initialQuotes, projects, invoices: initialInvoices, payments }: Props) {
  const [customer, setCustomer] = useState(initial);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [tab, setTab] = useState<TabKey>("yhteystiedot");
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const router = useRouter();

  // Yhteystiedot edit state
  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    first_name: initial.first_name ?? "", last_name: initial.last_name ?? "",
    email: initial.email ?? "", phone: initial.phone ?? "", status: initial.status,
  });

  // Yrityksen tiedot edit state
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    company_name: initial.company_name ?? "", y_tunnus: initial.y_tunnus ?? "",
    toimiala: initial.toimiala ?? "", lisatiedot: initial.lisatiedot ?? "",
  });

  // Muistiinpanot
  const [quickNote, setQuickNote] = useState(initial.notes ?? "");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNoteBody, setNewNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Tiedostot / Tehtävät lazy state
  const [filesLoaded, setFilesLoaded] = useState(false);
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasks, setTasks] = useState<CustomerTask[]>([]);

  const [saving, setSaving] = useState(false);

  function switchTab(t: TabKey) {
    setTab(t);
    if (t === "muistiinpanot" && !notesLoaded) {
      fetch(`/api/crm/customers/${customer.id}/notes`).then((r) => r.json()).then((d) => { setNotes(d.notes ?? []); setNotesLoaded(true); });
    }
    if (t === "tiedostot" && !filesLoaded) {
      fetch(`/api/files?customer_id=${customer.id}`).then((r) => r.json()).then((d) => { setFiles(d.files ?? []); setFilesLoaded(true); });
    }
    if (t === "tehtavat" && !tasksLoaded) {
      fetch(`/api/tasks?customer_id=${customer.id}`).then((r) => r.json()).then((d) => { setTasks(d.tasks ?? []); setTasksLoaded(true); });
    }
  }

  async function saveContact() {
    setSaving(true);
    const res = await fetch(`/api/crm/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setCustomer((prev) => ({ ...prev, ...data.customer }));
      setEditingContact(false);
    }
  }

  async function saveCompany() {
    setSaving(true);
    const res = await fetch(`/api/crm/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyForm),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setCustomer((prev) => ({ ...prev, ...data.customer }));
      setEditingCompany(false);
    }
  }

  async function saveQuickNote() {
    setSaving(true);
    const res = await fetch(`/api/crm/customers/${customer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: quickNote }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setCustomer((prev) => ({ ...prev, ...data.customer }));
    }
  }

  async function addNote() {
    if (!newNoteBody.trim()) return;
    setSavingNote(true);
    const res = await fetch(`/api/crm/customers/${customer.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: newNoteBody }),
    });
    setSavingNote(false);
    if (res.ok) {
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setNewNoteBody("");
    }
  }

  async function markInvoicePaid(id: string) {
    const res = await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid" }),
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, ...data.invoice } : i));
    }
  }

  async function deleteCustomer() {
    if (!confirm("Poistetaanko asiakas?")) return;
    await fetch(`/api/crm/customers/${customer.id}`, { method: "DELETE" });
    router.push("/crm/asiakkaat");
  }

  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Asiakas";

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge status={customer.status} />
            {(customer.company_name || customer.companies) && (
              <span className="text-sm text-ink-ghost">{customer.company_name || customer.companies?.name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNewQuote(true)} className="flex items-center gap-1.5 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors">
            <Plus size={14} />Uusi tarjous
          </button>
          <button onClick={deleteCustomer} className="p-2 rounded-lg border border-wire text-ink-ghost hover:text-bad hover:border-bad/30 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-wire overflow-x-auto">
        {TABS.map((t) => {
          const count = t.key === "tarjoukset" ? quotes.length
            : t.key === "projektit" ? projects.length
            : t.key === "laskut" ? invoices.length
            : t.key === "maksut" ? payments.length
            : t.key === "tiedostot" && filesLoaded ? files.length
            : t.key === "tehtavat" && tasksLoaded ? tasks.length
            : null;
          return (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t.key ? "border-copper text-copper" : "border-transparent text-ink-ghost hover:text-ink"}`}>
              {t.label}{count != null ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {/* Yhteystiedot */}
      {tab === "yhteystiedot" && (
        <div className="bg-elevated border border-wire rounded-xl p-5 max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">Yhteystiedot</h2>
            {editingContact ? (
              <div className="flex gap-1.5">
                <button onClick={() => setEditingContact(false)} className="p-1.5 rounded-lg border border-wire text-ink-ghost hover:text-ink transition-colors"><X size={13} /></button>
                <button onClick={saveContact} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                  <Check size={12} />{saving ? "..." : "Tallenna"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditingContact(true)} className="flex items-center gap-1 px-2.5 py-1.5 border border-wire rounded-lg text-xs text-ink-ghost hover:text-ink transition-colors">
                <Edit2 size={12} />Muokkaa
              </button>
            )}
          </div>
          {editingContact ? (
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
                    value={(contactForm as Record<string, string>)[key]}
                    onChange={(e) => setContactForm({ ...contactForm, [key]: e.target.value })}
                    className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-ink-ghost mb-1">Tila</label>
                <select value={contactForm.status} onChange={(e) => setContactForm({ ...contactForm, status: e.target.value })}
                  className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors">
                  <option value="active">Aktiivinen</option>
                  <option value="lead">Liidi</option>
                  <option value="inactive">Ei aktiivinen</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-sm">
              {[
                { label: "Sähköposti", value: customer.email },
                { label: "Puhelin", value: customer.phone },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-ink-ghost">{label}</p>
                  <p className="text-ink mt-0.5">{value ?? "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Yrityksen tiedot */}
      {tab === "yritys" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-elevated border border-wire rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">Asiakkaan ilmoittamat tiedot</h2>
              {editingCompany ? (
                <div className="flex gap-1.5">
                  <button onClick={() => setEditingCompany(false)} className="p-1.5 rounded-lg border border-wire text-ink-ghost hover:text-ink transition-colors"><X size={13} /></button>
                  <button onClick={saveCompany} disabled={saving} className="flex items-center gap-1 px-2.5 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                    <Check size={12} />{saving ? "..." : "Tallenna"}
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingCompany(true)} className="flex items-center gap-1 px-2.5 py-1.5 border border-wire rounded-lg text-xs text-ink-ghost hover:text-ink transition-colors">
                  <Edit2 size={12} />Muokkaa
                </button>
              )}
            </div>
            {editingCompany ? (
              <div className="flex flex-col gap-3">
                {[
                  { key: "company_name", label: "Yrityksen nimi" },
                  { key: "y_tunnus", label: "Y-tunnus" },
                  { key: "toimiala", label: "Toimiala" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-ink-ghost mb-1">{label}</label>
                    <input value={(companyForm as Record<string, string>)[key]} onChange={(e) => setCompanyForm({ ...companyForm, [key]: e.target.value })}
                      className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-ink-ghost mb-1">Lisätiedot</label>
                  <textarea value={companyForm.lisatiedot} onChange={(e) => setCompanyForm({ ...companyForm, lisatiedot: e.target.value })} rows={3}
                    className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: "Yrityksen nimi", value: customer.company_name },
                  { label: "Y-tunnus", value: customer.y_tunnus },
                  { label: "Toimiala", value: customer.toimiala },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-ink-ghost">{label}</p>
                    <p className="text-ink mt-0.5">{value ?? "—"}</p>
                  </div>
                ))}
                {customer.lisatiedot && (
                  <div>
                    <p className="text-xs text-ink-ghost">Lisätiedot</p>
                    <p className="text-ink mt-0.5 whitespace-pre-wrap text-xs leading-relaxed">{customer.lisatiedot}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-elevated border border-wire rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">CRM-yritystietue</h2>
              {customer.companies && (
                <Link href={`/crm/yritykset/${customer.companies.id}`} className="flex items-center gap-1 text-xs text-copper hover:text-copper/80 transition-colors">
                  Avaa <ExternalLink size={11} />
                </Link>
              )}
            </div>
            {customer.companies ? (
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: "Nimi", value: customer.companies.name },
                  { label: "Y-tunnus", value: customer.companies.business_id },
                  { label: "Sähköposti", value: customer.companies.email },
                  { label: "Puhelin", value: customer.companies.phone },
                  { label: "Osoite", value: [customer.companies.address, customer.companies.city].filter(Boolean).join(", ") || null },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-ink-ghost">{label}</p>
                    <p className="text-ink mt-0.5">{value ?? "—"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-ghost py-4 text-center">Ei linkitettyä yritystä — hallitse yhdistämistä Asiakkaat-muokkauksesta.</p>
            )}
          </div>
        </div>
      )}

      {/* Muistiinpanot */}
      {tab === "muistiinpanot" && (
        <div className="flex flex-col gap-5 max-w-2xl">
          <div className="bg-elevated border border-wire rounded-xl p-5">
            <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-3">Pikamuistiinpano</h2>
            <textarea value={quickNote} onChange={(e) => setQuickNote(e.target.value)} rows={3}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
            <button onClick={saveQuickNote} disabled={saving} className="mt-2 px-3 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : "Tallenna"}
            </button>
          </div>

          <div className="bg-elevated border border-wire rounded-xl p-5">
            <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider mb-3">Muistiinpanohistoria</h2>
            <div className="flex gap-2 mb-4">
              <input value={newNoteBody} onChange={(e) => setNewNoteBody(e.target.value)} placeholder="Kirjoita uusi muistiinpano..."
                onKeyDown={(e) => { if (e.key === "Enter") addNote(); }}
                className="flex-1 bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
              <button onClick={addNote} disabled={savingNote} className="px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                Lisää
              </button>
            </div>
            {!notesLoaded ? (
              <p className="text-sm text-ink-ghost py-4 text-center">Ladataan...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-ink-ghost py-4 text-center">Ei muistiinpanoja vielä</p>
            ) : (
              <div className="flex flex-col divide-y divide-wire/50">
                {notes.map((n) => (
                  <div key={n.id} className="py-3">
                    <p className="text-sm text-ink whitespace-pre-wrap">{n.body}</p>
                    <p className="text-xs text-ink-ghost mt-1">{new Date(n.created_at).toLocaleString("fi-FI")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tarjoukset */}
      {tab === "tarjoukset" && (
        <div className="flex flex-col gap-2">
          {quotes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-ink-ghost mb-3">Ei tarjouksia vielä</p>
              <button onClick={() => setShowNewQuote(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors">
                <Plus size={14} />Luo ensimmäinen tarjous
              </button>
            </div>
          ) : quotes.map((q) => (
            <Link key={q.id} href={`/portaali/tarjoukset/${q.id}`}
              className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg hover:border-copper/30 transition-colors group">
              <div>
                <p className="text-sm font-medium text-ink group-hover:text-copper transition-colors">{q.title}</p>
                <p className="text-xs text-ink-ghost">{new Date(q.created_at).toLocaleDateString("fi-FI")}</p>
              </div>
              <div className="flex items-center gap-3">
                {q.amount != null && <span className="text-sm text-ink">{q.amount.toLocaleString("fi-FI")} €</span>}
                <Badge status={q.status} />
                <ArrowRight size={13} className="text-ink-ghost group-hover:text-copper transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Projektit */}
      {tab === "projektit" && (
        <div className="flex flex-col gap-2">
          {projects.length === 0 ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ei projekteja — hyväksy tarjous luodaksesi projektin</p>
          ) : projects.map((p) => (
            <Link key={p.id} href={`/portaali/projektit/${p.id}`}
              className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg hover:border-copper/30 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink group-hover:text-copper transition-colors">{p.name}</p>
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
                <ArrowRight size={13} className="text-ink-ghost group-hover:text-copper transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Laskut */}
      {tab === "laskut" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end mb-1">
            <button onClick={() => setShowNewInvoice(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 transition-colors">
              <Plus size={12} />Uusi lasku
            </button>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ei laskuja</p>
          ) : invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">{inv.invoice_number ?? "Lasku"}</p>
                {inv.due_date && <p className="text-xs text-ink-ghost">Eräpäivä: {new Date(inv.due_date).toLocaleDateString("fi-FI")}</p>}
              </div>
              <div className="flex items-center gap-3">
                {inv.amount != null && <span className="text-sm text-ink">{inv.amount.toLocaleString("fi-FI")} €</span>}
                <Badge status={inv.status} />
                {(inv.status === "pending" || inv.status === "sent") && (
                  <button onClick={() => markInvoicePaid(inv.id)}
                    className="px-2.5 py-1 rounded-lg border border-ok/30 text-ok text-xs font-medium hover:bg-ok/10 transition-colors">
                    Merkitse maksetuksi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maksut */}
      {tab === "maksut" && (
        <div className="flex flex-col gap-2">
          {payments.length === 0 ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ei maksuja vielä</p>
          ) : payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">{p.payment_method ?? "Maksu"}</p>
                <p className="text-xs text-ink-ghost">{new Date(p.created_at).toLocaleDateString("fi-FI")}</p>
              </div>
              <div className="flex items-center gap-3">
                {p.amount != null && <span className="text-sm text-ink">{p.amount.toLocaleString("fi-FI")} {(p.currency ?? "eur").toUpperCase()}</span>}
                <Badge status={p.status} />
                {p.receipt_url && (
                  <a href={p.receipt_url} target="_blank" rel="noopener noreferrer" className="text-ink-ghost hover:text-copper transition-colors">
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tiedostot */}
      {tab === "tiedostot" && (
        <div className="flex flex-col gap-2">
          {!filesLoaded ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ladataan...</p>
          ) : files.length === 0 ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ei tiedostoja — lataa tiedostoja asiakkaan projektin sisällä</p>
          ) : files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{f.name}</p>
                <p className="text-xs text-ink-ghost">{f.projects?.name ?? "—"} · {new Date(f.created_at).toLocaleDateString("fi-FI")}</p>
              </div>
              {f.project_id && (
                <Link href={`/portaali/projektit/${f.project_id}`} className="text-ink-ghost hover:text-copper transition-colors shrink-0">
                  <Download size={14} />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tehtävät */}
      {tab === "tehtavat" && (
        <div className="flex flex-col gap-2">
          {!tasksLoaded ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ladataan...</p>
          ) : tasks.length === 0 ? (
            <p className="text-sm text-ink-ghost py-8 text-center">Ei tehtäviä</p>
          ) : tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{t.title}</p>
                <p className="text-xs text-ink-ghost">{t.projects?.name ?? "—"}{t.due_date ? ` · ${new Date(t.due_date).toLocaleDateString("fi-FI")}` : ""}</p>
              </div>
              <Badge status={t.status} labels={TASK_LABELS} />
            </div>
          ))}
        </div>
      )}

      {showNewQuote && (
        <NewQuoteModal
          customerId={customer.id}
          companyId={customer.companies?.id}
          onClose={() => setShowNewQuote(false)}
          onCreated={(q) => {
            setQuotes((prev) => [q, ...prev]);
            setTab("tarjoukset");
          }}
        />
      )}

      {showNewInvoice && (
        <NewInvoiceModal
          customerId={customer.id}
          projects={projects}
          onClose={() => setShowNewInvoice(false)}
          onCreated={(inv) => setInvoices((prev) => [inv, ...prev])}
        />
      )}
    </div>
  );
}

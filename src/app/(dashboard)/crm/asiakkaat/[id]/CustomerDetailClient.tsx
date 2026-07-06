"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RevealSection } from "@/components/shared/RevealSection";
import { NewQuoteModal } from "./NewQuoteModal";
import { NewInvoiceModal } from "./NewInvoiceModal";
import { ContactTab } from "./tabs/ContactTab";
import { CompanyTab } from "./tabs/CompanyTab";
import { NotesTab } from "./tabs/NotesTab";
import { QuotesTab } from "./tabs/QuotesTab";
import { LeadRequestsTab } from "./tabs/LeadRequestsTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { InvoicesTab } from "./tabs/InvoicesTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { FilesTab } from "./tabs/FilesTab";
import { TasksTab } from "./tabs/TasksTab";
import type {
  Customer,
  Quote,
  Project,
  Invoice,
  Payment,
  LeadRequest,
  CustomerNote,
  CustomerFile,
  CustomerTask,
} from "./types";

const TABS = [
  { key: "yhteystiedot", label: "Yhteystiedot" },
  { key: "yritys", label: "Yrityksen tiedot" },
  { key: "muistiinpanot", label: "Muistiinpanot" },
  { key: "tarjoukset", label: "Tarjoukset" },
  { key: "tarjouspyynnot", label: "Tarjouspyynnöt" },
  { key: "projektit", label: "Projektit" },
  { key: "laskut", label: "Laskut" },
  { key: "maksut", label: "Maksut" },
  { key: "tiedostot", label: "Tiedostot" },
  { key: "tehtavat", label: "Tehtävät" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

interface Props {
  customer: Customer;
  quotes: Quote[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  leadRequests: LeadRequest[];
  canModerate: boolean;
}

export function CustomerDetailClient({
  customer: initial,
  quotes: initialQuotes,
  projects,
  invoices: initialInvoices,
  payments,
  leadRequests: initialLeadRequests,
  canModerate,
}: Props) {
  const [customer, setCustomer] = useState(initial);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [leadRequests, setLeadRequests] = useState(initialLeadRequests);
  const [tab, setTab] = useState<TabKey>("yhteystiedot");
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const router = useRouter();

  const [editingContact, setEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    first_name: initial.first_name ?? "",
    last_name: initial.last_name ?? "",
    email: initial.email ?? "",
    phone: initial.phone ?? "",
    status: initial.status,
  });

  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    company_name: initial.company_name ?? "",
    y_tunnus: initial.y_tunnus ?? "",
    toimiala: initial.toimiala ?? "",
    lisatiedot: initial.lisatiedot ?? "",
  });

  const [quickNote, setQuickNote] = useState(initial.notes ?? "");
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNoteBody, setNewNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const [filesLoaded, setFilesLoaded] = useState(false);
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasks, setTasks] = useState<CustomerTask[]>([]);

  const [saving, setSaving] = useState(false);

  function switchTab(t: TabKey) {
    setTab(t);
    if (t === "muistiinpanot" && !notesLoaded) {
      fetch(`/api/crm/customers/${customer.id}/notes`)
        .then((r) => r.json())
        .then((d) => {
          setNotes(d.notes ?? []);
          setNotesLoaded(true);
        });
    }
    if (t === "tiedostot" && !filesLoaded) {
      fetch(`/api/files?customer_id=${customer.id}`)
        .then((r) => r.json())
        .then((d) => {
          setFiles(d.files ?? []);
          setFilesLoaded(true);
        });
    }
    if (t === "tehtavat" && !tasksLoaded) {
      fetch(`/api/tasks?customer_id=${customer.id}`)
        .then((r) => r.json())
        .then((d) => {
          setTasks(d.tasks ?? []);
          setTasksLoaded(true);
        });
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

  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  async function deleteNote(noteId: string) {
    const res = await fetch(`/api/crm/customers/${customer.id}/notes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }

  const [leadRequestToDelete, setLeadRequestToDelete] = useState<string | null>(
    null,
  );

  async function deleteLeadRequest(id: string) {
    const res = await fetch("/api/crm/lead-requests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    setLeadRequests((prev) => prev.filter((r) => r.id !== id));
  }

  async function markInvoicePaid(id: string) {
    const res = await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "paid" }),
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data.invoice } : i)),
      );
    }
  }

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  async function deleteInvoice(id: string) {
    const res = await fetch("/api/invoices", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }

  const [showDeleteAllInvoices, setShowDeleteAllInvoices] = useState(false);

  async function deleteAllInvoices() {
    const results = await Promise.all(
      invoices.map(async (i) => {
        const res = await fetch("/api/invoices", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: i.id }),
        });
        return { id: i.id, ok: res.ok };
      }),
    );
    const deletedIds = new Set(results.filter((r) => r.ok).map((r) => r.id));
    setInvoices((prev) => prev.filter((i) => !deletedIds.has(i.id)));
    if (deletedIds.size < results.length) {
      throw new Error("Osaa laskuista ei voitu poistaa");
    }
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function deleteCustomer() {
    const res = await fetch(`/api/crm/customers/${customer.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Poisto epäonnistui");
    }
    router.push("/crm/asiakkaat");
  }

  const name =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    customer.email ||
    "Asiakas";

  const counts: Partial<Record<TabKey, number>> = {
    tarjoukset: quotes.length,
    tarjouspyynnot: leadRequests.length,
    projektit: projects.length,
    laskut: invoices.length,
    maksut: payments.length,
    ...(filesLoaded ? { tiedostot: files.length } : {}),
    ...(tasksLoaded ? { tehtavat: tasks.length } : {}),
  };

  return (
    <RevealSection className="max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ink">{name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={customer.status} />
            {(customer.company_name || customer.companies) && (
              <span className="text-sm text-ink-ghost">
                {customer.company_name || customer.companies?.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewQuote(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors"
          >
            <Plus size={14} />
            Uusi tarjous
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg border border-wire text-ink-ghost hover:text-bad hover:border-bad/30 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-wire overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-3.5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${tab === t.key ? "border-copper text-copper" : "border-transparent text-ink-ghost hover:text-ink"}`}
          >
            {t.label}
            {counts[t.key] != null ? ` (${counts[t.key]})` : ""}
          </button>
        ))}
      </div>

      {tab === "yhteystiedot" && (
        <ContactTab
          email={customer.email}
          phone={customer.phone}
          editing={editingContact}
          form={contactForm}
          saving={saving}
          onEdit={() => setEditingContact(true)}
          onCancel={() => setEditingContact(false)}
          onSave={saveContact}
          onFormChange={setContactForm}
        />
      )}

      {tab === "yritys" && (
        <CompanyTab
          companyName={customer.company_name}
          yTunnus={customer.y_tunnus}
          toimiala={customer.toimiala}
          lisatiedot={customer.lisatiedot}
          linkedCompany={customer.companies}
          editing={editingCompany}
          form={companyForm}
          saving={saving}
          onEdit={() => setEditingCompany(true)}
          onCancel={() => setEditingCompany(false)}
          onSave={saveCompany}
          onFormChange={setCompanyForm}
        />
      )}

      {tab === "muistiinpanot" && (
        <NotesTab
          quickNote={quickNote}
          onQuickNoteChange={setQuickNote}
          onSaveQuickNote={saveQuickNote}
          saving={saving}
          notesLoaded={notesLoaded}
          notes={notes}
          newNoteBody={newNoteBody}
          onNewNoteBodyChange={setNewNoteBody}
          onAddNote={addNote}
          savingNote={savingNote}
          onDeleteNote={(id) => setNoteToDelete(id)}
        />
      )}

      {tab === "tarjoukset" && (
        <QuotesTab quotes={quotes} onNewQuote={() => setShowNewQuote(true)} />
      )}

      {tab === "tarjouspyynnot" && (
        <LeadRequestsTab
          leadRequests={leadRequests}
          onDelete={(id) => setLeadRequestToDelete(id)}
        />
      )}

      {tab === "projektit" && <ProjectsTab projects={projects} />}

      {tab === "laskut" && (
        <InvoicesTab
          invoices={invoices}
          canModerate={canModerate}
          onNewInvoice={() => setShowNewInvoice(true)}
          onMarkPaid={markInvoicePaid}
          onEdit={setEditingInvoice}
          onDelete={setInvoiceToDelete}
          onDeleteAll={() => setShowDeleteAllInvoices(true)}
        />
      )}

      {tab === "maksut" && <PaymentsTab payments={payments} />}

      {tab === "tiedostot" && <FilesTab loaded={filesLoaded} files={files} />}

      {tab === "tehtavat" && <TasksTab loaded={tasksLoaded} tasks={tasks} />}

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
          onSaved={(inv) => setInvoices((prev) => [inv, ...prev])}
        />
      )}

      {editingInvoice && (
        <NewInvoiceModal
          customerId={customer.id}
          projects={projects}
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
          onSaved={(inv) => {
            setInvoices((prev) =>
              prev.map((i) => (i.id === inv.id ? { ...i, ...inv } : i)),
            );
            setEditingInvoice(null);
          }}
        />
      )}

      {invoiceToDelete && (
        <ConfirmDialog
          title="Poista lasku"
          message={`Lasku "${invoiceToDelete.invoice_number ?? "Lasku"}" siirretään roskakoriin.`}
          confirmLabel="Poista"
          onClose={() => setInvoiceToDelete(null)}
          onConfirm={() => deleteInvoice(invoiceToDelete.id)}
        />
      )}

      {showDeleteAllInvoices && (
        <ConfirmDialog
          title="Poista kaikki laskut"
          message={`Kaikki ${invoices.length} laskua siirretään roskakoriin. Tätä ei voi kumota tältä näkymältä, mutta laskut voi palauttaa Roskakorista.`}
          confirmLabel="Poista kaikki"
          onClose={() => setShowDeleteAllInvoices(false)}
          onConfirm={deleteAllInvoices}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Siirrä roskakoriin"
          message="Asiakas siirretään roskakoriin yhdessä sen tarjousten, projektien, laskujen ja maksujen kanssa. Vain omistaja voi palauttaa tai poistaa pysyvästi Roskakori-näkymästä."
          confirmLabel="Siirrä roskakoriin"
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={deleteCustomer}
        />
      )}

      {noteToDelete && (
        <ConfirmDialog
          title="Siirrä roskakoriin"
          message="Muistiinpano siirretään roskakoriin."
          confirmLabel="Siirrä roskakoriin"
          onClose={() => setNoteToDelete(null)}
          onConfirm={() => deleteNote(noteToDelete)}
        />
      )}

      {leadRequestToDelete && (
        <ConfirmDialog
          title="Siirrä roskakoriin"
          message="Tarjouspyyntö siirretään roskakoriin."
          confirmLabel="Siirrä roskakoriin"
          onClose={() => setLeadRequestToDelete(null)}
          onConfirm={() => deleteLeadRequest(leadRequestToDelete)}
        />
      )}
    </RevealSection>
  );
}

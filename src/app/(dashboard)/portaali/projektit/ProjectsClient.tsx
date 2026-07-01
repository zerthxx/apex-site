"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, X, Pencil, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  status: string;
  progress_pct: number;
  deadline?: string | null;
  budget?: number | null;
  created_at: string;
  customers?: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null } | null;
}

const STATUS_LABELS: Record<string, string> = {
  planning: "Suunnittelu", development: "Kehitys", testing: "Testaus",
  review: "Katselmus", completed: "Valmis", cancelled: "Peruttu",
};
const STATUS_COLORS: Record<string, string> = {
  planning: "bg-surface text-ink-ghost border-wire",
  development: "bg-copper/10 text-copper border-copper/20",
  testing: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  review: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  completed: "bg-ok/10 text-ok border-ok/20",
  cancelled: "bg-bad/10 text-bad border-bad/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface Customer { id: string; first_name?: string | null; last_name?: string | null; email?: string | null; }
interface StaffMember { id: string; first_name?: string | null; last_name?: string | null; role: string; }

function customerLabel(c: Customer) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || c.id;
}

function ProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project?: Project;
  onClose: () => void;
  onSaved: (p: Project) => void;
}) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    name: project?.name ?? "",
    customer_id: project?.customers?.id ?? "",
    assigned_to: (project as any)?.assigned_to ?? "",
    status: project?.status ?? "planning",
    deadline: project?.deadline ? project.deadline.slice(0, 10) : "",
    budget: project?.budget != null ? String(project.budget) : "",
    progress_pct: project?.progress_pct ?? 0,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/crm/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch(() => {})
      .finally(() => setLoadingCustomers(false));
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => setStaff(d.staff ?? []))
      .catch(() => {})
      .finally(() => setLoadingStaff(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { setError("Nimi vaaditaan"); return; }
    setSaving(true);
    setError("");
    const body = {
      name: form.name,
      customer_id: form.customer_id || null,
      status: form.status,
      budget: form.budget ? parseFloat(form.budget) : null,
      deadline: form.deadline || null,
      progress_pct: form.progress_pct,
      assigned_to: form.assigned_to || null,
      ...(isEdit ? { id: project!.id } : {}),
    };
    const res = await fetch("/api/projects", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    const selectedCustomer = customers.find((c) => c.id === form.customer_id) ?? null;
    onSaved({ ...data.project, customers: selectedCustomer });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">{isEdit ? "Muokkaa projektia" : "Uusi projekti"}</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Projektin nimi *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Asiakas</label>
            <select value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              disabled={loadingCustomers}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors disabled:opacity-60">
              <option value="">{loadingCustomers ? "Ladataan..." : "Ei asiakasta"}</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{customerLabel(c)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Tila</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
                {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Budjetti (€)</label>
            <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Vastuuhenkilö</label>
            <select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              disabled={loadingStaff}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors disabled:opacity-60">
              <option value="">{loadingStaff ? "Ladataan..." : "Ei vastuuhenkilöä"}</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {[s.first_name, s.last_name].filter(Boolean).join(" ") || s.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Edistyminen — {form.progress_pct}%</label>
            <input type="range" min={0} max={100} value={form.progress_pct}
              onChange={(e) => setForm({ ...form, progress_pct: parseInt(e.target.value) })}
              className="w-full accent-copper" />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : isEdit ? "Tallenna" : "Luo projekti"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Props {
  initial: Project[];
  isStaff: boolean;
}

export function ProjectsClient({ initial, isStaff }: Props) {
  const [projects, setProjects] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function customerName(p: Project) {
    if (!p.customers) return "—";
    return [p.customers.first_name, p.customers.last_name].filter(Boolean).join(" ") || p.customers.email || "—";
  }

  function handleSaved(updated: Project) {
    setProjects((prev) => prev.map((p) => p.id === updated.id ? { ...p, ...updated } : p));
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hae projekteja..."
            className="w-full bg-surface border border-wire rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-ghost outline-none focus:border-copper transition-colors" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
          <option value="all">Kaikki tilat</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {isStaff && (
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors shrink-0">
            <Plus size={15} />Uusi projekti
          </button>
        )}
      </div>

      <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-ink-ghost">
            {search || statusFilter !== "all" ? "Ei hakutuloksia" : "Ei projekteja vielä"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Projekti</th>
                {isStaff && <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden md:table-cell">Asiakas</th>}
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Edistyminen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider">Tila</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wider hidden lg:table-cell">Deadline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-wire/50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{p.name}</span>
                  </td>
                  {isStaff && <td className="px-4 py-3 text-ink-dim hidden md:table-cell">{customerName(p)}</td>}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-surface overflow-hidden">
                        <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${p.progress_pct}%` }} />
                      </div>
                      <span className="text-xs text-ink-ghost tabular-nums">{p.progress_pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-ink-ghost hidden lg:table-cell">
                    {p.deadline ? new Date(p.deadline).toLocaleDateString("fi-FI") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isStaff && (
                        <button onClick={() => setEditProject(p)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-wire text-xs text-ink-ghost hover:text-ink hover:border-copper transition-colors">
                          <Pencil size={12} />Muokkaa
                        </button>
                      )}
                      <Link href={`/portaali/projektit/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-copper/10 border border-copper/20 text-xs font-medium text-copper hover:bg-copper/20 transition-colors">
                        Avaa <ArrowRight size={12} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showNew && (
        <ProjectModal
          onClose={() => setShowNew(false)}
          onSaved={(p) => { setProjects((prev) => [p, ...prev]); setShowNew(false); }}
        />
      )}

      {editProject && (
        <ProjectModal
          project={editProject}
          onClose={() => setEditProject(null)}
          onSaved={(updated) => { handleSaved(updated); setEditProject(null); }}
        />
      )}
    </div>
  );
}

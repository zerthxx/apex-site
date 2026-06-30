"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Upload, Download, Eye, File, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  status: string;
  progress_pct: number;
  deadline?: string | null;
  budget?: number | null;
  description?: string | null;
  created_at: string;
  assigned_to?: string | null;
  customers?: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  quotes?: { id: string; title: string; status: string; amount?: number | null }[] | null;
}

interface Task { id: string; title: string; status: string; priority: string; due_date?: string | null; }
interface ProjectFile {
  id: string; name: string; mime_type?: string | null; size_bytes?: number | null;
  version: number; created_at: string; uploaded_by?: string | null;
}
interface AssignedProfile { id: string; first_name?: string | null; last_name?: string | null; }

const STATUS_LABELS: Record<string, string> = {
  planning: "Suunnittelu", development: "Kehitys", testing: "Testaus",
  review: "Katselmus", completed: "Valmis", cancelled: "Peruttu",
  todo: "Tekemättä", in_progress: "Työn alla", done: "Valmis",
};
const STATUS_COLORS: Record<string, string> = {
  planning: "bg-surface text-ink-ghost border-wire",
  development: "bg-copper/10 text-copper border-copper/20",
  testing: "bg-teal-400/10 text-teal-400 border-teal-400/20",
  review: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  completed: "bg-ok/10 text-ok border-ok/20",
  todo: "bg-surface text-ink-ghost border-wire",
  in_progress: "bg-copper/10 text-copper border-copper/20",
  done: "bg-ok/10 text-ok border-ok/20",
};
const PRIORITY_COLORS: Record<string, string> = {
  low: "text-ink-ghost", medium: "text-copper", high: "text-amber-400", urgent: "text-bad",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", STATUS_COLORS[status] ?? "bg-surface text-ink-ghost border-wire")}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Customer { id: string; first_name?: string | null; last_name?: string | null; email?: string | null; }

const STATUS_LABELS_PROJ: Record<string, string> = {
  planning: "Suunnittelu", development: "Kehitys", testing: "Testaus",
  review: "Katselmus", completed: "Valmis", cancelled: "Peruttu",
};

function EditProjectModal({ project, onClose, onSaved }: { project: Project; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: project.name,
    customer_id: project.customers?.id ?? "",
    status: project.status,
    deadline: project.deadline ? project.deadline.slice(0, 10) : "",
    budget: project.budget != null ? String(project.budget) : "",
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/crm/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch(() => {})
      .finally(() => setLoadingCustomers(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: project.id,
        name: form.name,
        customer_id: form.customer_id || null,
        status: form.status,
        deadline: form.deadline || null,
        budget: form.budget ? parseFloat(form.budget) : null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Muokkaa projektia</h2>
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
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || c.id}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Tila</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
                {Object.entries(STATUS_LABELS_PROJ).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "Tallennetaan..." : "Tallenna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Props {
  project: Project;
  tasks: Task[];
  files: ProjectFile[];
  isStaff: boolean;
  assignedProfile?: AssignedProfile | null;
}

export function ProjectDetailClient({ project: initial, tasks, files: initialFiles, isStaff, assignedProfile }: Props) {
  const [project, setProject] = useState(initial);
  const [progress, setProgress] = useState(initial.progress_pct);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"tasks"|"files"|"info">("info");
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function saveProgress() {
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: project.id, progress_pct: progress }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setProject({ ...project, progress_pct: data.project.progress_pct });
    }
  }

  async function handleUpload(file: File) {
    setUploadError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("project_id", project.id);
    const res = await fetch("/api/files/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setUploadError(data.error ?? "Lataus epäonnistui"); return; }
    setFiles((prev) => [data.file, ...prev]);
  }

  async function downloadFile(fileId: string, fileName: string) {
    const res = await fetch(`/api/files/download/${fileId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank");
  }

  const customerName = project.customers
    ? [project.customers.first_name, project.customers.last_name].filter(Boolean).join(" ") || project.customers.email
    : null;

  const assigneeName = assignedProfile
    ? [assignedProfile.first_name, assignedProfile.last_name].filter(Boolean).join(" ") || "—"
    : null;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge status={project.status} />
              {customerName && (
                isStaff && project.customers?.id
                  ? <Link href={`/crm/asiakkaat/${project.customers.id}`} className="text-sm text-copper hover:underline">{customerName}</Link>
                  : <span className="text-sm text-ink-ghost">{customerName}</span>
              )}
              {!customerName && isStaff && (
                <span className="text-sm text-ink-ghost">Ei asiakasta</span>
              )}
              {assigneeName && (
                <span className="text-xs px-2 py-0.5 rounded-md border border-wire bg-surface text-ink-ghost">
                  {assigneeName}
                </span>
              )}
            </div>
          </div>
          {isStaff && (
            <button onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-wire text-xs text-ink-ghost hover:text-ink hover:border-copper transition-colors shrink-0">
              <Pencil size={13} />Muokkaa
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4 bg-elevated border border-wire rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink">Edistyminen</span>
            <span className="text-sm font-bold text-copper tabular-nums">{isStaff ? progress : project.progress_pct}%</span>
          </div>
          {isStaff ? (
            <div className="flex items-center gap-3">
              <input
                type="range" min={0} max={100} value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="flex-1 accent-copper"
              />
              {progress !== project.progress_pct && (
                <button onClick={saveProgress} disabled={saving}
                  className="px-3 py-1 rounded-lg bg-copper text-white text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
                  {saving ? "..." : "Tallenna"}
                </button>
              )}
            </div>
          ) : (
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <div className="h-full bg-copper rounded-full transition-all" style={{ width: `${project.progress_pct}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-wire">
        {(["info","tasks","files"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === t ? "border-copper text-copper" : "border-transparent text-ink-ghost hover:text-ink"
            )}>
            {t === "info" ? "Tiedot" : t === "tasks" ? `Tehtävät (${tasks.length})` : `Tiedostot (${files.length})`}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="bg-elevated border border-wire rounded-xl p-5">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {[
              {
                label: "Asiakas",
                value: customerName,
                link: isStaff && project.customers?.id ? `/crm/asiakkaat/${project.customers.id}` : null,
                alwaysShow: true,
              },
              { label: "Vastuuhenkilö", value: assigneeName, link: null, alwaysShow: isStaff },
              { label: "Budjetti", value: project.budget != null ? `${project.budget.toLocaleString("fi-FI")} €` : null, link: null, alwaysShow: true },
              { label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString("fi-FI") : null, link: null, alwaysShow: true },
              { label: "Luotu", value: new Date(project.created_at).toLocaleDateString("fi-FI"), link: null, alwaysShow: true },
            ].filter(({ value, alwaysShow }) => alwaysShow || value).map(({ label, value, link }) => (
              <div key={label}>
                <dt className="text-xs text-ink-ghost">{label}</dt>
                <dd className="text-ink mt-0.5">
                  {value
                    ? link
                      ? <Link href={link} className="text-copper hover:underline">{value}</Link>
                      : value
                    : "—"}
                </dd>
              </div>
            ))}
          </dl>
          {project.description && (
            <div className="mt-4 pt-4 border-t border-wire">
              <p className="text-xs text-ink-ghost mb-1">Kuvaus</p>
              <p className="text-sm text-ink">{project.description}</p>
            </div>
          )}
          {project.quotes && project.quotes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-wire">
              <p className="text-xs text-ink-ghost mb-2">Liitetty tarjous</p>
              {project.quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between">
                  <Link href={`/portaali/tarjoukset/${q.id}`} className="text-sm text-copper hover:underline">{q.title}</Link>
                  {q.amount != null && <span className="text-sm text-ink-dim">{q.amount.toLocaleString("fi-FI")} €</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "tasks" && (
        <div className="flex flex-col gap-2">
          {tasks.length === 0 ? (
            <div className="bg-elevated border border-wire rounded-xl py-10 text-center text-sm text-ink-ghost">Ei tehtäviä</div>
          ) : tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">{t.title}</p>
                {t.due_date && <p className="text-xs text-ink-ghost">{new Date(t.due_date).toLocaleDateString("fi-FI")}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium", PRIORITY_COLORS[t.priority])}>
                  {t.priority.toUpperCase()}
                </span>
                <Badge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "files" && (
        <div className="flex flex-col gap-3">
          {/* Upload area — staff only */}
          {isStaff && (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                uploading ? "border-copper/40 bg-copper/5" : "border-wire hover:border-copper/40 hover:bg-copper/5"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleUpload(f);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }}
              />
              <Upload size={20} className={cn("mx-auto mb-2", uploading ? "text-copper animate-pulse" : "text-ink-ghost")} />
              <p className="text-sm font-medium text-ink">
                {uploading ? "Ladataan..." : "Lataa tiedosto"}
              </p>
              <p className="text-xs text-ink-ghost mt-0.5">Klikkaa tai raahaa tiedosto tähän</p>
              {uploadError && <p className="text-xs text-bad mt-2">{uploadError}</p>}
            </div>
          )}

          {files.length === 0 ? (
            <div className="bg-elevated border border-wire rounded-xl py-10 text-center text-sm text-ink-ghost">Ei tiedostoja</div>
          ) : (
            <div className="bg-elevated border border-wire rounded-xl overflow-hidden">
              {files.map((f, i) => {
                const isImage = f.mime_type?.startsWith("image/");
                const isPDF = f.mime_type === "application/pdf";
                return (
                  <div key={f.id} className={cn("flex items-center gap-3 px-4 py-3 hover:bg-surface/30 transition-colors", i > 0 && "border-t border-wire/50")}>
                    <div className="w-8 h-8 rounded-lg bg-surface border border-wire flex items-center justify-center shrink-0">
                      <File size={14} className="text-ink-ghost" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{f.name}</p>
                      <p className="text-xs text-ink-ghost">
                        {formatBytes(f.size_bytes)} · v{f.version} · {new Date(f.created_at).toLocaleDateString("fi-FI")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(isImage || isPDF) && (
                        <button onClick={() => downloadFile(f.id, f.name)}
                          className="p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-wire text-ink-ghost hover:text-ink transition-colors"
                          title="Esikatsele">
                          <Eye size={13} />
                        </button>
                      )}
                      <button onClick={() => downloadFile(f.id, f.name)}
                        className="p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-wire text-ink-ghost hover:text-ink transition-colors"
                        title="Lataa">
                        <Download size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showEdit && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSaved={() => window.location.reload()}
        />
      )}
    </div>
  );
}

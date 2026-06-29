"use client";

import { useState } from "react";
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
  customers?: { id: string; first_name?: string | null; last_name?: string | null; email?: string | null } | null;
  quotes?: { id: string; title: string; status: string; amount?: number | null }[] | null;
}

interface Task { id: string; title: string; status: string; priority: string; due_date?: string | null; }
interface ProjectFile { id: string; name: string; mime_type?: string | null; size_bytes?: number | null; version: number; created_at: string; }

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

interface Props {
  project: Project;
  tasks: Task[];
  files: ProjectFile[];
  isStaff: boolean;
}

export function ProjectDetailClient({ project: initial, tasks, files, isStaff }: Props) {
  const [project, setProject] = useState(initial);
  const [progress, setProgress] = useState(initial.progress_pct);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"tasks"|"files"|"info">("info");

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

  const customerName = project.customers
    ? [project.customers.first_name, project.customers.last_name].filter(Boolean).join(" ") || project.customers.email
    : null;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={project.status} />
              {customerName && <span className="text-sm text-ink-ghost">{customerName}</span>}
            </div>
          </div>
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
                type="range"
                min={0}
                max={100}
                value={progress}
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
              { label: "Asiakas", value: customerName },
              { label: "Budjetti", value: project.budget != null ? `${project.budget.toLocaleString("fi-FI")} €` : null },
              { label: "Deadline", value: project.deadline ? new Date(project.deadline).toLocaleDateString("fi-FI") : null },
              { label: "Luotu", value: new Date(project.created_at).toLocaleDateString("fi-FI") },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs text-ink-ghost">{label}</dt>
                <dd className="text-ink mt-0.5">{value ?? "—"}</dd>
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
                  <span className="text-sm text-ink">{q.title}</span>
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
        <div className="flex flex-col gap-2">
          {files.length === 0 ? (
            <div className="bg-elevated border border-wire rounded-xl py-10 text-center text-sm text-ink-ghost">Ei tiedostoja</div>
          ) : files.map((f) => (
            <div key={f.id} className="flex items-center justify-between p-3 bg-elevated border border-wire rounded-lg">
              <div>
                <p className="text-sm font-medium text-ink">{f.name}</p>
                <p className="text-xs text-ink-ghost">{formatBytes(f.size_bytes)} · v{f.version} · {new Date(f.created_at).toLocaleDateString("fi-FI")}</p>
              </div>
              <span className="text-xs text-ink-ghost">{f.mime_type?.split("/")[1]?.toUpperCase() ?? "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

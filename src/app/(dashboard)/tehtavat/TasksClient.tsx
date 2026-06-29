"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: string;
  status: string;
  assigned_to?: string | null;
  projects?: { id: string; name: string } | null;
}

const COLUMNS = [
  { id: "todo", label: "Tekemättä" },
  { id: "in_progress", label: "Työn alla" },
  { id: "review", label: "Katselmus" },
  { id: "done", label: "Valmis" },
] as const;

const PRIORITY_LABELS: Record<string, string> = { low: "Matala", medium: "Normaali", high: "Korkea", urgent: "Kiireellinen" };
const PRIORITY_COLORS: Record<string, string> = {
  low: "text-ink-ghost border-wire bg-surface",
  medium: "text-copper border-copper/30 bg-copper/5",
  high: "text-amber-400 border-amber-400/30 bg-amber-400/5",
  urgent: "text-bad border-bad/30 bg-bad/5",
};

function NewTaskModal({ onClose, onCreated }: { onClose: () => void; onCreated: (t: Task) => void }) {
  const [form, setForm] = useState({ title: "", description: "", due_date: "", priority: "medium", status: "todo" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) { setError("Otsikko vaaditaan"); return; }
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, due_date: form.due_date || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onCreated(data.task);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Uusi tehtävä</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={17} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Otsikko *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Kuvaus</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-ink-ghost mb-1">Prioriteetti</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors">
                <option value="low">Matala</option>
                <option value="medium">Normaali</option>
                <option value="high">Korkea</option>
                <option value="urgent">Kiireellinen</option>
              </select>
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
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "..." : "Luo tehtävä"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard({ task, onMove }: { task: Task; onMove: (id: string, status: string) => void }) {
  const nextStatus = COLUMNS[COLUMNS.findIndex((c) => c.id === task.status) + 1]?.id;
  return (
    <div className="bg-surface border border-wire rounded-lg p-3 flex flex-col gap-2">
      <p className="text-sm font-medium text-ink leading-snug">{task.title}</p>
      {task.description && <p className="text-xs text-ink-ghost line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between mt-1">
        <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border", PRIORITY_COLORS[task.priority])}>
          {PRIORITY_LABELS[task.priority]}
        </span>
        {task.due_date && (
          <span className="text-[10px] text-ink-ghost">{new Date(task.due_date).toLocaleDateString("fi-FI")}</span>
        )}
      </div>
      {nextStatus && (
        <button
          onClick={() => onMove(task.id, nextStatus)}
          className="w-full text-xs text-ink-ghost hover:text-ink py-1 rounded hover:bg-elevated transition-colors text-left px-1"
        >
          → {COLUMNS.find((c) => c.id === nextStatus)?.label}
        </button>
      )}
    </div>
  );
}

export function TasksClient({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [filterMine, setFilterMine] = useState(false);

  async function moveTask(id: string, status: string) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  const visible = filterMine ? tasks.filter((t) => t.assigned_to) : tasks;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <label className="flex items-center gap-2 text-sm text-ink-ghost cursor-pointer">
          <input type="checkbox" checked={filterMine} onChange={(e) => setFilterMine(e.target.checked)} className="accent-copper" />
          Vain omat tehtävät
        </label>
        <div className="flex-1" />
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors">
          <Plus size={15} />Uusi tehtävä
        </button>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = visible.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="bg-elevated border border-wire rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">{col.label}</h3>
                <span className="text-xs text-ink-ghost bg-surface border border-wire px-1.5 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {colTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onMove={moveTask} />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-xs text-ink-ghost text-center py-4 border border-dashed border-wire rounded-lg">
                    Tyhjä
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NewTaskModal
          onClose={() => setShowModal(false)}
          onCreated={(t) => setTasks((prev) => [t, ...prev])}
        />
      )}
    </div>
  );
}

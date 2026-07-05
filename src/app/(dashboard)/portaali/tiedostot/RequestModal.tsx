"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { FileRequest, Project } from "./types";

export function RequestModal({
  project,
  onClose,
  onCreated,
}: {
  project: Project;
  onClose: () => void;
  onCreated: (req: FileRequest) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Otsikko vaaditaan");
      return;
    }
    if (!project.customer_id) {
      setError("Projektilla ei ole asiakasta");
      return;
    }
    setSaving(true);
    setError("");

    const res = await fetch("/api/files/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.id,
        customer_id: project.customer_id,
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Virhe");
      setSaving(false);
      return;
    }
    onCreated(data.request);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">Pyydä tiedostoja</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-ghost mb-1">
              Mitä tarvitset? *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="esim. Yrityksen logo PNG-muodossa"
              className="w-full px-3 py-2 rounded-lg bg-surface border border-wire text-sm text-ink placeholder:text-ink-ghost focus:outline-none focus:border-copper/60"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-ghost mb-1">
              Lisätiedot
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tarkemmat ohjeet tai vaatimukset..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-wire text-sm text-ink placeholder:text-ink-ghost focus:outline-none focus:border-copper/60 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-ghost mb-1">
              Määräpäivä
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-wire text-sm text-ink focus:outline-none focus:border-copper/60"
            />
          </div>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors"
            >
              Peruuta
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Lähetetään..." : "Lähetä pyyntö"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, Mail } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  updated_at: string;
}

function TemplateModal({
  template,
  onClose,
  onSaved,
}: {
  template: Template | null;
  onClose: () => void;
  onSaved: (t: Template) => void;
}) {
  const [form, setForm] = useState({
    name: template?.name ?? "",
    subject: template?.subject ?? "",
    body: template?.body ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.subject || !form.body) { setError("Kaikki kentät vaaditaan"); return; }
    setSaving(true);
    const res = await fetch("/api/admin/templates", {
      method: template ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template ? { id: template.id, ...form } : form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Virhe"); return; }
    onSaved(template ? { ...template, ...form } : data.template);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl mx-4 bg-elevated border border-wire rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-ink">{template ? "Muokkaa pohjaa" : "Uusi sähköpostipohja"}</h2>
          <button onClick={onClose} className="text-ink-ghost hover:text-ink"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Nimi *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="esim. Tervetuloa-sähköposti"
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Aiherivi *</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="esim. Tervetuloa {{name}}!"
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors" />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Sisältö *</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8}
              placeholder="Hei {{name}}, tervetuloa..."
              className="w-full bg-surface border border-wire rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-copper transition-colors resize-none font-mono" />
          </div>
          <p className="text-xs text-ink-ghost">Käytä {"{{nimi}}"} muuttujia sisällössä.</p>
          {error && <p className="text-xs text-bad">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-wire text-sm text-ink-ghost hover:text-ink transition-colors">Peruuta</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors">
              {saving ? "..." : template ? "Tallenna" : "Luo pohja"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TemplatesClient({ initial }: { initial: Template[] }) {
  const [templates, setTemplates] = useState(initial);
  const [editing, setEditing] = useState<Template | null | false>(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Poista pohja?")) return;
    setDeleting(id);
    await fetch("/api/admin/templates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  }

  function onSaved(t: Template) {
    setTemplates((prev) => {
      const idx = prev.findIndex((x) => x.id === t.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = t; return next; }
      return [t, ...prev];
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(null)}
          className="flex items-center gap-2 px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper/90 transition-colors">
          <Plus size={15} /> Uusi pohja
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-wire bg-elevated">
          <Mail size={28} className="text-ink-ghost mb-3" />
          <p className="text-sm text-ink-ghost">Ei sähköpostipohjia. Luo ensimmäinen yllä.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((t) => (
            <div key={t.id} className="flex items-start gap-3 p-4 bg-elevated border border-wire rounded-xl group">
              <div className="w-8 h-8 rounded-lg bg-surface border border-wire flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={14} className="text-copper" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{t.name}</p>
                <p className="text-xs text-ink-ghost mt-0.5 truncate">{t.subject}</p>
                <p className="text-xs text-ink-ghost mt-1 line-clamp-2 font-mono">{t.body}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => setEditing(t)} className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-ink transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => remove(t.id)} disabled={deleting === t.id} className="p-1.5 rounded hover:bg-surface text-ink-ghost hover:text-bad transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== false && (
        <TemplateModal
          template={editing}
          onClose={() => setEditing(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

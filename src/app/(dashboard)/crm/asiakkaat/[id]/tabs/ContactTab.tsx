"use client";

import { Edit2, Check, X } from "lucide-react";

interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
}

export function ContactTab({
  email,
  phone,
  editing,
  form,
  saving,
  onEdit,
  onCancel,
  onSave,
  onFormChange,
}: {
  email?: string | null;
  phone?: string | null;
  editing: boolean;
  form: ContactForm;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFormChange: (form: ContactForm) => void;
}) {
  return (
    <div className="bg-elevated border border-wire rounded-xl p-5 max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">
          Yhteystiedot
        </h2>
        {editing ? (
          <div className="flex gap-1.5">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg border border-wire text-ink-ghost hover:text-ink transition-colors"
            >
              <X size={13} />
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-copper text-white rounded-lg text-xs font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors"
            >
              <Check size={12} />
              {saving ? "..." : "Tallenna"}
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-wire rounded-lg text-xs text-ink-ghost hover:text-ink transition-colors"
          >
            <Edit2 size={12} />
            Muokkaa
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex flex-col gap-3">
          {(
            [
              { key: "first_name", label: "Etunimi" },
              { key: "last_name", label: "Sukunimi" },
              { key: "email", label: "Sähköposti" },
              { key: "phone", label: "Puhelin" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-ink-ghost mb-1">
                {label}
              </label>
              <input
                value={form[key]}
                onChange={(e) =>
                  onFormChange({ ...form, [key]: e.target.value })
                }
                className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Tila</label>
            <select
              value={form.status}
              onChange={(e) =>
                onFormChange({ ...form, status: e.target.value })
              }
              className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors"
            >
              <option value="active">Aktiivinen</option>
              <option value="lead">Liidi</option>
              <option value="inactive">Ei aktiivinen</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 text-sm">
          {[
            { label: "Sähköposti", value: email },
            { label: "Puhelin", value: phone },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-ink-ghost">{label}</p>
              <p className="text-ink mt-0.5">{value ?? "—"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

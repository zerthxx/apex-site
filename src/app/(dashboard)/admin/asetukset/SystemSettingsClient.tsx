"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, Save } from "lucide-react";

interface Field {
  key: string;
  label: string;
  type: "text" | "email" | "boolean";
}

export function SystemSettingsClient({
  fields,
  initial,
}: {
  fields: Field[];
  initial: Record<string, unknown>;
}) {
  const initValues = Object.fromEntries(fields.map((f) => [f.key, initial[f.key] ?? (f.type === "boolean" ? false : "")]));
  const [values, setValues] = useState<Record<string, unknown>>(initValues);
  const [saving, setSaving] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; key: string; msg: string } | null>(null);

  function showStatus(type: "success" | "error", key: string, msg: string) {
    setStatus({ type, key, msg });
    setTimeout(() => setStatus(null), 3000);
  }

  async function save(key: string) {
    setSaving(key);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: values[key] }),
    });
    setSaving(null);
    if (res.ok) showStatus("success", key, "Tallennettu");
    else showStatus("error", key, "Virhe tallennuksessa");
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      {fields.map((field) => (
        <div key={field.key} className="bg-elevated border border-wire rounded-xl p-4">
          <div className="flex items-start justify-between gap-3">
            <label className="text-sm font-medium text-ink">{field.label}</label>
            {status?.key === field.key && (
              <div className={`flex items-center gap-1.5 text-xs ${status.type === "success" ? "text-ok" : "text-bad"}`}>
                {status.type === "success" ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {status.msg}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {field.type === "boolean" ? (
              <>
                <button
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, [field.key]: !v[field.key] }))}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${values[field.key] ? "bg-copper" : "bg-wire"}`}
                  role="switch"
                  aria-checked={!!values[field.key]}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${values[field.key] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <span className="text-xs text-ink-ghost">{values[field.key] ? "Käytössä" : "Ei käytössä"}</span>
              </>
            ) : (
              <input
                type={field.type}
                value={String(values[field.key] ?? "")}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-lg bg-surface border border-wire text-ink text-sm outline-none focus:border-copper/50 transition-colors"
              />
            )}
            <button
              onClick={() => save(field.key)}
              disabled={saving === field.key}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-copper text-white text-sm font-medium hover:bg-copper/90 disabled:opacity-50 transition-colors shrink-0"
            >
              <Save size={13} />
              {saving === field.key ? "..." : "Tallenna"}
            </button>
          </div>
          <p className="text-xs text-ink-ghost mt-1 font-mono">{field.key}</p>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { Edit2, Check, X, ExternalLink } from "lucide-react";
import type { Company } from "../types";

interface CompanyForm {
  company_name: string;
  y_tunnus: string;
  toimiala: string;
  lisatiedot: string;
}

export function CompanyTab({
  companyName,
  yTunnus,
  toimiala,
  lisatiedot,
  linkedCompany,
  editing,
  form,
  saving,
  onEdit,
  onCancel,
  onSave,
  onFormChange,
}: {
  companyName?: string | null;
  yTunnus?: string | null;
  toimiala?: string | null;
  lisatiedot?: string | null;
  linkedCompany?: Company | null;
  editing: boolean;
  form: CompanyForm;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onFormChange: (form: CompanyForm) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-elevated border border-wire rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">
            Asiakkaan ilmoittamat tiedot
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
                { key: "company_name", label: "Yrityksen nimi" },
                { key: "y_tunnus", label: "Y-tunnus" },
                { key: "toimiala", label: "Toimiala" },
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
              <label className="block text-xs text-ink-ghost mb-1">
                Lisätiedot
              </label>
              <textarea
                value={form.lisatiedot}
                onChange={(e) =>
                  onFormChange({ ...form, lisatiedot: e.target.value })
                }
                rows={3}
                className="w-full bg-surface border border-wire rounded-lg px-3 py-1.5 text-sm text-ink outline-none focus:border-copper transition-colors resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            {[
              { label: "Yrityksen nimi", value: companyName },
              { label: "Y-tunnus", value: yTunnus },
              { label: "Toimiala", value: toimiala },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-ink-ghost">{label}</p>
                <p className="text-ink mt-0.5">{value ?? "—"}</p>
              </div>
            ))}
            {lisatiedot && (
              <div>
                <p className="text-xs text-ink-ghost">Lisätiedot</p>
                <p className="text-ink mt-0.5 whitespace-pre-wrap text-xs leading-relaxed">
                  {lisatiedot}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-elevated border border-wire rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-ink-ghost uppercase tracking-wider">
            CRM-yritystietue
          </h2>
          {linkedCompany && (
            <Link
              href={`/crm/yritykset/${linkedCompany.id}`}
              className="flex items-center gap-1 text-xs text-copper hover:text-copper/80 transition-colors"
            >
              Avaa <ExternalLink size={11} />
            </Link>
          )}
        </div>
        {linkedCompany ? (
          <div className="flex flex-col gap-3 text-sm">
            {[
              { label: "Nimi", value: linkedCompany.name },
              { label: "Y-tunnus", value: linkedCompany.business_id },
              { label: "Sähköposti", value: linkedCompany.email },
              { label: "Puhelin", value: linkedCompany.phone },
              {
                label: "Osoite",
                value:
                  [linkedCompany.address, linkedCompany.city]
                    .filter(Boolean)
                    .join(", ") || null,
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-ink-ghost">{label}</p>
                <p className="text-ink mt-0.5">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-ghost py-4 text-center">
            Ei linkitettyä yritystä — hallitse yhdistämistä
            Asiakkaat-muokkauksesta.
          </p>
        )}
      </div>
    </div>
  );
}

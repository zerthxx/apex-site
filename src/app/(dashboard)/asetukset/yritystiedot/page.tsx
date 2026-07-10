"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import {
  SettingsButton,
  SettingsField,
  SettingsSection,
  StatusBanner,
  settingsInputClass,
} from "@/components/settings/SettingsKit";
import { companySchema, fieldErrors } from "@/lib/validation";

type CompanyForm = {
  company_name: string;
  y_tunnus: string;
  toimiala: string;
  lisatiedot: string;
};

const EMPTY: CompanyForm = {
  company_name: "",
  y_tunnus: "",
  toimiala: "",
  lisatiedot: "",
};

export default function YritystiedotPage() {
  const [form, setForm] = useState<CompanyForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/account/company-info")
      .then((r) => r.json())
      .then(({ info }) => {
        if (info) {
          setForm({
            company_name: info.company_name ?? "",
            y_tunnus: info.y_tunnus ?? "",
            toimiala: info.toimiala ?? "",
            lisatiedot: info.lisatiedot ?? "",
          });
        }
      })
      .finally(() => setFetching(false));
  }, []);

  function set(key: keyof CompanyForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };
  }

  function validateField(key: keyof CompanyForm) {
    const result = companySchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return;
    }
    const all = fieldErrors(result.error);
    setErrors((prev) => ({ ...prev, [key]: all[key] ?? "" }));
  }

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const result = companySchema.safeParse(form);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      showStatus("error", "Tarkista punaisella merkityt kentät.");
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/account/company-info", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      if (data.fields) setErrors(data.fields);
      showStatus("error", data.error ?? "Tallennus epäonnistui.");
      return;
    }
    showStatus("success", "Yritystiedot tallennettu.");
  }

  if (fetching) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-ink-ghost">
        Ladataan...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {status && <StatusBanner type={status.type} message={status.message} />}

      <SettingsSection
        icon={Building2}
        title="Yritystiedot"
        description="Tiedot näkyvät henkilöstöllemme projektin taustatietona — ne eivät ole julkisia."
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <SettingsField
            label="Yrityksen nimi"
            htmlFor="company_name"
            error={errors.company_name}
            helper="Virallinen nimi kaupparekisterissä."
          >
            <input
              id="company_name"
              type="text"
              value={form.company_name}
              onChange={set("company_name")}
              onBlur={() => validateField("company_name")}
              placeholder="Esimerkki Oy"
              autoComplete="organization"
              className={settingsInputClass}
            />
          </SettingsField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingsField
              label="Y-tunnus"
              htmlFor="y_tunnus"
              error={errors.y_tunnus}
              helper="Muoto 1234567-8 — tarkistamme tarkistusnumeron."
            >
              <input
                id="y_tunnus"
                type="text"
                value={form.y_tunnus}
                onChange={set("y_tunnus")}
                onBlur={() => validateField("y_tunnus")}
                placeholder="1234567-8"
                maxLength={9}
                className={settingsInputClass}
              />
            </SettingsField>
            <SettingsField
              label="Toimiala"
              htmlFor="toimiala"
              error={errors.toimiala}
              helper="Esim. rakennusala, ravintola, verkkokauppa."
            >
              <input
                id="toimiala"
                type="text"
                value={form.toimiala}
                onChange={set("toimiala")}
                onBlur={() => validateField("toimiala")}
                placeholder="Rakennusala"
                className={settingsInputClass}
              />
            </SettingsField>
          </div>

          <SettingsField
            label="Lisätiedot"
            htmlFor="lisatiedot"
            error={errors.lisatiedot}
            helper={`${form.lisatiedot.length} / 5000 merkkiä`}
          >
            <textarea
              id="lisatiedot"
              value={form.lisatiedot}
              onChange={set("lisatiedot")}
              onBlur={() => validateField("lisatiedot")}
              placeholder="Kerro yrityksestäsi, tavoitteistasi ja toiveistasi projektin suhteen…"
              rows={8}
              maxLength={5000}
              className={`${settingsInputClass} resize-y min-h-[160px]`}
            />
          </SettingsField>

          <SettingsButton
            type="submit"
            loading={loading}
            className="w-full mt-1"
          >
            Tallenna yritystiedot
          </SettingsButton>
        </form>
      </SettingsSection>
    </div>
  );
}

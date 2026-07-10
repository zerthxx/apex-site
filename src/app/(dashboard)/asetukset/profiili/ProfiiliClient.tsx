"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Smartphone, User } from "lucide-react";
import {
  SettingsButton,
  SettingsField,
  SettingsSection,
  StatusBanner,
  settingsInputClass,
} from "@/components/settings/SettingsKit";
import { profileSchema, fieldErrors } from "@/lib/validation";

type ProfileForm = {
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
};

export function ProfiiliClient({
  initial,
  email,
  phoneMasked,
  phoneVerified,
}: {
  initial: ProfileForm;
  email: string;
  phoneMasked: string | null;
  phoneVerified: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  function set(key: keyof ProfileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
    };
  }

  /** Validates a single field on blur so errors appear before saving. */
  function validateField(key: keyof ProfileForm) {
    const result = profileSchema.safeParse(form);
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
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      showStatus("error", "Tarkista punaisella merkityt kentät.");
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/account/profile", {
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
    showStatus("success", "Tiedot tallennettu onnistuneesti.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {status && <StatusBanner type={status.type} message={status.message} />}

      <SettingsSection
        icon={User}
        title="Henkilötiedot"
        description={`Kirjautunut osoitteella ${email}`}
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingsField
              label="Etunimi"
              htmlFor="firstName"
              error={errors.firstName}
            >
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                onBlur={() => validateField("firstName")}
                placeholder="Matti"
                autoComplete="given-name"
                className={settingsInputClass}
              />
            </SettingsField>
            <SettingsField
              label="Sukunimi"
              htmlFor="lastName"
              error={errors.lastName}
            >
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                onBlur={() => validateField("lastName")}
                placeholder="Virtanen"
                autoComplete="family-name"
                className={settingsInputClass}
              />
            </SettingsField>
          </div>

          <SettingsField
            label="Katuosoite"
            htmlFor="address"
            error={errors.address}
            helper="Käytetään laskutuksessa ja yhteydenpidossa."
          >
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={set("address")}
              onBlur={() => validateField("address")}
              placeholder="Esimerkkikatu 1 A 2"
              autoComplete="street-address"
              className={settingsInputClass}
            />
          </SettingsField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SettingsField
              label="Postinumero"
              htmlFor="postalCode"
              error={errors.postalCode}
              helper="5 numeroa (Suomi)."
            >
              <input
                id="postalCode"
                type="text"
                inputMode="numeric"
                value={form.postalCode}
                onChange={set("postalCode")}
                onBlur={() => validateField("postalCode")}
                placeholder="00100"
                maxLength={5}
                autoComplete="postal-code"
                className={settingsInputClass}
              />
            </SettingsField>
            <SettingsField label="Kaupunki" htmlFor="city" error={errors.city}>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={set("city")}
                onBlur={() => validateField("city")}
                placeholder="Helsinki"
                autoComplete="address-level2"
                className={settingsInputClass}
              />
            </SettingsField>
          </div>

          <SettingsButton
            type="submit"
            loading={loading}
            className="w-full mt-1"
          >
            Tallenna tiedot
          </SettingsButton>
        </form>
      </SettingsSection>

      <SettingsSection
        icon={Smartphone}
        title="Puhelinnumero"
        description="Puhelinnumeroa hallitaan Turvallisuus-välilehdellä, koska se toimii tilisi palautusnumerona."
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink">{phoneMasked ?? "Ei asetettu"}</span>
            {phoneMasked && phoneVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle size={11} /> Vahvistettu
              </span>
            )}
          </div>
          <Link
            href="/asetukset/turvallisuus"
            className="text-xs text-copper hover:underline shrink-0"
          >
            Hallinnoi turvallisuudessa →
          </Link>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={MapPin}
        title="Yritystiedot"
        description="Yrityksen nimi, Y-tunnus ja muut tiedot löytyvät omalta välilehdeltään."
      >
        <Link
          href="/asetukset/yritystiedot"
          className="text-xs text-copper hover:underline"
        >
          Siirry yritystietoihin →
        </Link>
      </SettingsSection>
    </div>
  );
}

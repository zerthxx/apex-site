"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Mail, MessageSquare, Monitor, Smartphone } from "lucide-react";
import {
  ComingSoonBadge,
  SettingsButton,
  SettingsSection,
  StatusBanner,
  Toggle,
} from "@/components/settings/SettingsKit";

type Prefs = {
  email_projects: boolean;
  email_invoices: boolean;
  email_news: boolean;
  browser_enabled: boolean;
};

const EMAIL_OPTIONS: { key: keyof Prefs; label: string; desc: string }[] = [
  {
    key: "email_projects",
    label: "Projektin päivitykset",
    desc: "Tiedotukset projektisi edistymisestä ja valmistumisesta",
  },
  {
    key: "email_invoices",
    label: "Laskut ja maksut",
    desc: "Laskutusilmoitukset ja maksukuitit",
  },
  {
    key: "email_news",
    label: "Uutiset ja tarjoukset",
    desc: "Apexin uutiset, vinkit ja kampanjat",
  },
];

export default function IlmoituksetPage() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [browserPermission, setBrowserPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");

  useEffect(() => {
    fetch("/api/account/notification-preferences")
      .then((r) => r.json())
      .then(({ preferences }) => {
        setPrefs(preferences);
        setBrowserPermission(
          typeof Notification === "undefined"
            ? "unsupported"
            : Notification.permission,
        );
      })
      .catch(() => setPrefs(null));
  }, []);

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  }

  async function toggleBrowser(next: boolean) {
    if (!prefs) return;
    if (
      next &&
      browserPermission === "default" &&
      typeof Notification !== "undefined"
    ) {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission !== "granted") {
        showStatus(
          "error",
          "Selain esti ilmoitukset — salli ne selaimen asetuksista.",
        );
        return;
      }
    }
    if (next && browserPermission === "denied") {
      showStatus(
        "error",
        "Selain on estänyt ilmoitukset — salli ne selaimen asetuksista.",
      );
      return;
    }
    setPrefs({ ...prefs, browser_enabled: next });
  }

  async function save() {
    if (!prefs) return;
    setLoading(true);
    const res = await fetch("/api/account/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      showStatus("error", data.error ?? "Tallennus epäonnistui.");
      return;
    }
    showStatus("success", "Ilmoitusasetukset tallennettu.");
  }

  if (!prefs) {
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
        icon={Mail}
        title="Sähköposti-ilmoitukset"
        description="Valitse mitkä sähköpostit haluat vastaanottaa."
      >
        <div className="flex flex-col gap-4">
          {EMAIL_OPTIONS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-ink-ghost mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={prefs[key]}
                onChange={(next) => setPrefs({ ...prefs, [key]: next })}
                label={label}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Monitor}
        title="Selainilmoitukset"
        description="Ilmoitukset työpöydälle, kun selain on auki."
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">
              Näytä selainilmoitukset
            </p>
            <p className="text-xs text-ink-ghost mt-0.5">
              {browserPermission === "unsupported"
                ? "Selaimesi ei tue ilmoituksia."
                : browserPermission === "denied"
                  ? "Selain on estänyt ilmoitukset — salli ne selaimen asetuksista."
                  : "Selain kysyy luvan, kun otat ilmoitukset käyttöön."}
            </p>
          </div>
          <Toggle
            checked={prefs.browser_enabled}
            onChange={toggleBrowser}
            disabled={browserPermission === "unsupported"}
            label="Selainilmoitukset"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Bell}
        title="Push-ilmoitukset"
        badge={<ComingSoonBadge />}
        description="Mobiilisovelluksen push-ilmoitukset ovat tulossa myöhemmin."
      >
        <p className="text-xs text-ink-ghost">
          Kun Apex-mobiilisovellus julkaistaan, voit hallita push-ilmoituksia
          tästä.
        </p>
      </SettingsSection>

      <SettingsSection
        icon={Smartphone}
        title="SMS-ilmoitukset"
        badge={<ComingSoonBadge label="Suunnitteilla" />}
        description="Tekstiviesti-ilmoitukset tärkeistä tapahtumista."
      >
        <p className="text-xs text-ink-ghost">
          SMS-ilmoitukset vaativat vahvistetun puhelinnumeron.{" "}
          <Link
            href="/asetukset/turvallisuus"
            className="text-copper hover:underline"
          >
            Vahvista numerosi turvallisuusasetuksissa →
          </Link>
        </p>
      </SettingsSection>

      <div className="flex items-center gap-2">
        <MessageSquare size={13} className="text-ink-ghost shrink-0" />
        <p className="text-[11px] text-ink-ghost">
          Turvallisuusilmoituksia (esim. salasanan vaihto) ei voi poistaa
          käytöstä.
        </p>
      </div>

      <SettingsButton onClick={save} loading={loading} className="w-full">
        Tallenna asetukset
      </SettingsButton>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const OPTIONS = [
  { key: "projects" as const, label: "Projektin päivitykset", desc: "Tiedotukset projektisi edistymisestä ja valmistumisesta" },
  { key: "invoices" as const, label: "Laskut ja maksut", desc: "Laskutusilmoitukset ja maksukuitit" },
  { key: "news" as const, label: "Uutiset ja tarjoukset", desc: "Apexin uutiset, vinkit ja kampanjat" },
];

export default function IlmoituksetPage() {
  const [notifications, setNotifications] = useState({ projects: true, invoices: true, news: false });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const n = data.user?.user_metadata?.notifications;
      if (n) setNotifications(n);
    });
  }, []);

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  }

  async function save() {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { notifications } });
    setLoading(false);
    if (error) showStatus("error", error.message);
    else showStatus("success", "Ilmoitusasetukset tallennettu.");
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {status && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ${
          status.type === "success"
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          {status.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {status.message}
        </div>
      )}
      <p className="text-xs text-ink-ghost">Valitse mitkä sähköposti-ilmoitukset haluat vastaanottaa.</p>
      {OPTIONS.map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">{label}</p>
            <p className="text-xs text-ink-ghost mt-0.5">{desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${notifications[key] ? "bg-copper" : "bg-wire"}`}
            aria-checked={notifications[key]}
            role="switch"
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications[key] ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      ))}
      <button type="button" onClick={save} disabled={loading}
        className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-2">
        {loading ? "Tallennetaan..." : "Tallenna asetukset"}
      </button>
    </div>
  );
}

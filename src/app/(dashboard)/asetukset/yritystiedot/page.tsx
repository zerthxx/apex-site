"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

const inputClass = "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";
const textareaClass = `${inputClass} resize-y min-h-[160px]`;

export default function YritystiedotPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    y_tunnus: "",
    toimiala: "",
    lisatiedot: "",
  });

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

  function setF(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/account/company-info", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) showStatus("success", "Yritystiedot tallennettu.");
    else {
      const body = await res.json().catch(() => ({}));
      showStatus("error", body?.error ?? "Tallennus epäonnistui.");
    }
  }

  if (fetching) {
    return <div className="h-32 flex items-center justify-center text-sm text-ink-ghost">Ladataan...</div>;
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4 max-w-lg">
      <div>
        <h2 className="text-sm font-semibold text-ink mb-0.5">Yritystiedot</h2>
        <p className="text-xs text-ink-ghost">Täydennä yrityksesi tiedot — ne näkyvät henkilöstöllemme projektin taustatietona.</p>
      </div>

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

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-dim">Yrityksen nimi</label>
        <input
          type="text"
          value={form.company_name}
          onChange={setF("company_name")}
          placeholder="Esimerkki Oy"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Y-tunnus</label>
          <input
            type="text"
            value={form.y_tunnus}
            onChange={setF("y_tunnus")}
            placeholder="1234567-8"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Toimiala</label>
          <input
            type="text"
            value={form.toimiala}
            onChange={setF("toimiala")}
            placeholder="esim. Rakennusala"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-medium text-ink-dim">Lisätiedot</label>
          <span className="text-[10px] text-ink-ghost">{form.lisatiedot.length} merkkiä</span>
        </div>
        <textarea
          value={form.lisatiedot}
          onChange={setF("lisatiedot")}
          placeholder="Kerro yrityksestäsi, tavoitteistasi, toiveistasi projektin suhteen tai muista tärkeistä tiedoista..."
          className={textareaClass}
          rows={8}
        />
        <p className="text-[11px] text-ink-ghost">Voit kirjoittaa vapaasti — ei merkkirajoitusta.</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-2"
      >
        {loading ? "Tallennetaan..." : "Tallenna yritystiedot"}
      </button>
    </form>
  );
}

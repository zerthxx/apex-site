"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputClass = "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

export default function ProfiiliPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [profile, setProfile] = useState({
    etunimi: "", sukunimi: "", puhelin: "", osoite: "", postinumero: "", kaupunki: "",
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const m = data.user?.user_metadata ?? {};
      setProfile({
        etunimi: m.first_name ?? "",
        sukunimi: m.last_name ?? "",
        puhelin: m.phone ?? "",
        osoite: m.address ?? "",
        postinumero: m.postal_code ?? "",
        kaupunki: m.city ?? "",
      });
    });
  }, []);

  function setP(key: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  }

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: profile.etunimi,
        last_name: profile.sukunimi,
        full_name: `${profile.etunimi} ${profile.sukunimi}`.trim(),
        phone: profile.puhelin,
        address: profile.osoite,
        postal_code: profile.postinumero,
        city: profile.kaupunki,
      },
    });
    setLoading(false);
    if (error) showStatus("error", error.message);
    else showStatus("success", "Tiedot tallennettu onnistuneesti.");
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4 max-w-lg">
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
      {!profile.puhelin.trim() && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-400/95 border border-amber-500/50">
          <p className="text-sm font-medium text-amber-950">Puhelinnumero puuttuu — lisää se jotta voimme ottaa sinuun yhteyttä.</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Etunimi</label>
          <input type="text" value={profile.etunimi} onChange={setP("etunimi")} placeholder="Matti" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Sukunimi</label>
          <input type="text" value={profile.sukunimi} onChange={setP("sukunimi")} placeholder="Virtanen" className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-dim">Puhelinnumero</label>
        <input type="tel" value={profile.puhelin} onChange={setP("puhelin")} placeholder="+358 40 123 4567" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-dim">Katuosoite</label>
        <input type="text" value={profile.osoite} onChange={setP("osoite")} placeholder="Esimerkkikatu 1 A 2" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Postinumero</label>
          <input type="text" value={profile.postinumero} onChange={setP("postinumero")} placeholder="00100" maxLength={5} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Kaupunki</label>
          <input type="text" value={profile.kaupunki} onChange={setP("kaupunki")} placeholder="Helsinki" className={inputClass} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-2"
      >
        {loading ? "Tallennetaan..." : "Tallenna tiedot"}
      </button>
    </form>
  );
}

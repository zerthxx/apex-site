"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Tab = "tiedot" | "salasana" | "tili";

const inputClass = "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

function StatusBanner({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-4 ${
      type === "success"
        ? "bg-green-500/10 border border-green-500/20 text-green-400"
        : "bg-red-500/10 border border-red-500/20 text-red-400"
    }`}>
      {type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

export default function AsetuksetPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tiedot");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [profile, setProfile] = useState({
    etunimi: "", sukunimi: "", puhelin: "", osoite: "", postinumero: "", kaupunki: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [passwords, setPasswords] = useState({ uusi: "", vahvista: "" });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/"); return; }
      setUser(data.user);
      const m = data.user.user_metadata ?? {};
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
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile(p => ({ ...p, [key]: e.target.value }));
    };
  }

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 4000);
  }

  async function saveTiedot(e: React.FormEvent) {
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

  async function saveSalasana(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.uusi !== passwords.vahvista) {
      showStatus("error", "Salasanat eivät täsmää."); return;
    }
    if (passwords.uusi.length < 8) {
      showStatus("error", "Salasanan tulee olla vähintään 8 merkkiä."); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.uusi });
    setLoading(false);
    if (error) showStatus("error", error.message);
    else {
      showStatus("success", "Salasana vaihdettu. Tarkista sähköpostisi vahvistusviesti.");
      setPasswords({ uusi: "", vahvista: "" });
    }
  }

  async function signOutAll() {
    await supabase.auth.signOut({ scope: "global" });
    router.push("/");
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "tiedot", label: "Omat tiedot", icon: <User size={15} /> },
    { id: "salasana", label: "Salasana", icon: <Lock size={15} /> },
    { id: "tili", label: "Tili", icon: <Shield size={15} /> },
  ];

  const provider = user?.app_metadata?.provider ?? "email";

  return (
    <div className="min-h-screen bg-base py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-ink">Asetukset</h1>
          <p className="text-ink-ghost text-sm mt-1">Hallinnoi tiliäsi ja tietojasi</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface border border-wire rounded-xl p-1 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setStatus(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === t.id
                  ? "bg-elevated text-ink shadow-sm border border-wire"
                  : "text-ink-ghost hover:text-ink-dim"
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-elevated border border-wire rounded-2xl p-6 shadow-sm">
          {status && <StatusBanner type={status.type} message={status.message} />}

          {tab === "tiedot" && (
            <form onSubmit={saveTiedot} className="flex flex-col gap-4">
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
          )}

          {tab === "salasana" && (
            <form onSubmit={saveSalasana} className="flex flex-col gap-4">
              {true ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-wire mb-1">
                    <AlertCircle size={15} className="text-ink-ghost mt-0.5 shrink-0" />
                    <p className="text-xs text-ink-ghost">
                      {provider === "google"
                        ? "Olet kirjautunut Google-tilillä. Voit silti asettaa salasanan jolloin voit kirjautua myös sähköpostilla ja salasanalla."
                        : "Salasanan vaihto lähettää vahvistuslinkin sähköpostiisi."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-ink-dim">Uusi salasana</label>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} value={passwords.uusi} onChange={e => setPasswords(p => ({ ...p, uusi: e.target.value }))} placeholder="Vähintään 8 merkkiä" className={inputClass + " pr-10"} />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-ink-dim">Vahvista uusi salasana</label>
                    <div className="relative">
                      <input type={showPw2 ? "text" : "password"} value={passwords.vahvista} onChange={e => setPasswords(p => ({ ...p, vahvista: e.target.value }))} placeholder="••••••••" className={inputClass + " pr-10"} />
                      <button type="button" onClick={() => setShowPw2(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                        {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !passwords.uusi}
                    className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-2"
                  >
                    {loading ? "Vaihdetaan..." : "Vaihda salasana"}
                  </button>
                </>
              )}
            </form>
          )}

          {tab === "tili" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-ink-dim">Sähköpostiosoite</span>
                  <div className="px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink">{user?.email}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-ink-dim">Kirjautumistapa</span>
                  <div className="px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink capitalize">
                    {provider === "google" ? "Google" : "Sähköposti ja salasana"}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-ink-dim">Tili luotu</span>
                  <div className="px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="border-t border-wire pt-5">
                <p className="text-xs font-medium text-ink-dim mb-3">Vaaravyöhyke</p>
                <button
                  onClick={signOutAll}
                  className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                >
                  Kirjaudu ulos kaikista laitteista
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

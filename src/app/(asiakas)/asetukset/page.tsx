"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Shield, Eye, EyeOff, CheckCircle, AlertCircle, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type Tab = "tiedot" | "salasana" | "ilmoitukset" | "tili";

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

  const [showPw0, setShowPw0] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [passwords, setPasswords] = useState({ nykyinen: "", uusi: "", vahvista: "" });

  const [notifications, setNotifications] = useState({ projects: true, invoices: true, news: false });
  const [notifLoading, setNotifLoading] = useState(false);

  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "done">("idle");
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      if (m.notifications) {
        setNotifications(m.notifications);
      }
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

  function pwStrength(pw: string): { score: number; label: string; color: string } {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: "Heikko", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Kohtalainen", color: "bg-orange-400" };
    if (score <= 3) return { score, label: "Hyvä", color: "bg-yellow-400" };
    return { score, label: "Vahva", color: "bg-green-500" };
  }

  const hasPassword =
    user?.identities?.some(i => i.provider === "email") ||
    user?.user_metadata?.has_password === true;

  async function saveSalasana(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.uusi !== passwords.vahvista) {
      showStatus("error", "Salasanat eivät täsmää."); return;
    }
    const strength = pwStrength(passwords.uusi);
    if (strength.score < 3) {
      showStatus("error", "Salasana on liian heikko. Käytä isoja kirjaimia, numeroita ja erikoismerkkejä."); return;
    }
    if (hasPassword) {
      if (!passwords.nykyinen) {
        showStatus("error", "Syötä nykyinen salasana."); return;
      }
      const { error: reAuthError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: passwords.nykyinen,
      });
      if (reAuthError) {
        showStatus("error", "Nykyinen salasana on väärä.");
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwords.uusi,
      data: { has_password: true },
    });
    setLoading(false);
    if (error) showStatus("error", error.message);
    else {
      showStatus("success", "Salasana vaihdettu onnistuneesti.");
      setPasswords({ nykyinen: "", uusi: "", vahvista: "" });
      setUser(u => u ? { ...u, user_metadata: { ...u.user_metadata, has_password: true } } : u);
    }
  }

  async function saveNotifications() {
    setNotifLoading(true);
    const { error } = await supabase.auth.updateUser({ data: { notifications } });
    setNotifLoading(false);
    if (error) showStatus("error", error.message);
    else showStatus("success", "Ilmoitusasetukset tallennettu.");
  }

  async function signOutAll() {
    await supabase.auth.signOut({ scope: "global" });
    router.push("/");
  }

  async function requestDeletion() {
    setDeleteLoading(true);
    const res = await fetch("/api/account/delete-request", { method: "POST" });
    setDeleteLoading(false);
    if (res.ok) {
      setDeleteStep("done");
    } else {
      showStatus("error", "Pyyntö epäonnistui. Ota yhteyttä suoraan sähköpostilla.");
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "tiedot", label: "Omat tiedot", icon: <User size={15} /> },
    { id: "salasana", label: "Salasana", icon: <Lock size={15} /> },
    { id: "ilmoitukset", label: "Ilmoitukset", icon: <Bell size={15} /> },
    { id: "tili", label: "Tili", icon: <Shield size={15} /> },
  ];

  const provider = user?.app_metadata?.provider ?? "email";

  const notifOptions = [
    { key: "projects" as const, label: "Projektin päivitykset", desc: "Tiedotukset projektisi edistymisestä ja valmistumisesta" },
    { key: "invoices" as const, label: "Laskut ja maksut", desc: "Laskutusilmoitukset ja maksukuitit" },
    { key: "news" as const, label: "Uutiset ja tarjoukset", desc: "Apexin uutiset, vinkit ja kampanjat" },
  ];

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

          {tab === "tiedot" && !profile.puhelin.trim() && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-400/95 border border-amber-500/50 mb-4">
              <p className="text-sm font-medium text-amber-950">
                Puhelinnumero puuttuu — lisää se jotta voimme ottaa sinuun yhteyttä.
              </p>
            </div>
          )}

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
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-wire">
                <AlertCircle size={15} className="text-ink-ghost mt-0.5 shrink-0" />
                <p className="text-xs text-ink-ghost">
                  {provider === "google"
                    ? "Olet kirjautunut Google-tilillä. Voit asettaa salasanan jolloin voit kirjautua myös sähköpostilla."
                    : "Syötä nykyinen salasanasi ja valitse uusi vahva salasana."}
                </p>
              </div>
              {hasPassword && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-ink-dim">Nykyinen salasana</label>
                  <div className="relative">
                    <input type={showPw0 ? "text" : "password"} value={passwords.nykyinen} onChange={e => setPasswords(p => ({ ...p, nykyinen: e.target.value }))} placeholder="••••••••" required className={inputClass + " pr-10"} />
                    <button type="button" onClick={() => setShowPw0(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                      {showPw0 ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-dim">Uusi salasana</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={passwords.uusi} onChange={e => setPasswords(p => ({ ...p, uusi: e.target.value }))} placeholder="Vähintään 8 merkkiä" className={inputClass + " pr-10"} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwords.uusi && (() => {
                  const s = pwStrength(passwords.uusi);
                  return (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className="flex gap-1 h-1.5">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`flex-1 rounded-full transition-colors duration-200 ${i <= s.score ? s.color : "bg-wire"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-ink-ghost">{s.label}</span>
                    </div>
                  );
                })()}
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
            </form>
          )}

          {tab === "ilmoitukset" && (
            <div className="flex flex-col gap-5">
              <p className="text-xs text-ink-ghost">Valitse mitkä sähköposti-ilmoitukset haluat vastaanottaa.</p>
              {notifOptions.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <p className="text-xs text-ink-ghost mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                      notifications[key] ? "bg-copper" : "bg-wire"
                    }`}
                    aria-checked={notifications[key]}
                    role="switch"
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      notifications[key] ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={saveNotifications}
                disabled={notifLoading}
                className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-2"
              >
                {notifLoading ? "Tallennetaan..." : "Tallenna asetukset"}
              </button>
            </div>
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
                  <div className="px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink flex items-center gap-2 flex-wrap">
                    {(() => {
                      const hasGoogle = user?.identities?.some(i => i.provider === "google") ?? false;
                      const hasEmail = hasPassword;
                      return (
                        <>
                          {hasGoogle && (
                            <span className="flex items-center gap-1.5">
                              <svg viewBox="0 0 24 24" width="14" height="14"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                              Google
                            </span>
                          )}
                          {hasGoogle && hasEmail && <span className="text-ink-ghost">+</span>}
                          {hasEmail && (
                            <span className="flex items-center gap-1.5">
                              <Lock size={13} className="text-copper" />
                              Salasana
                            </span>
                          )}
                        </>
                      );
                    })()}
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

              <div className="border-t border-wire pt-5 flex flex-col gap-3">
                <p className="text-xs font-medium text-ink-dim">Vaaravyöhyke</p>
                <button
                  onClick={signOutAll}
                  className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                >
                  Kirjaudu ulos kaikista laitteista
                </button>

                {deleteStep === "idle" && (
                  <button
                    onClick={() => setDeleteStep("confirm")}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                  >
                    Pyydä tilin poistamista
                  </button>
                )}

                {deleteStep === "confirm" && (
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div>
                      <p className="text-sm font-medium text-red-400">Oletko varma?</p>
                      <p className="text-xs text-ink-ghost mt-1">
                        Lähetämme tilinpoistoilmoituksen ylläpidolle. Käsittelemme pyynnön 3 arkipäivän kuluessa ja otamme sinuun yhteyttä ennen poistamista.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteStep("idle")}
                        className="flex-1 py-2 rounded-lg border border-wire text-ink-ghost text-sm hover:text-ink transition-colors"
                      >
                        Peruuta
                      </button>
                      <button
                        onClick={requestDeletion}
                        disabled={deleteLoading}
                        className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-60"
                      >
                        {deleteLoading ? "Lähetetään..." : "Vahvista pyyntö"}
                      </button>
                    </div>
                  </div>
                )}

                {deleteStep === "done" && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    <CheckCircle size={15} />
                    Pyyntö lähetetty. Olemme yhteydessä 3 arkipäivän kuluessa.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

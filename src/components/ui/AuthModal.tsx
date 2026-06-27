"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

const inputClass = "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

export function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    email: "", etunimi: "", sukunimi: "", puhelin: "",
    osoite: "", postinumero: "", postitoimipaikka: "",
    salasana: "", salasana2: "",
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured()) { alert("Supabase ei ole konfiguroitu."); return; }
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (form.salasana !== form.salasana2) { setErr("Salasanat eivät täsmää."); return; }
    if (form.salasana.length < 8) { setErr("Salasanan tulee olla vähintään 8 merkkiä."); return; }
    if (!isSupabaseConfigured()) { alert("Supabase ei ole konfiguroitu."); return; }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.salasana,
      options: {
        data: {
          full_name: `${form.etunimi} ${form.sukunimi}`,
          first_name: form.etunimi,
          last_name: form.sukunimi,
          phone: form.puhelin,
          address: form.osoite,
          postal_code: form.postinumero,
          city: form.postitoimipaikka,
        },
      },
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setSuccess(true);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-elevated border border-wire rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-1 bg-surface rounded-xl p-1 border border-wire">
                  <button
                    onClick={() => { setTab("signin"); setErr(""); setSuccess(false); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${tab === "signin" ? "bg-copper text-[#0A0C10]" : "text-ink-dim hover:text-ink"}`}
                  >
                    Kirjaudu
                  </button>
                  <button
                    onClick={() => { setTab("signup"); setErr(""); setSuccess(false); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${tab === "signup" ? "bg-copper text-[#0A0C10]" : "text-ink-dim hover:text-ink"}`}
                  >
                    Luo tili
                  </button>
                </div>
                <button onClick={onClose} className="text-ink-ghost hover:text-ink transition-colors p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              {tab === "signin" ? (
                <div>
                  <p className="text-ink-ghost text-sm mb-5 leading-relaxed">
                    Kirjaudu Google-tilillä. Kirjautumisen jälkeen vahvistamme puhelinnumerosi SMS-koodilla.
                  </p>
                  <button
                    onClick={signInWithGoogle}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm hover:bg-gray-100 transition-colors duration-150 disabled:opacity-60"
                  >
                    <GoogleIcon />
                    {loading ? "Ohjataan..." : "Jatka Googlella"}
                  </button>
                  <p className="text-xs text-ink-ghost text-center mt-5 leading-relaxed">
                    Kirjautumalla hyväksyt{" "}
                    <a href="/kayttoehdot" className="underline hover:text-ink-dim">käyttöehdot</a>
                    {" "}ja{" "}
                    <a href="/tietosuoja" className="underline hover:text-ink-dim">tietosuojaselosteen</a>.
                  </p>
                </div>
              ) : success ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-green-400">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-ink mb-2">Tili luotu!</h3>
                  <p className="text-ink-ghost text-sm leading-relaxed">
                    Lähetimme vahvistuslinkin sähköpostiisi <span className="text-ink">{form.email}</span>. Avaa linkki aktivoidaksesi tilin.
                  </p>
                  <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors">
                    Sulje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                  <input type="email" placeholder="Sähköposti *" required value={form.email} onChange={set("email")} className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Etunimi *" required value={form.etunimi} onChange={set("etunimi")} className={inputClass} />
                    <input type="text" placeholder="Sukunimi *" required value={form.sukunimi} onChange={set("sukunimi")} className={inputClass} />
                  </div>
                  <input type="tel" placeholder="Puhelinnumero *" required value={form.puhelin} onChange={set("puhelin")} className={inputClass} />
                  <input type="text" placeholder="Katuosoite *" required value={form.osoite} onChange={set("osoite")} className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Postinumero *" required maxLength={5} value={form.postinumero} onChange={set("postinumero")} className={inputClass} />
                    <input type="text" placeholder="Postitoimipaikka *" required value={form.postitoimipaikka} onChange={set("postitoimipaikka")} className={inputClass} />
                  </div>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} placeholder="Salasana *" required value={form.salasana} onChange={set("salasana")} className={inputClass + " pr-10"} />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPw2 ? "text" : "password"} placeholder="Salasana uudelleen *" required value={form.salasana2} onChange={set("salasana2")} className={inputClass + " pr-10"} />
                    <button type="button" onClick={() => setShowPw2(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                      {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {err && <p className="text-red-400 text-xs">{err}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-1"
                  >
                    {loading ? "Luodaan tiliä..." : "Luo tili"}
                  </button>
                  <p className="text-xs text-ink-ghost text-center leading-relaxed">
                    Luomalla tilin hyväksyt{" "}
                    <a href="/kayttoehdot" className="underline hover:text-ink-dim">käyttöehdot</a>
                    {" "}ja{" "}
                    <a href="/tietosuoja" className="underline hover:text-ink-dim">tietosuojaselosteen</a>.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

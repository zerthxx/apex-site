"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, ArrowRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const inputClass = "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

export function ProfileModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState({
    etunimi: "", sukunimi: "", puhelin: "", osoite: "", postinumero: "", kaupunki: "",
  });

  useEffect(() => {
    if (searchParams.get("tiedot") === "1") {
      router.replace("/");
      setOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setSessionReady(true); return; }
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      setSession(sess);
      setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  function setP(key: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile(p => ({ ...p, [key]: e.target.value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) return;
    if (!session) { setErr("Istunto puuttuu — kirjaudu ensin sisään."); return; }
    setLoading(true);
    setErr("");
    const supabase = createClient();
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
    if (error) { setErr(error.message); return; }
    sessionStorage.removeItem("intro-seen");
    setOpen(false);
    router.replace("/");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-sm px-4"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-elevated border border-wire rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper">
                  <User size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-ink">Täydennä tietosi</h2>
                  <p className="text-ink-ghost text-xs">Tarvitsemme muutaman perustiedon</p>
                </div>
              </div>

              {!sessionReady ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
                </div>
              ) : !session ? (
                <div className="py-4 text-center">
                  <p className="text-red-400 text-sm mb-3">Istunto puuttuu — kirjaudu ensin sisään.</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface border border-wire text-sm text-ink-dim hover:text-ink transition-colors"
                  >
                    Sulje
                  </button>
                </div>
              ) : (
                <form onSubmit={save} className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Etunimi *" required value={profile.etunimi} onChange={setP("etunimi")} className={inputClass} />
                    <input type="text" placeholder="Sukunimi *" required value={profile.sukunimi} onChange={setP("sukunimi")} className={inputClass} />
                  </div>
                  <input type="tel" placeholder="Puhelinnumero * (+358...)" required value={profile.puhelin} onChange={setP("puhelin")} className={inputClass} />
                  <input type="text" placeholder="Katuosoite *" required value={profile.osoite} onChange={setP("osoite")} className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Postinumero *" required maxLength={5} value={profile.postinumero} onChange={setP("postinumero")} className={inputClass} />
                    <input type="text" placeholder="Kaupunki *" required value={profile.kaupunki} onChange={setP("kaupunki")} className={inputClass} />
                  </div>
                  {err && <p className="text-red-400 text-xs">{err}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-1"
                  >
                    {loading ? "Tallennetaan..." : <>Tallenna ja jatka <ArrowRight size={15} /></>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

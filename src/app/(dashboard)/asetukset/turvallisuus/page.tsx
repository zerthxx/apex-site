"use client";

import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Monitor } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const inputClass = "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors pr-10";

export default function TurvallisuusPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [show0, setShow0] = useState(false);
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [passwords, setPasswords] = useState({ nykyinen: "", uusi: "", vahvista: "" });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  function showStatus(type: "success" | "error", message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 5000);
  }

  function pwStrength(pw: string) {
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

  const hasPassword = user?.identities?.some((i) => i.provider === "email") || user?.user_metadata?.has_password === true;
  const provider = user?.app_metadata?.provider ?? "email";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.uusi !== passwords.vahvista) { showStatus("error", "Salasanat eivät täsmää."); return; }
    const s = pwStrength(passwords.uusi);
    if (s.score < 3) { showStatus("error", "Salasana on liian heikko."); return; }
    if (hasPassword) {
      if (!passwords.nykyinen) { showStatus("error", "Syötä nykyinen salasana."); return; }
      const { error } = await supabase.auth.signInWithPassword({ email: user!.email!, password: passwords.nykyinen });
      if (error) { showStatus("error", "Nykyinen salasana on väärä."); return; }
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.uusi, data: { has_password: true } });
    setLoading(false);
    if (error) showStatus("error", error.message);
    else { showStatus("success", "Salasana vaihdettu onnistuneesti."); setPasswords({ nykyinen: "", uusi: "", vahvista: "" }); }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
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

      <form onSubmit={save} className="flex flex-col gap-4">
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
              <input type={show0 ? "text" : "password"} value={passwords.nykyinen}
                onChange={(e) => setPasswords((p) => ({ ...p, nykyinen: e.target.value }))}
                placeholder="••••••••" className={inputClass} />
              <button type="button" onClick={() => setShow0((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
                {show0 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-dim">Uusi salasana</label>
          <div className="relative">
            <input type={show1 ? "text" : "password"} value={passwords.uusi}
              onChange={(e) => setPasswords((p) => ({ ...p, uusi: e.target.value }))}
              placeholder="Vähintään 8 merkkiä" className={inputClass} />
            <button type="button" onClick={() => setShow1((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
              {show1 ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {passwords.uusi && (() => {
            const s = pwStrength(passwords.uusi);
            return (
              <div className="mt-1.5 flex flex-col gap-1">
                <div className="flex gap-1 h-1.5">
                  {[1,2,3,4].map((i) => (
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
            <input type={show2 ? "text" : "password"} value={passwords.vahvista}
              onChange={(e) => setPasswords((p) => ({ ...p, vahvista: e.target.value }))}
              placeholder="••••••••" className={inputClass} />
            <button type="button" onClick={() => setShow2((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim">
              {show2 ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading || !passwords.uusi}
          className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60">
          {loading ? "Vaihdetaan..." : "Vaihda salasana"}
        </button>
      </form>

      <div className="border-t border-wire pt-5">
        <p className="text-xs font-medium text-ink-dim mb-3">Istunnot</p>
        <Link href="/istunnot"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink hover:border-copper/40 transition-colors">
          <Monitor size={16} className="text-copper" />
          <div>
            <p className="font-medium">Hallitse istuntoja</p>
            <p className="text-xs text-ink-ghost mt-0.5">Näytä ja kirjaudu ulos aktiivisilta laitteilta</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

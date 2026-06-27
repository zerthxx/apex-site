"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Phone, ArrowRight, ShieldCheck } from "lucide-react";

function KirjauduContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const step = searchParams.get("step");
  const error = searchParams.get("error");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const supabase = createClient();

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) { setErr(error.message); setLoading(false); return; }
    setStage("otp");
    setLoading(false);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "phone_change" });
    if (error) { setErr(error.message); setLoading(false); return; }
    router.push("/");
  }

  if (step !== "puhelin") {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-ink-ghost mb-4">{error === "auth" ? "Kirjautuminen epäonnistui. Yritä uudelleen." : "Ohjataan..."}</p>
          <a href="/" className="text-copper underline">Palaa etusivulle</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-elevated border border-wire rounded-2xl p-8 shadow-2xl">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper">
              {stage === "phone" ? <Phone size={18} strokeWidth={1.5} /> : <ShieldCheck size={18} strokeWidth={1.5} />}
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-ink">
                {stage === "phone" ? "Lisää puhelinnumero" : "Vahvista numero"}
              </h1>
              <p className="text-ink-ghost text-xs">
                {stage === "phone" ? "Lähetetään vahvistuskoodi" : `Koodi lähetetty numeroon ${phone}`}
              </p>
            </div>
          </div>

          {stage === "phone" ? (
            <form onSubmit={sendOtp} className="flex flex-col gap-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+358 40 123 4567"
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors"
              />
              {err && <p className="text-red-400 text-xs">{err}</p>}
              <button
                type="submit"
                disabled={loading || !phone}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {loading ? "Lähetetään..." : <>Lähetä koodi <ArrowRight size={15} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="flex flex-col gap-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
                className="w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm text-center tracking-widest text-lg focus:outline-none focus:border-copper/50 transition-colors"
              />
              {err && <p className="text-red-400 text-xs">{err}</p>}
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {loading ? "Vahvistetaan..." : <>Vahvista <ShieldCheck size={15} /></>}
              </button>
              <button type="button" onClick={() => setStage("phone")} className="text-xs text-ink-ghost hover:text-ink-dim text-center transition-colors">
                Vaihda numero
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KirjauduPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
      </div>
    }>
      <KirjauduContent />
    </Suspense>
  );
}

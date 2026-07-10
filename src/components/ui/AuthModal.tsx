"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { X, Eye, EyeOff, Mail, ArrowRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
  redirectTo?: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

function suomenna(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("rate limit"))
    return "Liian monta yritystä — odota hetki ja yritä uudelleen.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Tällä sähköpostilla on jo tili. Kirjaudu sisään.";
  if (m.includes("invalid email")) return "Tarkista sähköpostiosoite.";
  if (m.includes("weak password")) return "Salasana on liian heikko.";
  if (m.includes("network") || m.includes("fetch"))
    return "Yhteysvirhe — tarkista internetyhteys.";
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "Sähköposti tai salasana on väärin.";
  if (m.includes("token has expired") || m.includes("otp expired"))
    return "Koodi on vanhentunut — pyydä uusi koodi.";
  if (m.includes("token") || m.includes("otp"))
    return "Väärä koodi — tarkista sähköpostisi.";
  return "Jokin meni pieleen. Yritä uudelleen.";
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "signin",
  redirectTo = "/dashboard",
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [err, setErr] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpErr, setOtpErr] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState({
    email: "",
    etunimi: "",
    sukunimi: "",
    puhelin: "",
    osoite: "",
    postinumero: "",
    postitoimipaikka: "",
    salasana: "",
    salasana2: "",
  });

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setErr("");
      setOtpStep(false);
      setOtp(["", "", "", "", "", ""]);
      setOtpErr("");
      setResendTimer(0);
      setRememberMe(false);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  useEffect(() => {
    if (otpStep) setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }, [otpStep]);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleOtpInput(idx: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const next = [...otp];
      next[idx - 1] = "";
      setOtp(next);
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");
    const next = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  async function verifyOtp() {
    const token = otp.join("");
    if (token.length < 6) {
      setOtpErr("Syötä 6-numeroinen koodi.");
      return;
    }
    setOtpLoading(true);
    setOtpErr("");
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, code: token }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setOtpErr(error ?? "Väärä koodi.");
      setOtpLoading(false);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.salasana,
    });
    if (rememberMe) {
      localStorage.setItem("apex-remember", "1");
      sessionStorage.setItem("apex-session", "1");
    } else {
      localStorage.removeItem("apex-remember");
      sessionStorage.setItem("apex-session", "1");
    }
    setOtpLoading(false);
    // Log login event now that the session is active
    fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "login",
        event_data: { method: "otp" },
      }),
    }).catch(() => {});
    onClose();
    router.push(redirectTo);
  }

  async function resendOtp() {
    if (resendTimer > 0) return;
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setOtpErr(error ?? "Lähetys epäonnistui.");
      return;
    }
    setOtp(["", "", "", "", "", ""]);
    setOtpErr("");
    setResendTimer(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      alert("Supabase ei ole konfiguroitu.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!isSupabaseConfigured()) {
      setErr("Supabase ei ole konfiguroitu.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.salasana,
    });
    setLoading(false);
    if (error) {
      setLoading(false);
      setErr("Sähköposti tai salasana on väärin.");
      return;
    }
    await supabase.auth.signOut();
    setLoading(false);
    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    setOtpStep(true);
    setResendTimer(60);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (form.salasana !== form.salasana2) {
      setErr("Salasanat eivät täsmää.");
      return;
    }
    if (form.salasana.length < 8) {
      setErr("Salasanan tulee olla vähintään 8 merkkiä.");
      return;
    }
    if (!acceptTerms) {
      setErr("Hyväksy käyttöehdot jatkaaksesi.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setErr("Supabase ei ole konfiguroitu.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.salasana,
      options: {
        data: {
          full_name: `${form.etunimi} ${form.sukunimi}`.trim(),
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
    if (error) {
      setErr(suomenna(error.message));
      return;
    }
    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email }),
    });
    setOtpStep(true);
    setResendTimer(60);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002] w-full max-w-sm px-4"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-elevated border border-wire rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* OTP-vahvistusnäkymä */}
              {otpStep ? (
                <div className="flex flex-col items-center gap-5 py-2">
                  <div className="w-12 h-12 rounded-full bg-copper/10 border border-copper/20 flex items-center justify-center">
                    <Mail size={20} className="text-copper" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-display font-bold text-ink mb-1">
                      Syötä vahvistuskoodi
                    </h3>
                    <p className="text-ink-ghost text-sm leading-relaxed">
                      Lähetimme 6-numeroisen koodin osoitteeseen{" "}
                      <span className="text-ink font-medium">{form.email}</span>
                    </p>
                  </div>

                  <div className="flex gap-1.5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={handleOtpPaste}
                        className="w-9 h-11 text-center text-lg font-bold rounded-lg bg-surface border border-wire text-ink focus:outline-none focus:border-copper/50 transition-colors"
                      />
                    ))}
                  </div>

                  {otpErr && (
                    <p className="text-red-400 text-xs text-center">{otpErr}</p>
                  )}

                  <button
                    onClick={verifyOtp}
                    disabled={otpLoading || otp.join("").length < 6}
                    className="w-full py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {otpLoading ? (
                      "Vahvistetaan..."
                    ) : (
                      <>
                        Vahvista tili <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <button
                    onClick={resendOtp}
                    disabled={resendTimer > 0}
                    className="text-xs text-ink-ghost hover:text-copper transition-colors disabled:opacity-60"
                  >
                    {resendTimer > 0
                      ? `Lähetä uudelleen (${resendTimer}s)`
                      : "Ei tullut koodia? Lähetä uudelleen →"}
                  </button>

                  <button
                    onClick={() => {
                      setOtpStep(false);
                      setOtpErr("");
                    }}
                    className="text-xs text-ink-ghost hover:text-ink-dim transition-colors"
                  >
                    ← Takaisin
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-1 bg-surface rounded-xl p-1 border border-wire">
                      <button
                        onClick={() => {
                          setTab("signin");
                          setErr("");
                        }}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${tab === "signin" ? "bg-copper text-[#0A0C10]" : "text-ink-dim hover:text-ink"}`}
                      >
                        Kirjaudu
                      </button>
                      <button
                        onClick={() => {
                          setTab("signup");
                          setErr("");
                        }}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${tab === "signup" ? "bg-copper text-[#0A0C10]" : "text-ink-dim hover:text-ink"}`}
                      >
                        Luo tili
                      </button>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-ink-ghost hover:text-ink transition-colors p-1 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {tab === "signin" ? (
                    <form
                      onSubmit={handleSignIn}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="email"
                        placeholder="Sähköposti *"
                        required
                        value={form.email}
                        onChange={set("email")}
                        className={inputClass}
                      />
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Salasana *"
                          required
                          value={form.salasana}
                          onChange={set("salasana")}
                          className={inputClass + " pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 accent-copper"
                          />
                          <span className="text-xs text-ink-ghost">
                            Muista minut
                          </span>
                        </label>
                        <a
                          href="/palauta-salasana"
                          className="text-xs text-copper hover:underline"
                        >
                          Unohditko salasanasi?
                        </a>
                      </div>
                      {err && <p className="text-red-400 text-xs">{err}</p>}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-1"
                      >
                        {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
                      </button>
                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-wire" />
                        <span className="text-ink-ghost text-xs">tai</span>
                        <div className="flex-1 h-px bg-wire" />
                      </div>
                      <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm hover:bg-gray-100 transition-colors duration-150 disabled:opacity-60"
                      >
                        <GoogleIcon />
                        Jatka Googlella
                      </button>
                    </form>
                  ) : (
                    <form
                      onSubmit={handleSignUp}
                      className="flex flex-col gap-3"
                    >
                      <input
                        type="email"
                        placeholder="Sähköposti *"
                        required
                        value={form.email}
                        onChange={set("email")}
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Etunimi *"
                          required
                          value={form.etunimi}
                          onChange={set("etunimi")}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="Sukunimi *"
                          required
                          value={form.sukunimi}
                          onChange={set("sukunimi")}
                          className={inputClass}
                        />
                      </div>
                      <input
                        type="tel"
                        placeholder="Puhelinnumero *"
                        required
                        value={form.puhelin}
                        onChange={set("puhelin")}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Katuosoite *"
                        required
                        value={form.osoite}
                        onChange={set("osoite")}
                        className={inputClass}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Postinumero *"
                          required
                          maxLength={5}
                          value={form.postinumero}
                          onChange={set("postinumero")}
                          className={inputClass}
                        />
                        <input
                          type="text"
                          placeholder="Postitoimipaikka *"
                          required
                          value={form.postitoimipaikka}
                          onChange={set("postitoimipaikka")}
                          className={inputClass}
                        />
                      </div>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Salasana *"
                          required
                          value={form.salasana}
                          onChange={set("salasana")}
                          className={inputClass + " pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPw2 ? "text" : "password"}
                          placeholder="Salasana uudelleen *"
                          required
                          value={form.salasana2}
                          onChange={set("salasana2")}
                          className={inputClass + " pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw2((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim"
                        >
                          {showPw2 ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 shrink-0 accent-copper"
                        />
                        <span className="text-xs text-ink-ghost leading-relaxed">
                          Hyväksyn palvelun{" "}
                          <a
                            href="/kayttoehdot"
                            className="text-ink-dim underline hover:text-ink"
                          >
                            käyttöehdot
                          </a>{" "}
                          ja{" "}
                          <a
                            href="/tietosuoja"
                            className="text-ink-dim underline hover:text-ink"
                          >
                            tietosuojaselosteen
                          </a>
                        </span>
                      </label>
                      {err && <p className="text-red-400 text-xs">{err}</p>}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 mt-1"
                      >
                        {loading ? "Luodaan tiliä..." : "Luo tili"}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Smartphone,
} from "lucide-react";
import { CodeInput } from "@/components/shared/CodeInput";
import { StepIndicator } from "@/components/shared/StepIndicator";
import { PasswordStrengthMeter } from "@/components/shared/PasswordStrengthMeter";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

type Channel = "email" | "sms";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function PalautaSalasanaClient() {
  const [step, setStep] = useState(0); // 0 identify, 1 code, 2 new password, 3 done
  const [channel, setChannel] = useState<Channel>("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function start() {
    setError(null);
    if (!identifier.trim()) {
      setError(
        channel === "email"
          ? "Syötä sähköpostiosoitteesi."
          : "Syötä puhelinnumerosi.",
      );
      return;
    }
    setLoading(true);
    const { ok, data } = await post("/api/recovery/password/start", {
      identifier,
      channel,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Jokin meni pieleen. Yritä uudelleen.");
      return;
    }
    setCooldown(60);
    setCode("");
    setStep(1);
  }

  async function verify() {
    setError(null);
    setLoading(true);
    const { ok, data } = await post("/api/recovery/password/verify", {
      identifier,
      channel,
      code,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Väärä tai vanhentunut koodi.");
      return;
    }
    setResetToken(data.resetToken);
    setStep(2);
  }

  async function complete() {
    setError(null);
    if (password !== confirm) {
      setError("Salasanat eivät täsmää.");
      return;
    }
    setLoading(true);
    const { ok, data } = await post("/api/recovery/password/complete", {
      resetToken,
      newPassword: password,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Salasanan vaihto epäonnistui.");
      return;
    }
    setStep(3);
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-copper/10 border border-copper/30 flex items-center justify-center">
            <KeyRound size={20} className="text-copper" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Palauta salasana</h1>
          <p className="text-sm text-ink-ghost mt-1.5">
            Palauta tilisi vahvistetun sähköpostin tai puhelinnumeron avulla.
          </p>
        </div>

        <StepIndicator
          steps={["Tunniste", "Koodi", "Salasana", "Valmis"]}
          current={step}
        />

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-surface/50 border border-wire p-6 flex flex-col gap-4">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel("email")}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
                    channel === "email"
                      ? "bg-copper/10 border-copper/50 text-copper"
                      : "bg-surface border-wire text-ink-dim hover:border-copper/30"
                  }`}
                >
                  <Mail size={17} />
                  Sähköposti
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("sms")}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
                    channel === "sms"
                      ? "bg-copper/10 border-copper/50 text-copper"
                      : "bg-surface border-wire text-ink-dim hover:border-copper/30"
                  }`}
                >
                  <Smartphone size={17} />
                  Tekstiviesti
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-dim">
                  {channel === "email"
                    ? "Sähköpostiosoite"
                    : "Vahvistettu puhelinnumero"}
                </label>
                <input
                  type={channel === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    channel === "email"
                      ? "nimi@esimerkki.fi"
                      : "+358 40 123 4567"
                  }
                  className={inputClass}
                />
                {channel === "sms" && (
                  <p className="text-xs text-ink-ghost mt-1">
                    SMS-palautus toimii vain, jos numerosi on vahvistettu
                    tilillesi.
                  </p>
                )}
              </div>
              <button
                onClick={start}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {loading ? "Lähetetään..." : "Lähetä vahvistuskoodi"}
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-ink-ghost text-center">
                Syötä 6-numeroinen koodi, jonka lähetimme{" "}
                {channel === "email" ? "sähköpostiisi" : "puhelimeesi"}.
              </p>
              <CodeInput value={code} onChange={setCode} disabled={loading} />
              <button
                onClick={verify}
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {loading ? "Tarkistetaan..." : "Vahvista koodi"}
              </button>
              <button
                type="button"
                onClick={start}
                disabled={cooldown > 0 || loading}
                className="text-xs text-ink-ghost hover:text-copper transition-colors disabled:opacity-50 mx-auto"
              >
                {cooldown > 0
                  ? `Lähetä uusi koodi (${cooldown}s)`
                  : "Lähetä uusi koodi"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-dim">
                  Uusi salasana
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Vähintään 8 merkkiä"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-ghost hover:text-ink-dim"
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={password} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink-dim">
                  Vahvista uusi salasana
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <button
                onClick={complete}
                disabled={loading || !password || !confirm}
                className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
              >
                {loading ? "Tallennetaan..." : "Aseta uusi salasana"}
              </button>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <CheckCircle size={22} className="text-green-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-ink">
                  Salasana vaihdettu
                </p>
                <p className="text-sm text-ink-ghost mt-1">
                  Kaikki istuntosi kirjattiin ulos turvallisuussyistä. Kirjaudu
                  sisään uudella salasanallasi.
                </p>
              </div>
              <Link
                href="/kirjaudu"
                className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors"
              >
                Kirjaudu sisään
              </Link>
            </div>
          )}
        </div>

        {step < 3 && (
          <p className="text-xs text-ink-ghost text-center">
            Unohditko myös sähköpostisi?{" "}
            <Link
              href="/palauta-sahkoposti"
              className="text-copper hover:underline"
            >
              Palauta sähköposti
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, AtSign, CheckCircle, LifeBuoy } from "lucide-react";
import { CodeInput } from "@/components/shared/CodeInput";
import { StepIndicator } from "@/components/shared/StepIndicator";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface border border-wire text-ink placeholder:text-ink-ghost text-sm focus:outline-none focus:border-copper/50 transition-colors";

async function post(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function PalautaSahkopostiClient() {
  const [mode, setMode] = useState<"recover" | "ticket">("recover");

  // Recovery wizard state
  const [step, setStep] = useState(0); // 0 phone, 1 sms code, 2 new email, 3 email code, 4 done
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Lost-phone ticket state
  const [ticket, setTicket] = useState({
    name: "",
    email: "",
    phoneHint: "",
    description: "",
  });
  const [ticketDone, setTicketDone] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function run(
    fn: () => Promise<{ ok: boolean; data: { error?: string } }>,
    onOk: (data: never) => void,
  ) {
    setError(null);
    setLoading(true);
    const { ok, data } = await fn();
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Jokin meni pieleen. Yritä uudelleen.");
      return;
    }
    onOk(data as never);
  }

  const startSms = () =>
    run(
      () => post("/api/recovery/email/start", { phone }),
      () => {
        setCooldown(60);
        setSmsCode("");
        setStep(1);
      },
    );

  const verifySms = () =>
    run(
      () => post("/api/recovery/email/verify", { phone, code: smsCode }),
      (data: { recoveryToken: string; maskedEmail: string }) => {
        setRecoveryToken(data.recoveryToken);
        setMaskedEmail(data.maskedEmail);
        setStep(2);
      },
    );

  const sendEmailCode = () =>
    run(
      () => post("/api/recovery/email/new-email", { recoveryToken, newEmail }),
      () => {
        setEmailCode("");
        setStep(3);
      },
    );

  const complete = () =>
    run(
      () =>
        post("/api/recovery/email/complete", {
          recoveryToken,
          newEmail,
          code: emailCode,
        }),
      () => setStep(4),
    );

  const submitTicket = () =>
    run(
      () => post("/api/recovery/request", ticket),
      () => setTicketDone(true),
    );

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-copper/10 border border-copper/30 flex items-center justify-center">
            <AtSign size={20} className="text-copper" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Palauta sähköposti</h1>
          <p className="text-sm text-ink-ghost mt-1.5">
            Unohditko tilisi sähköpostiosoitteen? Palauta se vahvistetulla
            puhelinnumerollasi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("recover")}
            className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              mode === "recover"
                ? "bg-copper/10 border-copper/50 text-copper"
                : "bg-surface border-wire text-ink-dim hover:border-copper/30"
            }`}
          >
            Minulla on puhelimeni
          </button>
          <button
            type="button"
            onClick={() => setMode("ticket")}
            className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              mode === "ticket"
                ? "bg-copper/10 border-copper/50 text-copper"
                : "bg-surface border-wire text-ink-dim hover:border-copper/30"
            }`}
          >
            Puhelin kadonnut
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {mode === "recover" && (
          <>
            <StepIndicator
              steps={["Numero", "SMS", "Uusi osoite", "Vahvistus", "Valmis"]}
              current={step}
            />
            <div className="rounded-2xl bg-surface/50 border border-wire p-6 flex flex-col gap-4">
              {step === 0 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-ink-dim">
                      Vahvistettu puhelinnumero
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+358 40 123 4567"
                      className={inputClass}
                    />
                  </div>
                  <button
                    onClick={startSms}
                    disabled={loading || !phone.trim()}
                    className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
                  >
                    {loading ? "Lähetetään..." : "Lähetä SMS-koodi"}
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <p className="text-sm text-ink-ghost text-center">
                    Syötä puhelimeesi lähetetty 6-numeroinen koodi.
                  </p>
                  <CodeInput
                    value={smsCode}
                    onChange={setSmsCode}
                    disabled={loading}
                  />
                  <button
                    onClick={verifySms}
                    disabled={loading || smsCode.length !== 6}
                    className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
                  >
                    {loading ? "Tarkistetaan..." : "Vahvista koodi"}
                  </button>
                  <button
                    type="button"
                    onClick={startSms}
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
                  <div className="px-4 py-3 rounded-xl bg-surface border border-wire text-sm text-ink-dim">
                    Tilisi nykyinen sähköposti:{" "}
                    <span className="text-ink font-medium">{maskedEmail}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-ink-dim">
                      Uusi sähköpostiosoite
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="uusi@esimerkki.fi"
                      className={inputClass}
                    />
                    <p className="text-xs text-ink-ghost mt-1">
                      Lähetämme uuteen osoitteeseen vahvistuskoodin. Vanha
                      osoite pysyy voimassa, kunnes uusi on vahvistettu.
                    </p>
                  </div>
                  <button
                    onClick={sendEmailCode}
                    disabled={loading || !newEmail.trim()}
                    className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
                  >
                    {loading ? "Lähetetään..." : "Lähetä vahvistuskoodi"}
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="text-sm text-ink-ghost text-center">
                    Syötä osoitteeseen{" "}
                    <span className="text-ink">{newEmail}</span> lähetetty
                    koodi.
                  </p>
                  <CodeInput
                    value={emailCode}
                    onChange={setEmailCode}
                    disabled={loading}
                  />
                  <button
                    onClick={complete}
                    disabled={loading || emailCode.length !== 6}
                    className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
                  >
                    {loading ? "Vaihdetaan..." : "Vaihda sähköposti"}
                  </button>
                </>
              )}

              {step === 4 && (
                <div className="flex flex-col items-center gap-4 py-2 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle size={22} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">
                      Sähköposti vaihdettu
                    </p>
                    <p className="text-sm text-ink-ghost mt-1">
                      Tilisi sähköposti on nyt {newEmail}. Kaikki istunnot
                      kirjattiin ulos — kirjaudu sisään uudella osoitteellasi.
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
          </>
        )}

        {mode === "ticket" && (
          <div className="rounded-2xl bg-surface/50 border border-wire p-6 flex flex-col gap-4">
            {ticketDone ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle size={22} className="text-green-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-ink">
                    Pyyntö vastaanotettu
                  </p>
                  <p className="text-sm text-ink-ghost mt-1">
                    Apex-tuki varmistaa henkilöllisyytesi ja ottaa sinuun
                    yhteyttä sähköpostitse.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-wire">
                  <LifeBuoy size={15} className="text-copper mt-0.5 shrink-0" />
                  <p className="text-xs text-ink-ghost">
                    Jos et enää pääse puhelinnumeroosi, tukemme varmistaa
                    henkilöllisyytesi ja vaihtaa numeron puolestasi. Uusi numero
                    vahvistetaan tekstiviestillä.
                  </p>
                </div>
                <input
                  value={ticket.name}
                  onChange={(e) =>
                    setTicket((t) => ({ ...t, name: e.target.value }))
                  }
                  placeholder="Nimesi"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={ticket.email}
                  onChange={(e) =>
                    setTicket((t) => ({ ...t, email: e.target.value }))
                  }
                  placeholder="Sähköpostiosoitteesi"
                  className={inputClass}
                />
                <input
                  value={ticket.phoneHint}
                  onChange={(e) =>
                    setTicket((t) => ({ ...t, phoneHint: e.target.value }))
                  }
                  placeholder="Vanhan numeron loppuosa (esim. •••67)"
                  className={inputClass}
                />
                <textarea
                  value={ticket.description}
                  onChange={(e) =>
                    setTicket((t) => ({ ...t, description: e.target.value }))
                  }
                  placeholder="Kerro tilanteestasi — mitä tapahtui ja mitä tietoja tilistäsi muistat"
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
                <button
                  onClick={submitTicket}
                  disabled={
                    loading ||
                    !ticket.name ||
                    !ticket.email ||
                    ticket.description.length < 10
                  }
                  className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60"
                >
                  {loading ? "Lähetetään..." : "Lähetä tukipyyntö"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

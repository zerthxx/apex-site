"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle, ShieldAlert, Undo2 } from "lucide-react";

type RevertInfo = {
  field: "email" | "phone";
  oldMasked: string | null;
  newMasked: string | null;
  changedAt: string;
};

/**
 * Change-revert landing page, opened from the security email/SMS sent to the
 * OLD contact. Shows what changed and lets the previous owner undo it within
 * the 7-day recovery window.
 */
export function PeruMuutosClient({ token }: { token: string }) {
  const [info, setInfo] = useState<RevertInfo | null>(null);
  const [state, setState] = useState<
    "loading" | "ready" | "invalid" | "working" | "done"
  >(token ? "loading" : "invalid");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/recovery/revert?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? null);
          setState("invalid");
          return;
        }
        setInfo(data);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  async function revert() {
    setState("working");
    setError(null);
    const res = await fetch("/api/recovery/revert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Peruminen epäonnistui.");
      setState("ready");
      return;
    }
    setState("done");
  }

  const fieldLabel =
    info?.field === "phone" ? "puhelinnumero" : "sähköpostiosoite";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full rounded-2xl bg-surface/50 border border-wire p-8 flex flex-col items-center gap-5 text-center">
        {state === "loading" && (
          <p className="text-sm text-ink-ghost">Tarkistetaan linkkiä…</p>
        )}

        {state === "invalid" && (
          <>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle size={22} className="text-red-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                Linkki ei kelpaa
              </p>
              <p className="text-sm text-ink-ghost mt-1.5">
                {error ??
                  "Linkki on virheellinen, vanhentunut tai jo käytetty. Jos epäilet tilisi joutuneen vääriin käsiin, ota heti yhteyttä tukeen."}
              </p>
            </div>
            <Link
              href="/yhteystiedot"
              className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors"
            >
              Ota yhteyttä tukeen
            </Link>
          </>
        )}

        {(state === "ready" || state === "working") && info && (
          <>
            <div className="w-12 h-12 rounded-xl bg-copper/10 border border-copper/30 flex items-center justify-center">
              <ShieldAlert size={22} className="text-copper" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">
                Peru tilin muutos
              </p>
              <p className="text-sm text-ink-ghost mt-1.5">
                Tilisi {fieldLabel} vaihdettiin{" "}
                {new Date(info.changedAt).toLocaleString("fi-FI")}.
              </p>
            </div>
            <div className="w-full rounded-xl bg-surface border border-wire p-4 text-sm flex flex-col gap-2">
              <div className="flex justify-between gap-4">
                <span className="text-ink-ghost">Vanha</span>
                <span className="text-ink font-medium">
                  {info.oldMasked ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink-ghost">Uusi</span>
                <span className="text-ink font-medium">
                  {info.newMasked ?? "—"}
                </span>
              </div>
            </div>
            {error && (
              <div className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-400 text-left">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            <p className="text-xs text-ink-ghost">
              Peruminen palauttaa vanhan tiedon, kirjaa kaikki istunnot ulos ja
              vaatii salasanan vaihdon seuraavalla kirjautumisella.
            </p>
            <button
              onClick={revert}
              disabled={state === "working"}
              className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Undo2 size={15} />
              {state === "working"
                ? "Perutaan..."
                : "Peru muutos ja suojaa tili"}
            </button>
          </>
        )}

        {state === "done" && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle size={22} className="text-green-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-ink">Muutos peruttu</p>
              <p className="text-sm text-ink-ghost mt-1.5">
                Vanha {fieldLabel} palautettiin ja kaikki istunnot kirjattiin
                ulos. Vaihda vielä salasanasi kirjautumalla sisään —
                suosittelemme myös tarkistamaan tilin tiedot.
              </p>
            </div>
            <Link
              href="/kirjaudu"
              className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors"
            >
              Kirjaudu sisään
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

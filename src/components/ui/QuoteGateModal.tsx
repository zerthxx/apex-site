"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { QUOTE_GATE_EVENT } from "@/hooks/useQuoteGate";

/**
 * Global gate shown when a guest clicks a "Pyydä tarjous" CTA. Triggered via
 * the "open-quote-gate" window event (see useQuoteGate/RequestQuoteLink).
 * Rendered once in Header.tsx, alongside the shared AuthModal instance.
 */
export function QuoteGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/yhteystiedot");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { redirectTo?: string };
      setRedirectTo(detail?.redirectTo ?? "/yhteystiedot");
      setIsOpen(true);
    };
    window.addEventListener(QUOTE_GATE_EVENT, handler);
    return () => window.removeEventListener(QUOTE_GATE_EVENT, handler);
  }, []);

  function openAuth(tab: "signin" | "signup") {
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { tab, redirectTo } }),
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="sm">
      <div className="flex flex-col items-center gap-5 px-6 pb-6 text-center">
        <Image
          src="/logo-icon.png"
          alt="Apex Site"
          width={44}
          height={44}
          className="h-11 w-auto object-contain"
        />
        <div>
          <h2 className="font-display font-bold text-ink text-lg mb-2">
            Kirjaudu sisään jatkaaksesi
          </h2>
          <p className="text-ink-dim text-sm leading-relaxed">
            Tarjouspyynnön lähettäminen edellyttää kirjautumista tai uuden tilin
            luomista.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => openAuth("signin")}
          >
            Kirjaudu
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => openAuth("signup")}
          >
            Luo tili
          </Button>
        </div>
      </div>
    </Modal>
  );
}

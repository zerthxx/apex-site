"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      alert("Supabase ei ole vielä konfiguroitu. Lisää API-avaimet .env.local-tiedostoon.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-elevated border border-wire rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-xl text-ink">Kirjaudu sisään</h2>
                <button onClick={onClose} className="text-ink-ghost hover:text-ink transition-colors p-1 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <p className="text-ink-ghost text-sm mb-6 leading-relaxed">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

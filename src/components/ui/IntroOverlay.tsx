"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lightfall } from "@/components/ui/Lightfall";
import FuzzyText from "@/components/ui/FuzzyText";

export function IntroOverlay() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  );

  useEffect(() => {
    if (pathname === "/" && !sessionStorage.getItem("intro-seen"))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!visible || !isMobile) return;
    const timeout = setTimeout(() => dismiss(), 3500);
    return () => clearTimeout(timeout);
  }, [visible, isMobile]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLoggedIn(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => dismiss();
    window.addEventListener("dismiss-intro", handler);
    return () => window.removeEventListener("dismiss-intro", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  function dismiss() {
    sessionStorage.setItem("intro-seen", "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#05070B] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {!prefersReduced && (
            <Lightfall
              className="absolute inset-0 z-0"
              colors={["#C8813A", "#D99550", "#2ABFBF"]}
              backgroundColor="#05070B"
              speed={isMobile ? 0.3 : 0.5}
              streakCount={isMobile ? 2 : 3}
              streakWidth={1}
              streakLength={1.1}
              density={0.55}
              twinkle={1}
              glow={1}
              zoom={3}
              backgroundGlow={0.5}
              opacity={1}
              mouseInteraction={!isMobile}
              mouseStrength={0.4}
              mouseRadius={0.9}
            />
          )}

          <motion.div
            className="relative z-10 flex flex-col items-center gap-8 md:gap-9 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
          >
            <style>{`
              @keyframes glow-shift {
                0%   { box-shadow: 0 0 22px 7px rgba(99,210,255,0.8),  0 0 55px 18px rgba(99,210,255,0.3); }
                25%  { box-shadow: 0 0 22px 7px rgba(180,80,255,0.8),  0 0 55px 18px rgba(180,80,255,0.3); }
                50%  { box-shadow: 0 0 22px 7px rgba(255,70,100,0.8),  0 0 55px 18px rgba(255,70,100,0.3); }
                75%  { box-shadow: 0 0 22px 7px rgba(50,230,130,0.8),  0 0 55px 18px rgba(50,230,130,0.3); }
                100% { box-shadow: 0 0 22px 7px rgba(99,210,255,0.8),  0 0 55px 18px rgba(99,210,255,0.3); }
              }
            `}</style>

            <Image
              src="/logo-mark.png"
              alt="Apex Site"
              width={454}
              height={370}
              className="w-16 h-auto sm:w-20 md:w-28 object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 14px rgba(200,129,58,0.45)) drop-shadow(0 0 28px rgba(42,191,191,0.3))",
              }}
              priority
            />

            {prefersReduced ? (
              <h1 className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-copper via-copper-light to-teal-brand text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-center select-none">
                APEXSITE
              </h1>
            ) : (
              <FuzzyText
                className="font-display select-none"
                fontSize="clamp(3.5rem, 12vw, 9rem)"
                fontWeight={800}
                gradient={["#C8813A", "#2ABFBF"]}
                enableHover={false}
                baseIntensity={0.06}
                fuzzRange={isMobile ? 10 : 16}
                letterSpacing={2}
              >
                APEXSITE
              </FuzzyText>
            )}

            {loggedIn ? (
              <button
                onClick={dismiss}
                className="px-7 py-2.5 md:px-10 md:py-3.5 rounded-full bg-copper text-[#0A0C10] font-display font-bold text-sm md:text-base tracking-wide hover:bg-copper-light transition-colors duration-200"
                style={{ animation: "glow-shift 4s ease-in-out infinite" }}
              >
                Aloita →
              </button>
            ) : (
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("open-auth-modal", { detail: "signin" }),
                    );
                  }}
                  className="px-5 py-2 md:px-8 md:py-3.5 rounded-full bg-copper text-[#0A0C10] font-display font-bold text-sm md:text-base tracking-wide hover:bg-copper-light transition-colors duration-200"
                  style={{ animation: "glow-shift 4s ease-in-out infinite" }}
                >
                  Kirjaudu
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("open-auth-modal", { detail: "signup" }),
                    );
                  }}
                  className="px-5 py-2 md:px-8 md:py-3.5 rounded-full bg-white/10 border border-white/30 text-white font-display font-bold text-sm md:text-base tracking-wide hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm whitespace-nowrap"
                  style={{ animation: "glow-shift 4s ease-in-out infinite" }}
                >
                  Luo tili
                </button>
              </div>
            )}
            {!loggedIn && (
              <button
                onClick={async () => {
                  if (isSupabaseConfigured()) {
                    const supabase = createClient();
                    const { data } = await supabase.auth.getUser();
                    if (data.user) {
                      const meta = data.user.user_metadata ?? {};
                      if (!meta.address) await supabase.auth.signOut();
                    }
                  }
                  dismiss();
                }}
                className="text-white/50 text-sm hover:text-white/70 transition-colors duration-150 tracking-wide"
              >
                Jatka vierailijana →
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

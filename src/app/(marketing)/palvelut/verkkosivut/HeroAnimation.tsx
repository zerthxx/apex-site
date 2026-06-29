"use client";
import { motion, useReducedMotion, type Transition } from "framer-motion";

const FLOAT_TRANSITION: Transition = {
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut",
};

const CARD_TRANSITION: Transition = {
  duration: 5,
  repeat: Infinity,
  ease: "easeInOut",
  delay: 1,
};

const DOT_TRANSITION: Transition = {
  duration: 2,
  repeat: Infinity,
};

export function HeroAnimation() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:block">
      <motion.div
        animate={reduced ? undefined : {
          y: [0, -6, -4, -7, 0],
          rotate: [0, 0.3, -0.2, 0.3, 0],
          boxShadow: [
            "0 25px 50px -12px rgba(0,0,0,0.4)",
            "0 35px 60px -12px rgba(200,129,58,0.15)",
            "0 30px 55px -12px rgba(0,0,0,0.35)",
            "0 40px 65px -12px rgba(200,129,58,0.18)",
            "0 25px 50px -12px rgba(0,0,0,0.4)",
          ],
        }}
        transition={reduced ? undefined : FLOAT_TRANSITION}
        className="rounded-2xl border border-wire bg-elevated overflow-hidden"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)" }}
      >
        {/* Browser chrome */}
        <div className="h-9 bg-surface border-b border-wire flex items-center gap-1.5 px-4">
          <div className="w-3 h-3 rounded-full bg-bad/50" />
          <div className="w-3 h-3 rounded-full bg-copper/50" />
          <div className="w-3 h-3 rounded-full bg-ok/50" />
          <div className="flex-1 mx-4 h-5 rounded-md bg-wire flex items-center px-3 gap-2">
            <motion.div
              animate={reduced ? undefined : { opacity: [1, 0.3, 1] }}
              transition={reduced ? undefined : DOT_TRANSITION}
              className="w-2 h-2 rounded-full bg-ok/80 shrink-0"
            />
            <span className="text-[10px] text-ink-ghost">apexsite.fi</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Mock nav */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-20 rounded bg-copper/20" />
            <div className="flex gap-3">
              {[56, 48, 52, 44].map((w, i) => (
                <div key={i} className="h-3 rounded bg-wire" style={{ width: w }} />
              ))}
            </div>
            <div className="h-7 w-24 rounded-lg bg-copper/30" />
          </div>

          {/* Mock hero */}
          <div className="py-6 space-y-3 border-b border-wire">
            <div className="h-3 w-20 rounded bg-copper/30" />
            <div className="h-6 w-64 rounded bg-ink/30" />
            <div className="h-6 w-52 rounded bg-ink/20" />
            <div className="h-4 w-72 rounded bg-ink/10" />
            <div className="h-4 w-56 rounded bg-ink/10" />
            <div className="flex gap-3 mt-4">
              <div className="h-8 w-32 rounded-lg bg-copper/40" />
              <div className="h-8 w-28 rounded-lg bg-wire" />
            </div>
          </div>

          {/* Mock cards — hieman viivästetty kellu */}
          <motion.div
            animate={reduced ? undefined : { y: [0, -3, 0] }}
            transition={reduced ? undefined : CARD_TRANSITION}
            className="grid grid-cols-3 gap-3"
          >
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-wire p-3 space-y-2">
                <div className="w-6 h-6 rounded-md bg-copper/20" />
                <div className="h-3 w-full rounded bg-ink/15" />
                <div className="h-2.5 w-4/5 rounded bg-ink/10" />
                <div className="h-2.5 w-3/5 rounded bg-ink/10" />
              </div>
            ))}
          </motion.div>

          {/* Mock stats */}
          <div className="flex gap-4 pt-1">
            {["Nopea", "Turvallinen", "SEO-optimoitu"].map((l) => (
              <div key={l} className="flex items-center gap-1.5 text-[10px] text-ink-ghost">
                <div className="w-1.5 h-1.5 rounded-full bg-ok/60" />
                {l}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

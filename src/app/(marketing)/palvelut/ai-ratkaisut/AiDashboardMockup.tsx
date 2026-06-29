"use client";
import { motion, useReducedMotion, type Transition } from "framer-motion";

const PULSE_TRANSITION: Transition = { duration: 2, repeat: Infinity };
const FLOAT_TRANSITION: Transition = { duration: 5, repeat: Infinity, ease: "easeInOut" };
const DOT_DELAYS = [0, 0.15, 0.3];

export function AiDashboardMockup() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:block">
      <motion.div
        animate={reduced ? undefined : { y: [0, -5, 0] }}
        transition={reduced ? undefined : FLOAT_TRANSITION}
        className="rounded-2xl border border-wire bg-elevated overflow-hidden"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)" }}
      >
        {/* Header */}
        <div className="h-9 bg-surface border-b border-wire flex items-center gap-2 px-4">
          <motion.div
            animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
            transition={reduced ? undefined : PULSE_TRANSITION}
            className="w-2 h-2 rounded-full bg-ok/80"
          />
          <span className="text-[11px] text-ink-ghost font-medium">Apex AI — Aktiivinen</span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-bad/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-copper/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-ok/40" />
          </div>
        </div>

        {/* Chat area */}
        <div className="p-4 space-y-3">
          {/* User message */}
          <div className="flex justify-end">
            <div className="max-w-[75%] bg-copper/20 border border-copper/30 rounded-xl rounded-br-sm px-3 py-2.5 space-y-1.5">
              <div className="h-2.5 w-40 rounded bg-copper/40" />
              <div className="h-2.5 w-28 rounded bg-copper/30" />
            </div>
          </div>

          {/* AI response */}
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-copper/20 border border-copper/30 flex items-center justify-center shrink-0 mt-0.5">
              <div className="w-3 h-3 rounded-full bg-copper/60" />
            </div>
            <div className="flex-1 bg-surface border border-wire rounded-xl rounded-bl-sm p-3 space-y-2">
              <div className="h-2.5 w-full rounded bg-ink/20" />
              <div className="h-2.5 w-5/6 rounded bg-ink/15" />
              <div className="h-2.5 w-4/5 rounded bg-ink/15" />
              <div className="h-2.5 w-3/5 rounded bg-ink/10" />
            </div>
          </div>

          {/* Typing indicator */}
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-full bg-copper/20 border border-copper/30 flex items-center justify-center shrink-0">
              <div className="w-3 h-3 rounded-full bg-copper/60" />
            </div>
            <div className="flex gap-1 px-3 py-2.5 bg-surface border border-wire rounded-xl rounded-bl-sm">
              {DOT_DELAYS.map((delay, i) => (
                <motion.div
                  key={i}
                  animate={reduced ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                  transition={reduced ? undefined : { duration: 1, repeat: Infinity, delay }}
                  className="w-1.5 h-1.5 rounded-full bg-copper/60"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-wire px-4 py-3 grid grid-cols-3 gap-3">
          {[
            { label: "Käsittelyaika", value: "3 s" },
            { label: "Tarkkuus", value: "99%" },
            { label: "Säästö / vk", value: "6 h" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-copper font-bold text-sm">{value}</p>
              <p className="text-[10px] text-ink-ghost leading-tight mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

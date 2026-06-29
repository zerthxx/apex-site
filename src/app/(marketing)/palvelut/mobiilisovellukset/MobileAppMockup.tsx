"use client";
import { motion, useReducedMotion, type Transition } from "framer-motion";

const FLOAT_TRANSITION: Transition = { duration: 5, repeat: Infinity, ease: "easeInOut" };
const PULSE_TRANSITION: Transition = { duration: 2, repeat: Infinity };

const ACTIVITY = [
  { label: "Uusi tilaus", value: "49 €", color: "ok" },
  { label: "Asiakaspalaute", value: "★ 5.0", color: "copper" },
  { label: "Toimitus", value: "Lähetetty", color: "ok" },
];

export function MobileAppMockup() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:flex justify-center">
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={reduced ? undefined : FLOAT_TRANSITION}
        className="w-[220px] rounded-[2rem] border-2 border-wire/70 bg-elevated overflow-hidden"
        style={{ boxShadow: "0 30px 60px -15px rgba(0,0,0,0.5)" }}
      >
        {/* Status bar */}
        <div className="h-6 bg-surface flex items-center justify-between px-4">
          <span className="text-[9px] font-semibold text-ink-ghost">9:41</span>
          <div className="flex gap-1 items-center">
            <div className="flex gap-0.5 items-end h-2.5">
              {[40, 60, 80, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-sm bg-ink-ghost/50"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="w-3 h-1.5 rounded-sm border border-ink-ghost/40 ml-0.5">
              <div className="w-2 h-full rounded-sm bg-ok/60" />
            </div>
          </div>
        </div>

        {/* App header */}
        <div className="px-4 pt-3 pb-2 bg-surface border-b border-wire flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-copper/20 border border-copper/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-copper/60" />
            </div>
            <div>
              <p className="text-[9px] text-ink-ghost leading-none">Hei,</p>
              <p className="text-[11px] font-semibold text-ink leading-none mt-0.5">Matti</p>
            </div>
          </div>
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-surface border border-wire flex items-center justify-center">
              <div className="w-3 h-3 border border-ink-ghost/50 rounded-sm" />
            </div>
            <motion.div
              animate={reduced ? undefined : { opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
              transition={reduced ? undefined : PULSE_TRANSITION}
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-copper"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 pt-3 pb-2 grid grid-cols-2 gap-2">
          {[
            { label: "Tilauksia", value: "24" },
            { label: "Asiakkaita", value: "142" },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={reduced ? undefined : { opacity: 0, y: 6 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={reduced ? undefined : { duration: 0.35, delay: i * 0.1 }}
              className="bg-surface border border-wire rounded-xl p-2.5"
            >
              <p className="text-copper font-bold text-base leading-none">{value}</p>
              <p className="text-[9px] text-ink-ghost mt-1 leading-none">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Activity label */}
        <div className="px-3 pb-1.5">
          <span className="text-[9px] font-semibold text-ink-ghost uppercase tracking-widest">
            Tapahtumat
          </span>
        </div>

        {/* Activity rows */}
        <div className="px-3 pb-3 space-y-1.5">
          {ACTIVITY.map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              initial={reduced ? undefined : { opacity: 0, x: -6 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              transition={reduced ? undefined : { duration: 0.3, delay: 0.2 + i * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg bg-surface border border-wire"
            >
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    color === "ok" ? "bg-ok/70" : "bg-copper/70"
                  }`}
                />
                <span className="text-[10px] text-ink">{label}</span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  color === "ok" ? "text-ok/80" : "text-copper"
                }`}
              >
                {value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-wire bg-surface px-4 py-2 flex items-center justify-around">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-0.5 ${i === 0 ? "opacity-100" : "opacity-30"}`}
            >
              <div className="w-4 h-4 rounded bg-ink-ghost/20 border border-wire/60" />
              <div className={`h-0.5 w-3 rounded-full ${i === 0 ? "bg-copper" : "bg-transparent"}`} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

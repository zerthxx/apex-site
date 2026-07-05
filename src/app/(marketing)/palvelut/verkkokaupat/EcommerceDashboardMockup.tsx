"use client";
import { motion, useReducedMotion, type Transition } from "motion/react";

const FLOAT_TRANSITION: Transition = {
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut",
};
const PULSE_TRANSITION: Transition = { duration: 2, repeat: Infinity };

const ORDERS = [
  { id: "#1042", product: "Tuote A — Sininen L", price: "49 €", status: "ok" },
  { id: "#1041", product: "Tuote B — Paketti S", price: "89 €", status: "ok" },
  {
    id: "#1040",
    product: "Tuote C — Musta XL",
    price: "34 €",
    status: "copper",
  },
];

export function EcommerceDashboardMockup() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:block">
      <motion.div
        animate={reduced ? undefined : { y: [0, -6, 0] }}
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
          <span className="text-[11px] text-ink-ghost font-medium">
            Apex Store — Kauppa auki
          </span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-bad/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-copper/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-ok/40" />
          </div>
        </div>

        {/* Order list header */}
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-ink-ghost uppercase tracking-widest">
            Viimeisimmät tilaukset
          </span>
          <span className="text-[10px] text-copper font-medium">
            Näytä kaikki →
          </span>
        </div>

        {/* Orders */}
        <div className="px-4 pb-3 space-y-2">
          {ORDERS.map(({ id, product, price, status }, i) => (
            <motion.div
              key={id}
              initial={reduced ? undefined : { opacity: 0, x: -8 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              transition={
                reduced ? undefined : { duration: 0.4, delay: i * 0.12 }
              }
              className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-wire"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  status === "ok" ? "bg-ok/70" : "bg-copper/70"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-ink truncate">
                  {id}
                </p>
                <p className="text-[10px] text-ink-ghost truncate">{product}</p>
              </div>
              <span className="text-[11px] text-copper font-bold shrink-0">
                {price}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="border-t border-wire px-4 py-3 grid grid-cols-3 gap-3">
          {[
            { label: "Tilauksia / vrk", value: "24" },
            { label: "Liikevaihto", value: "1 240 €" },
            { label: "Konversio", value: "3.8 %" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-copper font-bold text-sm">{value}</p>
              <p className="text-[10px] text-ink-ghost leading-tight mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

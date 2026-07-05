"use client";
import { motion, useReducedMotion, type Transition } from "motion/react";

const FLOAT_TRANSITION: Transition = {
  duration: 6,
  repeat: Infinity,
  ease: "easeInOut",
};
const PULSE_TRANSITION: Transition = { duration: 2, repeat: Infinity };

const ROWS = [
  { label: "Lasku #1042", user: "Yritys Oy", status: "ok", value: "1 200 €" },
  { label: "Varaus #204", user: "Maria K.", status: "copper", value: "14:30" },
  { label: "Asiakas #089", user: "Juho V.", status: "ok", value: "Aktiivinen" },
];

const NAV_ITEMS = [
  "Dashboard",
  "Asiakkaat",
  "Myynti",
  "Laskut",
  "Raportit",
  "Asetukset",
];

const METRICS = [
  { label: "Myynti tänään", value: "2 840 €" },
  { label: "Varaukset", value: "24" },
  { label: "Avoimet laskut", value: "7" },
];

export function SoftwareDashboardMockup() {
  const reduced = useReducedMotion();

  return (
    <div className="hidden lg:block">
      <motion.div
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={reduced ? undefined : FLOAT_TRANSITION}
        className="rounded-2xl border border-wire bg-elevated overflow-hidden"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)" }}
      >
        {/* Header bar */}
        <div className="h-9 bg-surface border-b border-wire flex items-center gap-2 px-4">
          <motion.div
            animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
            transition={reduced ? undefined : PULSE_TRANSITION}
            className="w-2 h-2 rounded-full bg-ok/80"
          />
          <span className="text-[11px] text-ink-ghost font-medium">
            Apex Dashboard — Online
          </span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-bad/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-copper/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-ok/40" />
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-32 border-r border-wire bg-surface/60 py-3 shrink-0">
            {NAV_ITEMS.map((item, i) => (
              <div
                key={item}
                className={`px-3 py-2 mx-2 rounded-lg text-[10px] font-medium mb-0.5 ${
                  i === 0
                    ? "bg-copper/15 text-copper border border-copper/20"
                    : "text-ink-ghost hover:bg-surface"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3">
            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {METRICS.map(({ label, value }, i) => (
                <motion.div
                  key={label}
                  initial={reduced ? undefined : { opacity: 0, y: 6 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  transition={
                    reduced ? undefined : { duration: 0.35, delay: i * 0.1 }
                  }
                  className="bg-surface border border-wire rounded-xl p-2.5"
                >
                  <p className="text-copper font-bold text-sm leading-none">
                    {value}
                  </p>
                  <p className="text-[9px] text-ink-ghost mt-1 leading-none">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Table label */}
            <div className="mb-1.5">
              <span className="text-[9px] font-semibold text-ink-ghost uppercase tracking-widest">
                Viimeisimmät tapahtumat
              </span>
            </div>

            {/* Table rows */}
            <div className="space-y-1.5">
              {ROWS.map(({ label, user, status, value }, i) => (
                <motion.div
                  key={label}
                  initial={reduced ? undefined : { opacity: 0, x: -6 }}
                  animate={reduced ? undefined : { opacity: 1, x: 0 }}
                  transition={
                    reduced
                      ? undefined
                      : { duration: 0.3, delay: 0.2 + i * 0.12 }
                  }
                  className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-wire"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      status === "ok" ? "bg-ok/70" : "bg-copper/70"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-ink truncate">
                      {label}
                    </p>
                    <p className="text-[9px] text-ink-ghost truncate">{user}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold shrink-0 ${
                      status === "ok" ? "text-ok/80" : "text-copper"
                    }`}
                  >
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

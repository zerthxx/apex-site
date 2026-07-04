"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Zap, TrendingUp } from "lucide-react";
import { useRevealInView } from "@/lib/useRevealInView";

const PHASES = [
  {
    step: "01",
    icon: AlertTriangle,
    label: "Ennen",
    title: "Yritykseltäsi puuttuu kilpailukykyinen digitaalinen läsnäolo",
    points: [
      "Vanha tai puuttuva verkkosivusto",
      "Ei myyntiä verkosta",
      "Kilpailijat edellä digitaalisesti",
      "Manuaaliset prosessit hidastavat kasvua",
    ],
    variant: "bad",
  },
  {
    step: "02",
    icon: Zap,
    label: "Rakennamme ratkaisun",
    title: "Suunnittelemme ja rakennamme räätälöidyn digitaalisen ratkaisun",
    points: [
      "Kartoitus ja strategia",
      "Moderni design ja kehitys",
      "Testaus ja optimointi",
      "Julkaisu ja käyttöönotto",
    ],
    variant: "copper",
  },
  {
    step: "03",
    icon: TrendingUp,
    label: "Yrityksesi kasvaa",
    title: "Digitaaliset kanavasi tuovat lisää asiakkaita ja myyntiä",
    points: [
      "Enemmän kävijöitä ja liidejä",
      "Parempi konversio",
      "Automaattiset prosessit",
      "Mitattava kasvu",
    ],
    variant: "ok",
  },
] as const;

const VARIANT_STYLES = {
  bad: {
    bg: "bg-bad/8 border-bad/25",
    icon: "text-bad/80",
    iconBg: "bg-bad/10 border-bad/20",
    dot: "bg-bad/60",
    label: "text-bad/80",
    step: "text-bad/40",
  },
  copper: {
    bg: "bg-copper/8 border-copper/25",
    icon: "text-copper",
    iconBg: "bg-copper/10 border-copper/20",
    dot: "bg-copper/60",
    label: "text-copper",
    step: "text-copper/40",
  },
  ok: {
    bg: "bg-ok/8 border-ok/25",
    icon: "text-ok/80",
    iconBg: "bg-ok/10 border-ok/20",
    dot: "bg-ok/60",
    label: "text-ok/80",
    step: "text-ok/40",
  },
};

export function HowWeHelpSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useRevealInView(ref);

  return (
    <section ref={ref} className="py-20 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            Miten autamme
          </p>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
            Miten autamme yritystäsi kasvamaan?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-[3.25rem] left-[calc(33.333%+1rem)] right-[calc(33.333%+1rem)] h-px">
            <div className="h-full bg-gradient-to-r from-bad/30 via-copper/30 to-ok/30" />
          </div>

          {PHASES.map(
            ({ step, icon: Icon, label, title, points, variant }, i) => {
              const s = VARIANT_STYLES[variant];
              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 24 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: i * 0.12 }}
                  className={`relative rounded-xl border p-6 ${s.bg}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${s.iconBg}`}
                    >
                      <Icon size={20} className={s.icon} />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-widest ${s.label}`}
                      >
                        {step} — {label}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-heading font-semibold text-ink text-sm leading-snug mb-4">
                    {title}
                  </h3>

                  <ul className="space-y-2">
                    {points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-xs text-ink-dim"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1 ${s.dot}`}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>

                  {/* Mobile arrow */}
                  {i < 2 && (
                    <div className="md:hidden flex justify-center pt-5 pb-1">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-wire"
                      >
                        <path
                          d="M12 5v14M5 12l7 7 7-7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";
import { useRevealInView } from "@/lib/useRevealInView";

const STATS = [
  { value: 50, suffix: "+", label: "Toimitettua projektia", decimals: 0 },
  { value: 4.9, suffix: "★", label: "Tähden arvio", decimals: 1 },
  { value: 94, suffix: "%", label: "Ajallaan toimitettu", decimals: 0 },
  { value: 3, suffix: "v+", label: "Kokemus alalta", decimals: 0 },
];

function AnimatedNumber({
  value,
  suffix,
  decimals,
  inView,
}: {
  value: number;
  suffix: string;
  decimals: number;
  inView: boolean;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(decimals) + suffix);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
    return controls.stop;
  }, [inView, value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref, "-60px");

  return (
    <section className="bg-surface border-y border-wire py-10 md:py-14">
      <div ref={ref} className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-1"
            >
              <p className="font-display font-bold text-4xl md:text-5xl text-copper tabular-nums">
                <AnimatedNumber
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  inView={isInView}
                />
              </p>
              <p className="text-ink-ghost text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

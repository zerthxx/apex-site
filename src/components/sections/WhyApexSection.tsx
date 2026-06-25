"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Timer, Code2, Building2, HeartHandshake, type LucideProps } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { DIFFERENTIATORS } from "@/lib/constants";
import { fadeUp, slideInLeft, staggerContainer } from "@/lib/animations";

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Timer, Code2, Building2, HeartHandshake,
};

export function WhyApexSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 md:py-28 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: heading */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:sticky lg:top-28"
          >
            <SectionHeader
              eyebrow="Miksi Apex Site"
              heading="Neljä syytä valita meidät"
              subheading="Emme ole vain toinen toimisto. Tässä on mitä erottaa meidät."
              align="left"
            />
          </motion.div>

          {/* Right: differentiators */}
          <motion.div
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {DIFFERENTIATORS.map((item, i) => {
              const Icon = ICON_MAP[item.icon] ?? Timer;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="relative flex flex-col gap-3 p-6 rounded-xl border border-wire bg-elevated overflow-hidden"
                >
                  <span
                    aria-hidden
                    className="absolute top-2 right-4 font-display text-7xl font-bold text-copper/[0.06] select-none leading-none pointer-events-none"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-ink text-base mb-1">
                      {item.title}
                    </h3>
                    <p className="text-copper text-sm font-semibold mb-2">{item.proof}</p>
                    <p className="text-ink-ghost text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

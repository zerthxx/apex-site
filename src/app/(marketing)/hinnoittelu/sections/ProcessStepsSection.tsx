"use client";

import { motion } from "motion/react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { PRICING_STEPS } from "../data";

export function ProcessStepsSection() {
  return (
    <section className="py-12 bg-surface/30">
      <Container>
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl">
            Miten hinnoittelu muodostuu?
          </h2>
          <p className="text-ink-dim text-sm mt-2">
            Hinta ei ole satunnainen — se syntyy selkeän prosessin kautta.
          </p>
        </div>
        <RevealGroup className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 max-w-3xl mx-auto">
          {PRICING_STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-9 h-9 rounded-full bg-copper/10 border border-copper/30 flex items-center justify-center text-copper font-bold text-sm">
                  {step.num}
                </div>
                <span className="text-[11px] font-medium text-ink-dim text-center whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {i < PRICING_STEPS.length - 1 && (
                <span className="text-ink-ghost hidden sm:inline mx-2 mb-5">
                  →
                </span>
              )}
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { TRUST_STATS } from "../data";

export function TrustStatsSection() {
  return (
    <section className="py-16">
      <Container className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
          Tulokset puhuvat puolestaan
        </p>
        <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10">
          Miksi asiakkaat valitsevat Apex Siten?
        </h2>
        <RevealGroup className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {TRUST_STATS.map(({ value, label }) => (
            <motion.div key={label} variants={fadeUp} className="text-center">
              <p className="text-4xl font-bold text-copper leading-none">
                {value}
              </p>
              <p className="text-sm text-ink-dim mt-2">{label}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

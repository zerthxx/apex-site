"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { INCLUDED } from "../data";

export function IncludedSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            Jokaisessa projektissa
          </p>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
            Mitä kaikki projektit sisältävät?
          </h2>
          <p className="text-ink-dim max-w-md mx-auto">
            Nämä kuuluvat jokaiseen projektiimme — riippumatta koosta tai
            paketista.
          </p>
        </div>
        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {INCLUDED.map((item) => (
            <motion.div
              key={item}
              variants={fadeUp}
              className="p-5 rounded-xl border border-wire bg-elevated flex items-center gap-3 hover:border-copper/30 transition-colors"
            >
              <CheckCircle2 size={18} className="text-copper shrink-0" />
              <span className="font-heading font-semibold text-ink text-sm">
                {item}
              </span>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

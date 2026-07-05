"use client";

import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { PRICING_REASONS } from "../data";

export function ReasonsSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            Läpinäkyvä hinnoittelu
          </p>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
            Miksi hinnat alkavat tästä?
          </h2>
          <p className="text-ink-dim max-w-lg mx-auto">
            Jokainen projekti on erilainen. Lopullinen hinta määräytyy
            yrityksesi tarpeiden, ominaisuuksien ja projektin laajuuden mukaan.
          </p>
        </div>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_REASONS.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200"
            >
              <CheckCircle2 size={20} className="text-copper mb-3" />
              <h3 className="font-heading font-semibold text-ink mb-2">
                {item.title}
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

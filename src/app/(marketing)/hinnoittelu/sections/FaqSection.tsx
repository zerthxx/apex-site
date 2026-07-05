"use client";

import { motion } from "motion/react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { FAQ } from "../data";

export function FaqSection() {
  return (
    <section className="py-16 bg-surface/30">
      <Container className="max-w-2xl">
        <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8">
          Usein kysyttyä hinnoittelusta
        </h2>
        <RevealGroup className="space-y-6">
          {FAQ.map((item) => (
            <motion.div
              key={item.q}
              variants={fadeUp}
              className="border-b border-wire pb-6"
            >
              <h3 className="font-heading font-semibold text-ink mb-2">
                {item.q}
              </h3>
              <p className="text-ink-dim text-sm leading-relaxed">{item.a}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

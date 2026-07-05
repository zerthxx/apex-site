"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { ADD_ONS } from "../data";

export function AddOnsSection() {
  return (
    <section className="py-16 bg-surface/30">
      <Container>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
            Lisäpalvelut
          </span>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-3">
            Yksittäiset lisäykset
          </h2>
          <p className="text-ink-dim max-w-lg mx-auto">
            Tarvitsetko vain yhden ominaisuuden? Lisätään se sivustollesi ilman
            koko pakettia.
          </p>
        </div>
        <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {ADD_ONS.map((addon) => (
            <motion.div
              key={addon.name}
              variants={fadeUp}
              className="flex items-start gap-2.5 p-3 rounded-xl border border-wire bg-elevated hover:border-copper/30 transition-colors"
            >
              <CheckCircle2 size={13} className="text-copper shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink text-xs leading-tight">
                  {addon.name}
                </p>
                <p className="text-copper font-bold text-xs mt-0.5">
                  {addon.price}
                </p>
                <p className="text-ink-ghost text-[10px] leading-relaxed mt-1">
                  {addon.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </RevealGroup>
        <div className="text-center mt-8">
          <Link
            href="/yhteystiedot"
            className="inline-flex items-center gap-2 text-sm font-medium text-copper hover:text-copper-light transition-colors"
          >
            Kysy lisäpalvelusta <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

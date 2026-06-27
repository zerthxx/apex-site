"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { FAQ_HOME } from "@/lib/constants";
import { slideInLeft, fadeUp } from "@/lib/animations";

export function FaqTeaserSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-10 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
        >
          {/* Left */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:sticky lg:top-28 flex flex-col gap-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-brand">
              UKK
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
              Usein kysytyt kysymykset
            </h2>
            <p className="text-ink-dim leading-relaxed">
              Löydät vastaukset yleisimpiin kysymyksiin alta. Jos et löydä vastausta, ota yhteyttä suoraan.
            </p>
            <Link
              href="/ukk"
              className="inline-flex items-center gap-2 text-copper text-sm font-semibold hover:gap-3 transition-all duration-150 mt-2"
            >
              Näe kaikki kysymykset <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Right */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <FaqAccordion items={FAQ_HOME} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}


"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COMPANY_PHONE } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useRevealInView } from "@/lib/useRevealInView";

export function ContactCtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref);

  return (
    <section className="relative py-12 md:py-24 overflow-hidden bg-elevated border-t border-wire">
      {/* Mesh gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-copper/10 blur-[160px] translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-teal-brand/8 blur-[120px] -translate-x-1/4 translate-y-1/3" />
        <div className="absolute inset-0 bg-gradient-to-t from-base/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-2xl mx-auto text-center flex flex-col gap-6"
        >
          <motion.h2
            variants={fadeUp}
            className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight tracking-tight"
          >
            Onko sinulla projekti <span className="text-copper">mielessä</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-ink-dim text-lg leading-relaxed"
          >
            Varaa maksuton 30 minuutin kartoituspuhelu. Kerromme miten voimme
            auttaa — ilman sitoumuksia.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" asChild>
              <Link href="/yhteystiedot">Pyydä tarjous</Link>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              asChild
              leftIcon={<Phone size={18} />}
            >
              <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>
                {COMPANY_PHONE}
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-ghost"
          >
            <span>Vastaamme 24 tunnin sisällä</span>
            <span className="text-wire-bold hidden sm:inline">·</span>
            <span>Ei sitoumuksia</span>
            <span className="text-wire-bold hidden sm:inline">·</span>
            <span>Ilmainen kartoitus</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COMPANY_PHONE } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";

export function ContactCtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-elevated border-t border-wire">
      {/* Background orb */}
      <div
        aria-hidden
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-copper/8 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-teal-brand/5 blur-[100px] pointer-events-none"
      />

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
            Onko sinulla projekti{" "}
            <span className="text-copper">mielessä?</span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-ink-dim text-lg leading-relaxed">
            Varaa maksuton 30 minuutin kartoituspuhelu. Kerromme miten voimme auttaa
            — ilman sitoumuksia.
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
              <a href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}>{COMPANY_PHONE}</a>
            </Button>
          </motion.div>

          <motion.p variants={fadeUp} className="text-xs text-ink-ghost">
            Vastaamme 24 tunnin sisällä · Ei sitoumuksia · Ilmainen kartoitus
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

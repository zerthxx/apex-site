"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { PROCESS_STEPS } from "@/lib/constants";
import { fadeUp } from "@/lib/animations";

export function ProcessTeaserSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-10 md:py-20 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <SectionHeader
            eyebrow="Prosessimme"
            heading="Miten työskentelemme"
            subheading="Selkeä prosessi, läpinäkyvä kommunikaatio ja tulokset aikataulussa."
            className="mb-14"
          />

          <ProcessSteps steps={PROCESS_STEPS} variant="horizontal" />

          <div className="mt-10 text-center">
            <Link
              href="/prosessi"
              className="inline-flex items-center gap-2 text-copper text-sm font-semibold hover:gap-3 transition-all duration-150"
            >
              Katso koko prosessimme <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


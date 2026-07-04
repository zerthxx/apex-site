"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { SERVICES } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useRevealInView } from "@/lib/useRevealInView";

export function ServicesGridSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref);

  return (
    <section className="py-10 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Palvelumme"
          heading="Mitä rakennamme"
          subheading="Kaikki digitaaliset palvelut yhdestä paikasta — suunnittelusta tuotantoon."
          className="mb-12"
        />

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {SERVICES.map((service) => (
            <motion.div key={service.id} variants={fadeUp}>
              <ServiceCard service={service} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

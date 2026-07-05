"use client";

import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { SERVICES } from "@/lib/constants";
import { fadeUp } from "@/lib/animations";

export function ServicesGridSection() {
  return (
    <section className="py-16 md:py-24 lg:py-32">
      <Container>
        <SectionHeader
          eyebrow="Palvelumme"
          heading="Mitä rakennamme"
          subheading="Kaikki digitaaliset palvelut yhdestä paikasta — suunnittelusta tuotantoon."
          className="mb-12"
        />

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {SERVICES.map((service) => (
            <motion.div key={service.id} variants={fadeUp}>
              <ServiceCard service={service} className="h-full" />
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

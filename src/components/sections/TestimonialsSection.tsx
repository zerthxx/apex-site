"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Container } from "@/components/shared/Container";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { TESTIMONIALS } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useRevealInView } from "@/lib/useRevealInView";

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref);

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-surface/30">
      <Container>
        <SectionHeader
          eyebrow="Asiakkaat"
          heading="Mitä asiakkaamme sanovat"
          subheading="Emme väitä olevamme parhaita — asiakkaamme sanovat sen puolestamme."
          className="mb-12"
        />

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((testimonial, i) => (
            <motion.div key={testimonial.id} variants={fadeUp}>
              <TestimonialCard
                testimonial={testimonial}
                index={i}
                className="h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

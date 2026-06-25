"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { TESTIMONIALS } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 md:py-28 bg-surface/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          {TESTIMONIALS.map((testimonial) => (
            <motion.div key={testimonial.id} variants={fadeUp}>
              <TestimonialCard testimonial={testimonial} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

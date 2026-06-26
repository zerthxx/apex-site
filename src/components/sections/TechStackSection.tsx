"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TECH_STACK } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Frontend", "Backend", "Mobile", "Cloud", "AI", "CMS"] as const;

export function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-10 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Teknologia"
          heading="Teknologiat, joita kÃ¤ytÃ¤mme"
          subheading="Valitsemme aina oikean teknologian kullekin projektille."
          className="mb-12"
        />

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-8"
        >
          {CATEGORIES.map((category) => {
            const items = TECH_STACK.filter((t) => t.category === category);
            if (!items.length) return null;
            return (
              <motion.div key={category} variants={fadeUp} className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-ghost">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((tech) => (
                    <div
                      key={tech.name}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg",
                        "border border-wire bg-surface",
                        "hover:border-copper/30 hover:bg-elevated",
                        "transition-all duration-200 group"
                      )}
                    >
                      <span className="text-sm font-medium text-ink-dim group-hover:text-ink transition-colors duration-150">
                        {tech.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}


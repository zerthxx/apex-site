"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { CaseStudyCard } from "@/components/shared/CaseStudyCard";
import { MOCK_CASE_STUDIES } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/animations";

export function PortfolioPreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
          <SectionHeader
            eyebrow="Portfolio"
            heading="Viimeisimmät projektimme"
            align="left"
          />
          <Link
            href="/portfolio"
            className="flex items-center gap-2 text-copper text-sm font-semibold hover:gap-3 transition-all duration-150 shrink-0"
          >
            Katso kaikki projektit <ArrowRight size={16} />
          </Link>
        </div>

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {MOCK_CASE_STUDIES.map((study) => (
            <motion.div key={study.slug} variants={fadeUp}>
              <CaseStudyCard study={study} className="h-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Phone,
  FileText,
  Code2,
  Rocket,
  HeartHandshake,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { fadeUp } from "@/lib/animations";
import { useRevealInView } from "@/lib/useRevealInView";

const QUICK_STEPS = [
  { num: "01", title: "Maksuton kartoitus", icon: Phone },
  { num: "02", title: "Saat tarjouksen", icon: FileText },
  { num: "03", title: "Aloitamme kehityksen", icon: Code2 },
  { num: "04", title: "Julkaisemme ratkaisun", icon: Rocket },
  { num: "05", title: "Jatkuva ylläpito", icon: HeartHandshake },
];

export function ProcessTeaserSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useRevealInView(ref);

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
            eyebrow="Aloittaminen"
            heading="Näin projekti alkaa"
            subheading="Selkeä prosessi, läpinäkyvä kommunikaatio ja tulokset aikataulussa."
            className="mb-14"
          />

          {/* Timeline */}
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-0">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-5 left-[10%] right-[10%] h-px bg-gradient-to-r from-copper/10 via-copper/30 to-copper/10" />

            {QUICK_STEPS.map(({ num, title, icon: Icon }, i) => (
              <div
                key={num}
                className="relative flex flex-col items-center flex-1 text-center px-2"
              >
                {/* Number circle */}
                <div className="relative z-10 w-10 h-10 rounded-full border border-copper/40 bg-elevated flex items-center justify-center mb-3 shadow-glow">
                  <Icon size={16} className="text-copper" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-copper/60 mb-1">
                  {num}
                </span>
                <p className="text-xs sm:text-sm text-ink-dim font-medium leading-snug max-w-[100px]">
                  {title}
                </p>

                {/* Mobile arrow */}
                {i < QUICK_STEPS.length - 1 && (
                  <div className="md:hidden mt-3 text-wire">
                    <ArrowRight size={16} className="rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

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

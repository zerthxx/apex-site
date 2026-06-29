"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type Step = { title: string; text: string };

export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="max-w-2xl mx-auto relative">
      {/* Static background line */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-wire/30" aria-hidden />

      {/* Animated copper fill line */}
      {!reduced && (
        <motion.div
          className="absolute left-5 top-5 w-px bg-gradient-to-b from-copper to-copper/30 origin-top"
          style={{ height: lineHeight }}
          aria-hidden
        />
      )}

      {steps.map((step, i) => (
        <div key={step.title} className="flex gap-5">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full border-2 border-copper bg-surface text-copper font-bold text-sm flex items-center justify-center z-10 relative">
              {String(i + 1).padStart(2, "0")}
            </div>
          </div>
          <div className="pb-8 pt-1.5">
            <h3 className="font-heading font-semibold text-ink mb-1">{step.title}</h3>
            <p className="text-ink-dim text-sm leading-relaxed">{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardCarouselProps {
  children: React.ReactNode[];
  className?: string;
  defaultIndex?: number;
}

export function CardCarousel({ children, className, defaultIndex = 0 }: CardCarouselProps) {
  const [index, setIndex] = useState(defaultIndex);
  const [direction, setDirection] = useState(1);
  const total = children.length;

  const prev = () => { setDirection(-1); setIndex((i) => Math.max(0, i - 1)); };
  const next = () => { setDirection(1); setIndex((i) => Math.min(total - 1, i + 1)); };
  const goTo = (i: number) => { setDirection(i > index ? 1 : -1); setIndex(i); };

  return (
    <div className={cn("relative", className)}>
      <div className="md:hidden">
        {/* Side margins give space for ghost cards to peek */}
        <div className="relative" style={{ marginInline: "56px" }}>

          {/* Left ghost — previous card with content */}
          {index > 0 && (
            <div
              aria-hidden
              className="absolute inset-0 overflow-hidden rounded-xl"
              style={{ transform: "translateX(-56px)", zIndex: 1, opacity: 0.55, pointerEvents: "none" }}
            >
              {children[index - 1]}
            </div>
          )}

          {/* Right ghost — next card with content */}
          {index < total - 1 && (
            <div
              aria-hidden
              className="absolute inset-0 overflow-hidden rounded-xl"
              style={{ transform: "translateX(56px)", zIndex: 1, opacity: 0.55, pointerEvents: "none" }}
            >
              {children[index + 1]}
            </div>
          )}

          {/* Fixed-height grid: all cards rendered hidden to lock the height at the tallest card */}
          <div style={{ display: "grid", position: "relative", zIndex: 10, perspective: "1000px" }}>
            {children.map((child, i) => (
              <div
                key={`sizer-${i}`}
                aria-hidden
                style={{ gridArea: "1/1", visibility: "hidden", pointerEvents: "none" }}
              >
                {child}
              </div>
            ))}

            {/* Active card — no mode="wait" so enter+exit animate simultaneously */}
            <AnimatePresence initial={false}>
              <motion.div
                key={index}
                initial={{ x: direction * 90, opacity: 0, scale: 0.88, rotateY: direction * 18 }}
                animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0, zIndex: 2 }}
                exit={{ x: direction * -90, opacity: 0, scale: 0.88, rotateY: direction * -18, zIndex: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 42,
                  opacity: { duration: 0.14, ease: "easeOut" },
                  rotateY: { type: "spring", stiffness: 420, damping: 42 },
                }}
                style={{ gridArea: "1/1", transformStyle: "preserve-3d" }}
              >
                {children[index]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrows + dots */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={prev}
            disabled={index === 0}
            className="w-9 h-9 rounded-full border border-wire bg-elevated flex items-center justify-center text-ink-dim hover:text-copper hover:border-copper/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Edellinen"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1.5">
            {children.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === index ? "bg-copper w-4" : "bg-wire-bold w-1.5"
                )}
                aria-label={`Siirry kortille ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={index === total - 1}
            className="w-9 h-9 rounded-full border border-wire bg-elevated flex items-center justify-center text-ink-dim hover:text-copper hover:border-copper/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Seuraava"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:contents">
        {children}
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface CardCarouselProps {
  children: React.ReactNode[];
  className?: string;
  defaultIndex?: number;
}

export function CardCarousel({
  children,
  className,
  defaultIndex = 0,
}: CardCarouselProps) {
  const [index, setIndex] = useState(defaultIndex);
  const [direction, setDirection] = useState(1);
  const [animating, setAnimating] = useState(false);
  const total = children.length;

  const goTo = useCallback(
    (newIndex: number, dir: number) => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setIndex(newIndex);
      setTimeout(() => setAnimating(false), 400);
    },
    [animating],
  );

  const prev = () => goTo(Math.max(0, index - 1), -1);
  const next = () => goTo(Math.min(total - 1, index + 1), 1);

  return (
    <div className={cn("relative", className)}>
      <div className="md:hidden">
        <div className="relative" style={{ marginInline: "56px" }}>
          {/* Left ghost — hidden during animation */}
          {!animating && index > 0 && (
            <div
              aria-hidden
              className="absolute inset-0 overflow-hidden rounded-xl"
              style={{
                transform: "translateX(-56px)",
                zIndex: 1,
                opacity: 0.55,
                pointerEvents: "none",
              }}
            >
              {children[index - 1]}
            </div>
          )}

          {/* Right ghost — hidden during animation */}
          {!animating && index < total - 1 && (
            <div
              aria-hidden
              className="absolute inset-0 overflow-hidden rounded-xl"
              style={{
                transform: "translateX(56px)",
                zIndex: 1,
                opacity: 0.55,
                pointerEvents: "none",
              }}
            >
              {children[index + 1]}
            </div>
          )}

          {/* Fixed-height grid */}
          <div
            style={{
              display: "grid",
              position: "relative",
              zIndex: 10,
              perspective: "1000px",
            }}
          >
            {children.map((child, i) => (
              <div
                key={`sizer-${i}`}
                aria-hidden
                style={{
                  gridArea: "1/1",
                  visibility: "hidden",
                  pointerEvents: "none",
                }}
              >
                {child}
              </div>
            ))}

            <div className="animate-float-card" style={{ gridArea: "1/1" }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={index}
                  initial={{ x: direction * 90, opacity: 0, scale: 0.9 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: direction * -90, opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.25,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {children[index]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Arrows + dots */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={prev}
            disabled={index === 0}
            className="w-11 h-11 rounded-full border-2 border-copper/50 bg-elevated flex items-center justify-center text-copper hover:bg-copper hover:text-ink-flip hover:border-copper disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-md"
            aria-label="Edellinen"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-1.5">
            {children.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  i === index ? "bg-copper w-4" : "bg-wire-bold w-1.5",
                )}
                aria-label={`Siirry kortille ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={index === total - 1}
            className="w-11 h-11 rounded-full border-2 border-copper/50 bg-elevated flex items-center justify-center text-copper hover:bg-copper hover:text-ink-flip hover:border-copper disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-md"
            aria-label="Seuraava"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:contents">{children}</div>
    </div>
  );
}

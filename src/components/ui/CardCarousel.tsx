"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardCarouselProps {
  children: React.ReactNode[];
  className?: string;
}

export function CardCarousel({ children, className }: CardCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = children.length;

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(total - 1, i + 1));

  return (
    <div className={cn("relative", className)}>
      {/* Mobile carousel */}
      <div className="md:hidden">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {children.map((child, i) => (
              <div key={i} className="w-full shrink-0 px-1">
                {child}
              </div>
            ))}
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
                onClick={() => setIndex(i)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  i === index ? "bg-copper w-4" : "bg-wire-bold"
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

      {/* Desktop grid — passed via className on parent */}
      <div className="hidden md:contents">
        {children}
      </div>
    </div>
  );
}

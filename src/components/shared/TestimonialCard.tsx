"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Testimonial } from "@/lib/types";

const AVATAR_COLORS = [
  "bg-copper/20 border-copper/30 text-copper",
  "bg-teal-brand/20 border-teal-brand/30 text-teal-brand",
];

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
  index?: number;
}

export function TestimonialCard({
  testimonial: t,
  className,
  index = 0,
}: TestimonialCardProps) {
  return (
    <TiltCard className="h-full" intensity={4}>
      <div
        className={cn(
          "flex flex-col gap-5 p-6 rounded-xl bg-surface border border-wire h-full transition-all duration-300 hover:-translate-y-1 hover:border-copper/30 hover:shadow-card-hover",
          className,
        )}
      >
        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={cn(
                i < t.rating ? "text-copper fill-copper" : "text-wire-bold",
              )}
            />
          ))}
        </div>

        {/* Large quote mark */}
        <span
          aria-hidden
          className="font-display text-7xl text-copper/20 leading-none -mb-6 -mt-2 select-none"
        >
          &quot;
        </span>

        {/* Quote */}
        <p className="text-ink-dim text-[0.9375rem] italic leading-relaxed">
          &ldquo;{t.quote}&rdquo;
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-wire">
          <div
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold shrink-0 select-none",
              AVATAR_COLORS[index % AVATAR_COLORS.length],
            )}
          >
            {t.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-heading font-semibold text-ink text-sm">
              {t.name}
            </p>
            <p className="text-ink-ghost text-xs">
              {t.role}, {t.company}
            </p>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

import Image from "next/image";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/lib/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export function TestimonialCard({ testimonial: t, className }: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 p-6 rounded-xl bg-surface border border-wire",
        className
      )}
    >
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={cn(
              i < t.rating ? "text-copper fill-copper" : "text-wire-bold"
            )}
          />
        ))}
      </div>

      {/* Large quote mark */}
      <span
        aria-hidden
        className="font-display text-7xl text-copper/20 leading-none -mb-6 -mt-2 select-none"
      >
        "
      </span>

      {/* Quote */}
      <p className="text-ink-dim text-base italic leading-relaxed">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-wire">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-elevated shrink-0">
          <Image
            src={t.avatar}
            alt={t.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <p className="font-heading font-semibold text-ink text-sm">{t.name}</p>
          <p className="text-ink-ghost text-xs">
            {t.role}, {t.company}
          </p>
        </div>
      </div>
    </div>
  );
}

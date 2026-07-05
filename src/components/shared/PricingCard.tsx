"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { TiltCard } from "@/components/ui/TiltCard";

export type PricingCardVariant = "neutral" | "copper" | "teal";

const VARIANT_CLASSES: Record<PricingCardVariant, string> = {
  neutral: "gradient-border-white bg-elevated",
  copper: "gradient-border bg-elevated shadow-glow",
  teal: "gradient-border-teal bg-elevated",
};

interface PricingCardProps {
  name: string;
  variant: PricingCardVariant;
  badge?: string;
  priceLine: React.ReactNode;
  description?: string;
  features: string[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  onClick?: () => void;
  className?: string;
}

export function PricingCard({
  name,
  variant,
  badge,
  priceLine,
  description,
  features,
  primaryCta,
  secondaryCta,
  onClick,
  className,
}: PricingCardProps) {
  return (
    <TiltCard className="h-full" intensity={4}>
      <div
        onClick={onClick}
        className={cn(
          "p-6 rounded-xl border flex flex-col h-full transition-all duration-300 hover:-translate-y-1",
          onClick && "cursor-pointer hover:opacity-90",
          VARIANT_CLASSES[variant],
          className,
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-ink text-xl">{name}</h3>
          {badge && (
            <Badge variant="accent" className="ring-1 ring-copper/40">
              {badge}
            </Badge>
          )}
        </div>

        <div className="mb-3">{priceLine}</div>

        {description && (
          <p className="text-ink-dim text-sm mb-4 leading-relaxed">
            {description}
          </p>
        )}

        <ul className="space-y-2 flex-1 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-ink-dim">
              <CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        {secondaryCta ? (
          <div className="flex items-center justify-between pt-3 border-t border-wire/40">
            <Link
              href={secondaryCta.href}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-ink-dim hover:text-ink transition-colors"
            >
              {secondaryCta.label} <ArrowRight size={13} />
            </Link>
            <Link
              href={primaryCta.href}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm font-medium text-copper"
            >
              {primaryCta.label} <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <Link
            href={primaryCta.href}
            className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors"
          >
            {primaryCta.label} <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </TiltCard>
  );
}

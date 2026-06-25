"use client";

import Link from "next/link";
import {
  Globe, ShoppingCart, Smartphone, Cpu, Code2, Layers, ArrowRight,
  type LucideProps
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Service } from "@/lib/types";

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Globe, ShoppingCart, Smartphone, Cpu, Code2, Layers,
};

interface ServiceCardProps {
  service: Service;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const Icon = ICON_MAP[service.icon] ?? Globe;

  return (
    <TiltCard className={cn("h-full", className)}>
      <Link
        href={service.href}
        className={cn(
          "group flex flex-col gap-4 p-6 rounded-xl h-full",
          "bg-surface border border-wire",
          "hover:border-copper/30 hover:shadow-card-hover",
          "transition-all duration-300"
        )}
      >
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper group-hover:bg-copper/20 transition-colors duration-200">
          <Icon size={20} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-ink text-base mb-1.5 group-hover:text-copper transition-colors duration-150">
            {service.title}
          </h3>
          <p className="text-ink-dim text-sm leading-relaxed">{service.description}</p>
          {service.startingPrice && (
            <p className="text-xs text-ink-ghost mt-2">
              alkaen <span className="text-copper font-semibold">{service.startingPrice}</span>
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-1.5 text-copper text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span>Lue lisää</span>
          <ArrowRight size={14} />
        </div>
      </Link>
    </TiltCard>
  );
}

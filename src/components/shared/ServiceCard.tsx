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

const SERVICE_COLORS: Record<string, string> = {
  Globe:        "bg-blue-500/10 border-blue-500/20 text-blue-400",
  ShoppingCart: "bg-green-500/10 border-green-500/20 text-green-400",
  Smartphone:   "bg-purple-500/10 border-purple-500/20 text-purple-400",
  Cpu:          "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  Code2:        "bg-orange-500/10 border-orange-500/20 text-orange-400",
  Layers:       "bg-copper/10 border-copper/20 text-copper",
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
        <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center transition-colors duration-200", SERVICE_COLORS[service.icon] ?? SERVICE_COLORS.Layers)}>
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

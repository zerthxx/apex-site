import Image from "next/image";
import { cn } from "@/lib/utils";
import { TECH_STACK } from "@/lib/constants";
import type { TechItem } from "@/lib/types";

interface TechLogoCloudProps {
  filter?: TechItem["category"][];
  className?: string;
}

export function TechLogoCloud({ filter, className }: TechLogoCloudProps) {
  const items = filter
    ? TECH_STACK.filter((t) => filter.includes(t.category))
    : TECH_STACK;

  return (
    <div
      className={cn(
        "grid gap-3",
        "grid-cols-3 sm:grid-cols-4 md:grid-cols-6",
        className
      )}
    >
      {items.map((tech) => (
        <div
          key={tech.name}
          className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-wire bg-surface hover:border-copper/30 hover:bg-elevated transition-all duration-200"
        >
          <div className="relative w-8 h-8 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            <Image
              src={tech.logo}
              alt={tech.name}
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className="text-xs text-ink-ghost group-hover:text-ink-dim transition-colors duration-150 text-center leading-tight">
            {tech.name}
          </span>
        </div>
      ))}
    </div>
  );
}

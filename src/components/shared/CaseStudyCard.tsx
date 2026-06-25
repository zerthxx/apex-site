import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { CaseStudyPreview } from "@/lib/types";

interface CaseStudyCardProps {
  study: CaseStudyPreview;
  variant?: "preview" | "full";
  className?: string;
}

export function CaseStudyCard({ study, variant = "preview", className }: CaseStudyCardProps) {
  return (
    <Link
      href={`/portfolio/${study.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-wire bg-surface",
        "hover:border-copper/30 hover:shadow-card-hover transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative overflow-hidden bg-elevated",
          variant === "preview" ? "aspect-video" : "aspect-[4/3]"
        )}
      >
        <Image
          src={study.coverImage}
          alt={`${study.client} — ${study.title}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-base/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="teal" size="sm">{study.service}</Badge>
        </div>
        <div>
          <p className="text-ink-ghost text-xs font-medium uppercase tracking-wide mb-1">
            {study.client}
          </p>
          <h3 className="font-heading font-semibold text-ink text-base leading-snug group-hover:text-copper transition-colors duration-150">
            {study.title}
          </h3>
        </div>
        <p className="text-copper text-sm font-semibold">{study.outcome}</p>
        <div className="flex items-center gap-1 text-ink-ghost text-sm mt-auto pt-2 border-t border-wire group-hover:text-copper transition-colors duration-150">
          <span>Lue tapaustutkimus</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

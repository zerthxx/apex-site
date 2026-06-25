import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface SectionHeaderProps {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  heading,
  subheading,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <Badge variant="teal">{eyebrow}</Badge>}
      <h2
        className={cn(
          "font-display font-bold text-ink",
          "text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight"
        )}
      >
        {heading}
      </h2>
      {subheading && (
        <p
          className={cn(
            "text-ink-dim text-lg leading-relaxed",
            align === "center" && "max-w-2xl"
          )}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}

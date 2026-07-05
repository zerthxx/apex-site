import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

/** Shared max-width + gutter wrapper — the standard content container used across marketing pages. */
export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ children, className, as: Tag = "div" }, ref) => {
    return (
      <Tag
        ref={ref as never}
        className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}
      >
        {children}
      </Tag>
    );
  },
);
Container.displayName = "Container";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/** Standard section rhythm (vertical padding) + Container, for top-level marketing page sections. */
export function Section({
  children,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section className={cn("py-16 md:py-24 lg:py-32", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

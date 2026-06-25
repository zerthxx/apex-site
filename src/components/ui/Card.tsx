import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: React.ElementType;
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = "md", className, children, as: As = "div", ...props }, ref) => {
    return (
      <As
        ref={ref}
        className={cn(
          "bg-surface border border-wire rounded-xl",
          hover &&
            "transition-all duration-300 hover:border-copper/25 hover:shadow-card-hover cursor-pointer",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </As>
    );
  }
);
Card.displayName = "Card";

"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ButtonVariant, ButtonSize } from "@/lib/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-copper to-copper-light text-ink-flip font-semibold shadow-glow hover:shadow-glow focus-visible:ring-2 focus-visible:ring-copper/50 group overflow-hidden",
  secondary:
    "border border-wire-bold text-ink hover:border-copper hover:text-copper bg-transparent",
  ghost:
    "text-ink-dim hover:text-ink hover:bg-subtle bg-transparent",
  icon:
    "text-ink-dim hover:text-ink hover:bg-subtle bg-transparent aspect-square flex items-center justify-center",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-5 text-sm rounded-lg gap-2",
  lg: "h-12 px-7 text-base rounded-xl gap-2.5",
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-lg",
  lg: "h-12 w-12 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      asChild: _asChild,
      ...props
    },
    ref
  ) => {
    const isIcon = variant === "icon";

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
        whileTap={disabled || isLoading ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variants[variant],
          isIcon ? iconSizes[size] : sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        ) : null}
        {variant === "primary" && !isLoading && (
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] opacity-0 group-hover:opacity-100 animate-shimmer pointer-events-none"
          />
        )}
        <span className={cn("flex items-center gap-inherit", isLoading && "invisible")}>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  }
);
Button.displayName = "Button";

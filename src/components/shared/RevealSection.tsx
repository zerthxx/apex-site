"use client";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useRevealInView } from "@/lib/useRevealInView";

export function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useRevealInView(ref);

  return (
    <motion.div
      ref={ref}
      variants={reduced ? undefined : fadeUp}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-triggered stagger wrapper for grids/lists. Children should be
 * `motion.*` elements using the `fadeUp` variant (or pass their own) so they
 * inherit the "visible"/"hidden" animate state from this parent.
 */
export function RevealGroup({
  children,
  className,
  as: Component = motion.div,
}: {
  children: React.ReactNode;
  className?: string;
  as?: typeof motion.div | typeof motion.ul;
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useRevealInView(ref);

  return (
    <Component
      ref={ref}
      variants={reduced ? undefined : staggerContainer}
      initial={reduced ? undefined : "hidden"}
      animate={reduced ? undefined : inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </Component>
  );
}

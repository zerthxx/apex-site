"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useTransform, animate, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRevealInView } from "@/lib/useRevealInView";

interface AnimatedCounterProps {
  from?: number;
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  from = 0,
  to,
  suffix = "",
  prefix = "",
  duration = 1.5,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useRevealInView(ref, "-40px");
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, to, {
      duration,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [isInView, motionValue, to, duration]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

"use client";
import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
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

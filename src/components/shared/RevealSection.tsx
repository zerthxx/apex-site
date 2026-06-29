"use client";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { fadeUp } from "@/lib/animations";

export function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-80px" });

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

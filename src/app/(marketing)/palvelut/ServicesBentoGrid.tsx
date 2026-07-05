"use client";

import { motion } from "motion/react";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import type { Service } from "@/lib/types";

export function ServicesBentoGrid({ services }: { services: Service[] }) {
  return (
    <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, i) => (
        <motion.div
          key={service.id}
          variants={fadeUp}
          className={i === 0 ? "sm:col-span-2 lg:col-span-2" : undefined}
        >
          <ServiceCard service={service} className="h-full" />
        </motion.div>
      ))}
    </RevealGroup>
  );
}

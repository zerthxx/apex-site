"use client";

import { motion } from "motion/react";
import { Clock } from "lucide-react";
import { RevealGroup } from "@/components/shared/RevealSection";
import { fadeUp } from "@/lib/animations";
import { SERVICES } from "@/lib/constants";
import { ICON_MAP } from "@/lib/serviceIcons";

export function PortfolioComingSoon() {
  return (
    <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {SERVICES.slice(0, 4).map((service) => {
        const Icon = ICON_MAP[service.icon];
        return (
          <motion.div
            key={service.id}
            variants={fadeUp}
            className="relative rounded-xl border border-dashed border-wire-bold bg-elevated/40 p-5 flex flex-col gap-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center text-copper">
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-surface border border-wire text-ink-ghost">
                <Clock size={11} /> Tulossa
              </span>
            </div>
            <h3 className="font-heading font-semibold text-ink-dim text-sm">
              {service.title}
            </h3>
            <p className="text-ink-ghost text-xs leading-relaxed">
              Referenssi julkaistaan pian tähän kategoriaan.
            </p>
          </motion.div>
        );
      })}
    </RevealGroup>
  );
}

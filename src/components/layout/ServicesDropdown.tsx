"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, ShoppingCart, Smartphone, Cpu, Code2, type LucideProps
} from "lucide-react";
import { dropdownMenu } from "@/lib/animations";
import { SERVICES } from "@/lib/constants";

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Globe, ShoppingCart, Smartphone, Cpu, Code2,
};

interface ServicesDropdownProps {
  isOpen: boolean;
}

export function ServicesDropdown({ isOpen }: ServicesDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={dropdownMenu}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] max-w-[90vw]"
        >
          <div className="rounded-2xl border border-wire bg-elevated shadow-modal p-2 grid grid-cols-2 gap-1">
            {SERVICES.slice(0, 5).map((service) => {
              const Icon = ICON_MAP[service.icon] ?? Globe;
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-subtle transition-colors duration-150 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-copper/10 border border-copper/15 flex items-center justify-center text-copper shrink-0 group-hover:bg-copper/20 transition-colors duration-150 mt-0.5">
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink group-hover:text-copper transition-colors duration-150">
                      {service.title}
                    </p>
                    <p className="text-xs text-ink-ghost leading-snug mt-0.5">
                      {service.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

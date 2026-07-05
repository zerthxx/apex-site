"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS, SERVICES } from "@/lib/constants";
import { mobileMenuOverlay, mobileMenuPanel } from "@/lib/animations";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={mobileMenuOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-base/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            variants={mobileMenuPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 z-50 w-80 max-w-full bg-elevated border-l border-wire flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-wire">
              <Link
                href="/"
                onClick={onClose}
                className="font-display font-bold text-xl text-ink"
              >
                Apex Site
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="text-ink-ghost hover:text-ink transition-colors p-2 rounded-lg hover:bg-subtle"
                aria-label="Sulje valikko"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    {link.dropdown ? (
                      <div>
                        <button
                          type="button"
                          onClick={() => setServicesOpen((v) => !v)}
                          className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-ink-dim hover:text-ink hover:bg-subtle transition-colors duration-150 font-medium"
                        >
                          <span>{link.label}</span>
                          <motion.span
                            animate={{ rotate: servicesOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={16} />
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {servicesOpen && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden pl-4 flex flex-col gap-1"
                            >
                              {SERVICES.slice(0, 5).map((service) => (
                                <li key={service.id}>
                                  <Link
                                    href={service.href}
                                    onClick={onClose}
                                    className="block px-4 py-2.5 rounded-xl text-ink-ghost hover:text-ink hover:bg-subtle transition-colors duration-150 text-sm"
                                  >
                                    {service.title}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="block px-4 py-3 rounded-xl text-ink-dim hover:text-ink hover:bg-subtle transition-colors duration-150 font-medium"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Bottom CTA */}
            <div className="p-4 border-t border-wire">
              <Button size="lg" asChild className="w-full">
                <Link href="/yhteystiedot" onClick={onClose}>
                  Pyydä tarjous
                </Link>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { ServicesDropdown } from "./ServicesDropdown";
import { NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-30 transition-all duration-300",
          scrolled
            ? "bg-base/95 backdrop-blur-md border-b border-wire shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="font-display font-bold text-xl text-ink hover:text-copper transition-colors duration-150"
            >
              Apex Site
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href} ref={link.dropdown ? servicesRef : undefined} className="relative">
                    {link.dropdown ? (
                      <>
                        <button
                          type="button"
                          onMouseEnter={() => setServicesOpen(true)}
                          onMouseLeave={() => setServicesOpen(false)}
                          onClick={() => setServicesOpen((v) => !v)}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-ink-dim hover:text-ink transition-colors duration-150"
                        >
                          {link.label}
                          <ChevronDown
                            size={14}
                            className={cn("transition-transform duration-200", servicesOpen && "rotate-180")}
                          />
                        </button>
                        <div
                          onMouseEnter={() => setServicesOpen(true)}
                          onMouseLeave={() => setServicesOpen(false)}
                        >
                          <ServicesDropdown isOpen={servicesOpen} />
                        </div>
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-dim hover:text-ink transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/yhteystiedot">Pyydä tarjous</Link>
              </Button>
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden text-ink-dim hover:text-ink transition-colors p-2 rounded-lg hover:bg-subtle"
                aria-label="Avaa valikko"
                aria-expanded={mobileOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

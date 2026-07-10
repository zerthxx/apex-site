"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Menu,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { ServicesDropdown } from "./ServicesDropdown";
import { AuthModal } from "@/components/ui/AuthModal";
import { QuoteGateModal } from "@/components/ui/QuoteGateModal";
import { RequestQuoteLink } from "@/components/ui/RequestQuoteLink";
import { NAV_LINKS } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [authRedirect, setAuthRedirect] = useState("/dashboard");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const v = sessionStorage.getItem("open-auth");
    if (v === "signin" || v === "signup" || v === "1") {
      sessionStorage.removeItem("open-auth");
      setAuthTab(v === "signup" ? "signup" : "signin");
      setAuthOpen(true);
    }
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | "signin"
        | "signup"
        | { tab?: "signin" | "signup"; redirectTo?: string };
      const tab = typeof detail === "string" ? detail : detail?.tab;
      const redirectTo =
        typeof detail === "string" ? undefined : detail?.redirectTo;
      setAuthTab(tab === "signup" ? "signup" : "signin");
      setAuthRedirect(redirectTo ?? "/dashboard");
      setAuthOpen(true);
    };
    window.addEventListener("open-auth-modal", handler);
    return () => window.removeEventListener("open-auth-modal", handler);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.removeItem("intro-seen");
    setUser(null);
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
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
            : "bg-transparent",
        )}
      >
        <Container>
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo-icon.png"
                alt="Apex Site"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
                priority
              />
              <span className="font-display font-bold text-xl text-ink">
                Apex Site
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <li
                    key={link.href}
                    ref={link.dropdown ? servicesRef : undefined}
                    className="relative"
                  >
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
                            className={cn(
                              "transition-transform duration-200",
                              servicesOpen && "rotate-180",
                            )}
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
                        className={cn(
                          "relative block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                          isActive(link.href)
                            ? "text-copper"
                            : "text-ink-dim hover:text-ink",
                        )}
                      >
                        {link.label}
                        {isActive(link.href) && (
                          <motion.span
                            layoutId="nav-underline"
                            className="absolute -bottom-px left-3 right-3 h-px bg-copper rounded-full"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 32,
                            }}
                          />
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-wire text-sm text-ink-dim hover:border-copper/30 transition-all duration-150"
                  >
                    <User size={16} className="text-copper" />
                    {user.user_metadata?.first_name && (
                      <span className="text-sm text-ink-dim">
                        {user.user_metadata.first_name}
                      </span>
                    )}
                    <ChevronDown
                      size={12}
                      className={cn(
                        "transition-transform duration-150",
                        userMenuOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-48 bg-elevated border border-wire rounded-xl shadow-xl py-1 z-50">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-dim hover:text-ink hover:bg-surface transition-colors"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <Link
                        href="/asetukset"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-dim hover:text-ink hover:bg-surface transition-colors"
                      >
                        <Settings size={14} /> Asetukset
                      </Link>
                      <div className="h-px bg-wire mx-2 my-1" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-ghost hover:text-ink hover:bg-surface transition-colors"
                      >
                        <LogOut size={14} /> Kirjaudu ulos
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthTab("signin");
                    setAuthOpen(true);
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink-dim hover:text-ink border border-wire hover:border-copper/30 transition-all duration-150"
                >
                  <LogIn size={14} />
                  Kirjaudu
                </button>
              )}
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <RequestQuoteLink href="/yhteystiedot">
                  Pyydä tarjous
                </RequestQuoteLink>
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
        </Container>
      </header>

      {/* Keltainen varoitusbanneri */}
      {user &&
        (() => {
          const m = user.user_metadata ?? {};
          const missingPhone = !m.phone;
          const incomplete =
            !m.first_name ||
            !m.last_name ||
            !m.address ||
            !m.postal_code ||
            !m.city;
          const message = missingPhone
            ? "Puhelinnumero puuttuu — lisää se jotta voimme ottaa sinuun yhteyttä."
            : "Profiilitietosi ovat puutteelliset — täydennä ne jotta voimme palvella sinua paremmin.";
          return missingPhone || incomplete ? message : null;
        })() && (
          <div className="fixed top-16 md:top-20 left-0 right-0 z-20 bg-caution/95 backdrop-blur-sm border-b border-caution/50">
            <Container className="py-2.5 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink-flip">
                {(() => {
                  const m = user.user_metadata ?? {};
                  return !m.phone
                    ? "Puhelinnumero puuttuu — lisää se jotta voimme ottaa sinuun yhteyttä."
                    : "Profiilitietosi ovat puutteelliset — täydennä ne jotta voimme palvella sinua paremmin.";
                })()}
              </p>
              <Link
                href="/asetukset"
                className="shrink-0 text-sm font-bold text-ink-flip underline underline-offset-2 hover:text-ink-flip/70 transition-colors whitespace-nowrap"
              >
                Klikkaa tässä →
              </Link>
            </Container>
          </div>
        )}

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
        redirectTo={authRedirect}
      />
      <QuoteGateModal />
    </>
  );
}

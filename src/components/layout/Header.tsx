"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { ServicesDropdown } from "./ServicesDropdown";
import { AuthModal } from "@/components/ui/AuthModal";
import { NAV_LINKS } from "@/lib/constants";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const servicesRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

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
      const tab = (e as CustomEvent).detail as "signin" | "signup";
      setAuthTab(tab === "signup" ? "signup" : "signin");
      setAuthOpen(true);
    };
    window.addEventListener("open-auth-modal", handler);
    return () => window.removeEventListener("open-auth-modal", handler);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

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
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo-icon.png"
                alt="Apex Site"
                width={36}
                height={36}
                className="h-9 w-auto object-contain"
                priority
              />
              <span className="font-display font-bold text-xl text-ink">Apex Site</span>
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
                        className={cn(
                          "relative block px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                          isActive(link.href)
                            ? "text-copper"
                            : "text-ink-dim hover:text-ink"
                        )}
                      >
                        {link.label}
                        {isActive(link.href) && (
                          <span className="absolute -bottom-px left-3 right-3 h-px bg-copper rounded-full" />
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
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-wire text-sm text-ink-dim">
                    <User size={14} className="text-copper" />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </div>
                  <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-ink-ghost hover:text-ink transition-colors">
                    <LogOut size={14} />
                    Kirjaudu ulos
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setAuthTab("signin"); setAuthOpen(true); }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-ink-dim hover:text-ink border border-wire hover:border-copper/30 transition-all duration-150"
                >
                  <LogIn size={14} />
                  Kirjaudu
                </button>
              )}
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
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} defaultTab={authTab} />
    </>
  );
}

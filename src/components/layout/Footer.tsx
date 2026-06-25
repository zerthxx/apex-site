import Link from "next/link";
import { ExternalLink, Mail, Phone, MapPin } from "lucide-react";

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS, SOCIAL_LINKS, FOOTER_NAV } from "@/lib/constants";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-wire mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <Link
              href="/"
              className="font-display font-bold text-2xl text-ink hover:text-copper transition-colors duration-150 self-start"
            >
              Apex Site
            </Link>
            <p className="text-ink-ghost text-sm leading-relaxed max-w-xs">
              Rakennamme ohjelmistoja, jotka kasvattavat liiketoimintaasi — verkkosivuista
              mobiilisovelluksiin ja AI-ratkaisuihin.
            </p>
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg border border-wire flex items-center justify-center text-ink-ghost hover:text-copper hover:border-copper/40 transition-all duration-150"
              >
                <LinkedinIcon />
              </a>
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg border border-wire flex items-center justify-center text-ink-ghost hover:text-copper hover:border-copper/40 transition-all duration-150"
              >
                <GithubIcon />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="w-9 h-9 rounded-lg border border-wire flex items-center justify-center text-ink-ghost hover:text-copper hover:border-copper/40 transition-all duration-150"
              >
                <TwitterIcon />
              </a>
            </div>
          </div>

          {/* Col 2: Palvelut */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-4">
              Palvelut
            </p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.palvelut.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-dim hover:text-ink transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Yritys */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-4">
              Yritys
            </p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV.yritys.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-dim hover:text-ink transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-4">
              Yhteystiedot
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="flex items-center gap-2.5 text-sm text-ink-dim hover:text-ink transition-colors duration-150"
                >
                  <Mail size={14} className="text-copper shrink-0" />
                  {COMPANY_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${COMPANY_PHONE.replace(/\s/g, "")}`}
                  className="flex items-center gap-2.5 text-sm text-ink-dim hover:text-ink transition-colors duration-150"
                >
                  <Phone size={14} className="text-copper shrink-0" />
                  {COMPANY_PHONE}
                </a>
              </li>
              <li>
                <p className="flex items-center gap-2.5 text-sm text-ink-ghost">
                  <MapPin size={14} className="text-copper shrink-0" />
                  {COMPANY_ADDRESS}
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-12 border-t border-wire">
          <p className="text-xs text-ink-ghost">
            © {currentYear} Apex Site Oy. Kaikki oikeudet pidätetään.
          </p>
          <div className="flex gap-4">
            <Link
              href="/tietosuoja"
              className="text-xs text-ink-ghost hover:text-ink-dim transition-colors duration-150"
            >
              Tietosuojaseloste
            </Link>
            <Link
              href="/kayttoehdot"
              className="text-xs text-ink-ghost hover:text-ink-dim transition-colors duration-150"
            >
              Käyttöehdot
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio — Referenssit ja asiakasprojektit",
  description: "Apex Siten asiakasprojektit ja referenssit. Tulossa pian.",
  alternates: { canonical: "https://apexsite.fi/portfolio" },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Referenssit tulossa pian."
        description="Rakennamme parhaillaan portfoliomme. Ota yhteyttä niin kerromme kokemuksestamme suoraan."
        cta={{ label: "Ota yhteyttä", href: "/yhteystiedot" }}
      />

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-elevated border border-wire text-ink-dim text-sm">
            <span className="text-2xl">🚧</span>
            <span>Portfoliomme on rakenteilla — referenssit lisätään pian.</span>
          </div>
          <p className="mt-8 text-ink-dim text-sm">
            Haluatko tietää enemmän projekteistamme?{" "}
            <Link href="/yhteystiedot" className="text-copper hover:underline">
              Ota yhteyttä
            </Link>
          </p>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

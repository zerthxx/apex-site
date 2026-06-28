import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { CaseStudyCard } from "@/components/shared/CaseStudyCard";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { MOCK_CASE_STUDIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Portfolio — Referenssit ja asiakasprojektit",
  description:
    "Tutustuu töihimme: verkkosivustot, verkkokaupat, mobiilisovellukset ja AI-ratkaisut. Yli 47 toimitettua projektia.",
  alternates: { canonical: "https://apexsite.fi/portfolio" },
};

const FILTERS = ["Kaikki", "Verkkosivut", "Verkkokauppa", "Mobiilisovellus", "AI-ratkaisu", "Ohjelmisto"];

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Työmme puhuu puolestaan."
        description="Olemme toimittaneet yli 47 projektia. Tässä näet osan niistä. Jokainen projekti on tehty täydellä sitoutumisella."
        cta={{ label: "Aloita oma projekti", href: "/yhteystiedot" }}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === 0
                    ? "bg-copper text-ink-flip"
                    : "bg-elevated border border-wire text-ink-dim hover:text-ink hover:border-copper/40"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CASE_STUDIES.map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

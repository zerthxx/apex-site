import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Container } from "@/components/shared/Container";
import { PortfolioComingSoon } from "./PortfolioComingSoon";

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
        title="Referenssimme julkaistaan pian."
        description="Työskentelemme parhaillaan asiakkaidemme kanssa uusien projektien parissa. Alta näet, millaisia referenssejä olemme julkaisemassa kuhunkin kategoriaan — tai ota suoraan yhteyttä ja kerromme lisää."
        cta={{ label: "Ota yhteyttä", href: "/yhteystiedot" }}
      />

      <section className="py-16 md:py-24 lg:py-32">
        <Container>
          <PortfolioComingSoon />
        </Container>
      </section>

      <ContactCtaSection />
    </>
  );
}

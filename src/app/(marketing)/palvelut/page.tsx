import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Container } from "@/components/shared/Container";
import { ServicesBentoGrid } from "./ServicesBentoGrid";
import { SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Palvelut — Verkkosivut, verkkokaupat, mobiilisovellukset ja AI",
  description:
    "Apex Site tarjoaa kaikki digitaaliset palvelut: verkkosivut, verkkokaupat, mobiilisovellukset, AI-ratkaisut ja räätälöidyt ohjelmistot.",
  alternates: { canonical: "https://apexsite.fi/palvelut" },
};

export default function PalvelutPage() {
  return (
    <>
      <PageHero
        eyebrow="Palvelut"
        title="Kaikki digitaaliset palvelut yhdestä paikasta"
        description="Suunnittelusta tuotantoon — rakennamme kaiken mitä yrityksesi tarvitsee digitaaliseen kasvuun."
        cta={{
          label: "Pyydä tarjous",
          href: "/yhteystiedot",
          requiresAuth: true,
        }}
      />

      <section className="py-16 md:py-24 lg:py-32">
        <Container>
          <ServicesBentoGrid services={SERVICES} />
        </Container>
      </section>

      <ContactCtaSection />
    </>
  );
}

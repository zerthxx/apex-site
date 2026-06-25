import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
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
        cta={{ label: "Pyydä tarjous", href: "/yhteystiedot" }}
      />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} className="h-full" />
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

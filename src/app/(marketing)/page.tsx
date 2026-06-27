import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogoBarSection } from "@/components/sections/LogoBarSection";
import { ServicesGridSection } from "@/components/sections/ServicesGridSection";
import { WhyApexSection } from "@/components/sections/WhyApexSection";
import { ProcessTeaserSection } from "@/components/sections/ProcessTeaserSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { FaqTeaserSection } from "@/components/sections/FaqTeaserSection";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { StatsSection } from "@/components/sections/StatsSection";

export const metadata: Metadata = {
  title: "Etusivu",
  description:
    "Verkkosivut, verkkokaupat, mobiilisovellukset ja AI-ratkaisut yrityksellesi. Suomalainen ohjelmistotalo Helsingistä.",
  alternates: { canonical: "https://apexsite.fi" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LogoBarSection />
      <StatsSection />
      <ServicesGridSection />
      <WhyApexSection />
      <ProcessTeaserSection />
      <TechStackSection />
      <TestimonialsSection />
      <FaqTeaserSection />
      <ContactCtaSection />
    </>
  );
}

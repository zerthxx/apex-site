import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileModal } from "@/components/ui/ProfileModal";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogoBarSection } from "@/components/sections/LogoBarSection";
import { ServicesGridSection } from "@/components/sections/ServicesGridSection";
import { RecentProjectsSection } from "@/components/sections/RecentProjectsSection";
import { MidPageCtaSection } from "@/components/sections/MidPageCtaSection";
import { WhyApexSection } from "@/components/sections/WhyApexSection";
import { HowWeHelpSection } from "@/components/sections/HowWeHelpSection";
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
      <Suspense>
        <ProfileModal />
      </Suspense>
      <HeroSection />
      <LogoBarSection />
      <StatsSection />
      <ServicesGridSection />
      <RecentProjectsSection />
      <MidPageCtaSection />
      <WhyApexSection />
      <HowWeHelpSection />
      <ProcessTeaserSection />
      <TechStackSection />
      <TestimonialsSection />
      <FaqTeaserSection />
      <ContactCtaSection />
    </>
  );
}

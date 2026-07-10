import { PageHero } from "@/components/shared/PageHero";
import { ReasonsSection } from "./sections/ReasonsSection";
import { ProcessStepsSection } from "./sections/ProcessStepsSection";
import { StarterPackagesSection } from "./sections/StarterPackagesSection";
import { ServicePricingSection } from "./sections/ServicePricingSection";
import { MaintenanceSection } from "./sections/MaintenanceSection";
import { AddOnsSection } from "./sections/AddOnsSection";
import { IncludedSection } from "./sections/IncludedSection";
import { FaqSection } from "./sections/FaqSection";
import { TrustStatsSection } from "./sections/TrustStatsSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";

export function HinnoitteluContent() {
  return (
    <>
      <PageHero
        eyebrow="Hinnoittelu"
        title="Selkeät hinnat. Ei yllätyksiä."
        description="Kaikki tarjouksemme ovat kiinteitä. Tiedät tarkalleen mitä saat ja mitä maksat — ennen kuin allekirjoitat mitään."
        cta={{
          label: "Pyydä ilmainen tarjous",
          href: "/yhteystiedot",
          requiresAuth: true,
        }}
      />
      <ReasonsSection />
      <ProcessStepsSection />
      <StarterPackagesSection />
      <ServicePricingSection />
      <MaintenanceSection />
      <AddOnsSection />
      <IncludedSection />
      <FaqSection />
      <TrustStatsSection />
      <FinalCtaSection />
    </>
  );
}

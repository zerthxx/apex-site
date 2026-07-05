"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { PricingCard } from "@/components/shared/PricingCard";
import { fadeUp } from "@/lib/animations";
import { SERVICES_PRICING } from "../data";

export function ServicePricingSection() {
  const router = useRouter();

  return (
    <section className="py-16 bg-surface/30">
      <Container>
        <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">
          Palveluiden hinnat
        </h2>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <CardCarousel defaultIndex={2}>
            {SERVICES_PRICING.map((svc) => (
              <PricingCard
                key={svc.name}
                name={svc.name}
                variant={svc.variant}
                priceLine={
                  <span className="text-copper font-semibold text-lg">
                    {svc.price}
                  </span>
                }
                description={svc.description}
                features={svc.features}
                onClick={() => router.push(`/yhteystiedot?palvelu=${svc.slug}`)}
                primaryCta={{
                  label: "Pyydä tarjous",
                  href: `/yhteystiedot?palvelu=${svc.slug}`,
                }}
                secondaryCta={{ label: "Lue lisää", href: svc.href }}
              />
            ))}
          </CardCarousel>
        </div>

        {/* Desktop grid */}
        <RevealGroup className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_PRICING.map((svc) => (
            <motion.div key={svc.name} variants={fadeUp}>
              <PricingCard
                name={svc.name}
                variant={svc.variant}
                priceLine={
                  <span className="text-copper font-semibold text-lg">
                    {svc.price}
                  </span>
                }
                description={svc.description}
                features={svc.features}
                onClick={() => router.push(`/yhteystiedot?palvelu=${svc.slug}`)}
                primaryCta={{
                  label: "Pyydä tarjous",
                  href: `/yhteystiedot?palvelu=${svc.slug}`,
                }}
                secondaryCta={{ label: "Lue lisää", href: svc.href }}
              />
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

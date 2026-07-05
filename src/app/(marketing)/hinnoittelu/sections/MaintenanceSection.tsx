"use client";

import { motion } from "motion/react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { PricingCard } from "@/components/shared/PricingCard";
import { fadeUp } from "@/lib/animations";
import { MAINTENANCE_TIERS } from "../data";

export function MaintenanceSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
            Ylläpitosopimukset
          </h2>
          <p className="text-ink-dim max-w-lg mx-auto">
            Pidä sivustosi turvallisena, nopeana ja ajan tasalla.
            Kuukausittainen sopimus, ei sitoutumisaikaa.
          </p>
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <CardCarousel defaultIndex={1}>
            {MAINTENANCE_TIERS.map((tier) => (
              <PricingCard
                key={tier.name}
                name={tier.name}
                variant={tier.variant}
                badge={tier.badge}
                priceLine={
                  <span className="text-copper font-semibold">
                    {tier.price}
                  </span>
                }
                features={tier.features}
                primaryCta={{
                  label: "Pyydä tarjous",
                  href: `/yhteystiedot?palvelu=${tier.slug}`,
                }}
              />
            ))}
          </CardCarousel>
        </div>

        {/* Desktop grid */}
        <RevealGroup className="hidden md:grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {MAINTENANCE_TIERS.map((tier) => (
            <motion.div key={tier.name} variants={fadeUp}>
              <PricingCard
                name={tier.name}
                variant={tier.variant}
                badge={tier.badge}
                priceLine={
                  <span className="text-copper font-semibold">
                    {tier.price}
                  </span>
                }
                features={tier.features}
                primaryCta={{
                  label: "Pyydä tarjous",
                  href: `/yhteystiedot?palvelu=${tier.slug}`,
                }}
              />
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

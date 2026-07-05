"use client";

import { motion } from "motion/react";
import { Container } from "@/components/shared/Container";
import { RevealGroup } from "@/components/shared/RevealSection";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { PricingCard } from "@/components/shared/PricingCard";
import { fadeUp } from "@/lib/animations";
import { STARTER_PACKAGES } from "../data";

function packagePriceLine(pkg: (typeof STARTER_PACKAGES)[number]) {
  return (
    <>
      <span className="text-copper font-bold text-2xl">{pkg.setup}</span>
      <span className="text-ink-dim text-sm ml-1">aloitus</span>
      <span className="text-ink-ghost mx-2">+</span>
      <span className="text-copper font-semibold">{pkg.monthly}</span>
    </>
  );
}

export function StarterPackagesSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-brand">
            Pienyrityksille
          </span>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-3">
            Aloita pienellä budjetilla
          </h2>
          <p className="text-ink-dim max-w-lg mx-auto">
            Ravintola, parturi, kampaamo tai muu pieni yritys — saat
            ammattimaisen sivuston ilman isoa kertamaksua.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <div className="flex-1 rounded-xl border border-wire bg-elevated p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-1">
                Meidän hosting
              </p>
              <p className="text-ink font-semibold">+ 50 €/kk</p>
              <p className="text-ink-dim text-xs mt-1">
                Me pidämme sivustosi käynnissä. Ei teknisiä huolia.
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-wire bg-elevated p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-brand mb-1">
                Oma hosting
              </p>
              <p className="text-ink font-semibold">0 €/kk</p>
              <p className="text-ink-dim text-xs mt-1">
                Maksat vain kertaluonteisen aloitusmaksun. Hosting on sinun
                vastuullasi.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <CardCarousel defaultIndex={1}>
            {STARTER_PACKAGES.map((pkg) => (
              <PricingCard
                key={pkg.name}
                name={pkg.name}
                variant={pkg.variant}
                badge={pkg.badge}
                priceLine={packagePriceLine(pkg)}
                description={pkg.description}
                features={pkg.features}
                primaryCta={{
                  label: "Pyydä tarjous",
                  href: `/yhteystiedot?palvelu=${pkg.slug}`,
                }}
              />
            ))}
          </CardCarousel>
        </div>

        {/* Desktop grid */}
        <RevealGroup className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {STARTER_PACKAGES.map((pkg) => (
            <motion.div key={pkg.name} variants={fadeUp}>
              <PricingCard
                name={pkg.name}
                variant={pkg.variant}
                badge={pkg.badge}
                priceLine={packagePriceLine(pkg)}
                description={pkg.description}
                features={pkg.features}
                primaryCta={{
                  label: "Pyydä tarjous",
                  href: `/yhteystiedot?palvelu=${pkg.slug}`,
                }}
              />
            </motion.div>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}

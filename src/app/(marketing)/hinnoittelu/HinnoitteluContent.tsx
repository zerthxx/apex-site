"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Badge } from "@/components/ui/Badge";
import { PageHero } from "@/components/shared/PageHero";
import { fadeUp, staggerContainer } from "@/lib/animations";

const SERVICES_PRICING = [
  {
    name: "Verkkosivut",
    price: "alkaen 3 000 €",
    description: "Moderni, nopea ja hakukoneoptimoitu yrityspresenssi verkossa.",
    features: [
      "Responsiivinen design",
      "On-page SEO",
      "Google Analytics",
      "CMS sisällönhallinta",
      "Yhteydenottolomake",
      "6 kk takuu",
    ],
    href: "/palvelut/verkkosivut",
    highlight: false,
  },
  {
    name: "Verkkokauppa",
    price: "alkaen 6 000 €",
    description: "Myyvä verkkokauppa Shopify, WooCommerce tai täysin räätälöitynä.",
    features: [
      "Stripe + Klarna + Paytrail",
      "Varastonhallinta",
      "Mobiilioptimoidut kassavirrat",
      "Konversioseuranta",
      "SEO-optimointi",
      "Asiakastilit",
    ],
    href: "/palvelut/verkkokaupat",
    highlight: true,
  },
  {
    name: "Mobiilisovellus",
    price: "alkaen 15 000 €",
    description: "Native iOS ja Android tai cross-platform React Native.",
    features: [
      "iOS ja Android",
      "App Store -julkaisu",
      "Push-ilmoitukset",
      "Offline-toiminnallisuus",
      "API-integraatiot",
      "3 kk takuu",
    ],
    href: "/palvelut/mobiilisovellukset",
    highlight: false,
  },
  {
    name: "AI-ratkaisut",
    price: "alkaen 4 000 €",
    description: "Automaatiot, chatbotit ja AI-integraatiot liiketoimintaasi.",
    features: [
      "Prosessikartoitus",
      "RAG-ratkaisut",
      "OpenAI / Anthropic",
      "Työnkulun automaatio",
      "Dashboard",
      "Koulutus tiimille",
    ],
    href: "/palvelut/ai-ratkaisut",
    highlight: false,
  },
];

const MAINTENANCE_TIERS = [
  { name: "Perus", price: "150 €/kk", features: ["Tietoturvapäivitykset", "Varmuuskopiointi", "Sähköpostituki", "1 h muutostyöt/kk"] },
  { name: "Kasvu", price: "350 €/kk", features: ["Kaikki Perus-tason ominaisuudet", "Suorituskyvyn seuranta", "Puhelintuki", "4 h muutostyöt/kk", "Kuukausiraportti"] },
  { name: "Pro", price: "750 €/kk", features: ["Kaikki Kasvu-tason ominaisuudet", "Prioriteettituki (2h vasteaika)", "8 h muutostyöt/kk", "Kvartaalikatsaus", "CRO-suositukset"] },
];

const FAQ = [
  { q: "Onko hinnoittelu kiinteä vai tuntiperusteiset?", a: "Useimmille projekteille annamme kiinteän hinnan. Isommissa projekteissa voidaan sopia virstanpylväspohjaisesta laskutuksesta. Jatkokehityksessä käytämme tuntihintaa (95–145 €/h)." },
  { q: "Miksi hintanne eroaa halvemmista toimijoista?", a: "Käytämme hyviä materiaaleja, parempia prosesseja ja kokeneitampia ihmisiä. Tyypillinen halpa projekti maksaa enemmän vuoden päästä kun sille tarvitaan uusintakehitystä." },
  { q: "Voiko projektin jakaa eriin?", a: "Kyllä. Projektit laskutetaan tyypillisesti kolmessa erässä: 30% aloituksessa, 40% kehityksen puolivälissä, 30% julkaisun yhteydessä." },
];

export function HinnoitteluContent() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const maintenanceRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const servicesInView = useInView(servicesRef, { once: true, margin: "-80px" });
  const maintenanceInView = useInView(maintenanceRef, { once: true, margin: "-80px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-80px" });

  return (
    <>
      <PageHero
        eyebrow="Hinnoittelu"
        title="Selkeät hinnat. Ei yllätyksiä."
        description="Kaikki tarjouksemme ovat kiinteitä. Tiedät tarkalleen mitä saat ja mitä maksat — ennen kuin allekirjoitat mitään."
        cta={{ label: "Pyydä ilmainen tarjous", href: "/yhteystiedot" }}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">
            Palveluiden hinnat
          </h2>
          <motion.div
            ref={servicesRef}
            variants={staggerContainer}
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {SERVICES_PRICING.map((svc) => (
              <motion.div
                key={svc.name}
                variants={fadeUp}
                className={`relative p-6 rounded-xl border flex flex-col ${
                  svc.highlight
                    ? "gradient-border bg-copper/5 shadow-glow"
                    : "border-wire bg-elevated"
                }`}
              >
                {svc.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-display font-bold text-ink text-xl mb-1">{svc.name}</h3>
                  <p className="text-copper font-semibold text-lg">{svc.price}</p>
                  <p className="text-ink-dim text-sm mt-2 leading-relaxed">{svc.description}</p>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-dim">
                      <CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={svc.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors"
                >
                  Lue lisää <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
              Ylläpitosopimukset
            </h2>
            <p className="text-ink-dim max-w-lg mx-auto">
              Pidä sivustosi turvallisena, nopeana ja ajan tasalla. Kuukausittainen sopimus, ei sitoutumisaikaa.
            </p>
          </div>
          <motion.div
            ref={maintenanceRef}
            variants={staggerContainer}
            initial="hidden"
            animate={maintenanceInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {MAINTENANCE_TIERS.map((tier) => (
              <motion.div key={tier.name} variants={fadeUp} className="p-6 rounded-xl border border-wire bg-elevated">
                <h3 className="font-heading font-bold text-ink mb-1">{tier.name}</h3>
                <p className="text-copper font-semibold mb-4">{tier.price}</p>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-dim">
                      <CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8">
            Usein kysyttyä hinnoittelusta
          </h2>
          <motion.div
            ref={faqRef}
            variants={staggerContainer}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
            className="space-y-6"
          >
            {FAQ.map((item) => (
              <motion.div key={item.q} variants={fadeUp} className="border-b border-wire pb-6">
                <h3 className="font-heading font-semibold text-ink mb-2">{item.q}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

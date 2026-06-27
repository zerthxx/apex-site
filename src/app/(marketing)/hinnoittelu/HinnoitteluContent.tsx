"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { Badge } from "@/components/ui/Badge";
import { PageHero } from "@/components/shared/PageHero";
import { CardCarousel } from "@/components/ui/CardCarousel";
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
];

const STARTER_PACKAGES = [
  {
    name: "Startti",
    setup: "299 €",
    monthly: "49 €/kk",
    description: "Täydellinen pienelle yritykselle. Ravintola, parturi, kampaamo, paikallinen kauppa.",
    features: [
      "Jopa 5 sivua",
      "Mobiilioptimoidut",
      "Yhteydenottolomake",
      "Google Maps -integraatio",
      "Ylläpito sisältyy",
      "Ei sitoutumisaikaa",
    ],
    highlight: false,
  },
  {
    name: "Kasvu",
    setup: "599 €",
    monthly: "79 €/kk",
    description: "Enemmän sivuja, SEO-optimointi ja Google Analytics. Kasvavalle yritykselle.",
    features: [
      "Jopa 10 sivua",
      "SEO-optimointi",
      "Google Analytics",
      "CMS sisällönhallinta",
      "Blogimahdollisuus",
      "Kuukausiraportti",
    ],
    highlight: true,
  },
  {
    name: "Pro",
    setup: "999 €",
    monthly: "99 €/kk",
    description: "Täysi paketti verkkokaupalla tai varausjärjestelmällä.",
    features: [
      "Rajaton sivumäärä",
      "Verkkokauppa tai varaukset",
      "Maksujärjestelmä",
      "Prioriteettituki",
      "4 h muutostyöt/kk",
      "Kvartaalikatsaus",
    ],
    highlight: false,
  },
];

const MAINTENANCE_TIERS = [
  { name: "Perus", price: "150 €/kk", highlight: false, features: ["Tietoturvapäivitykset", "Varmuuskopiointi", "Sähköpostituki", "1 h muutostyöt/kk"] },
  { name: "Kasvu", price: "350 €/kk", highlight: true, features: ["Kaikki Perus-tason ominaisuudet", "Suorituskyvyn seuranta", "Puhelintuki", "4 h muutostyöt/kk", "Kuukausiraportti"] },
  { name: "Pro", price: "750 €/kk", highlight: false, features: ["Kaikki Kasvu-tason ominaisuudet", "Prioriteettituki (2h vasteaika)", "8 h muutostyöt/kk", "Kvartaalikatsaus", "CRO-suositukset"] },
];

const FAQ = [
  { q: "Onko hinnoittelu kiinteä vai tuntiperusteiset?", a: "Useimmille projekteille annamme kiinteän hinnan. Isommissa projekteissa voidaan sopia virstanpylväspohjaisesta laskutuksesta. Jatkokehityksessä käytämme tuntihintaa (95–145 €/h)." },
  { q: "Miksi hintanne eroaa halvemmista toimijoista?", a: "Käytämme hyviä materiaaleja, parempia prosesseja ja kokeneitampia ihmisiä. Tyypillinen halpa projekti maksaa enemmän vuoden päästä kun sille tarvitaan uusintakehitystä." },
  { q: "Voiko projektin jakaa eriin?", a: "Kyllä. Projektit laskutetaan tyypillisesti kolmessa erässä: 30% aloituksessa, 40% kehityksen puolivälissä, 30% julkaisun yhteydessä." },
];

export function HinnoitteluContent() {
  const starterRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const maintenanceRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const starterInView = useInView(starterRef, { once: true, margin: "-80px" });
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

      {/* Starter packages for small businesses */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-brand">Pienyrityksille</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-3">
              Aloita pienellä budjetilla
            </h2>
            <p className="text-ink-dim max-w-lg mx-auto">
              Ravintola, parturi, kampaamo tai muu pieni yritys — saat ammattimaisen sivuston ilman isoa kertamaksua.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
              <div className="flex-1 rounded-xl border border-wire bg-elevated p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-1">Meidän hosting</p>
                <p className="text-ink font-semibold">+ 50 €/kk</p>
                <p className="text-ink-dim text-xs mt-1">Me pidämme sivustosi käynnissä. Ei teknisiä huolia.</p>
              </div>
              <div className="flex-1 rounded-xl border border-wire bg-elevated p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-brand mb-1">Oma hosting</p>
                <p className="text-ink font-semibold">0 €/kk</p>
                <p className="text-ink-dim text-xs mt-1">Maksat vain kertaluonteisen aloitusmaksun. Hosting on sinun vastuullasi.</p>
              </div>
            </div>
          </div>
          {/* Mobile carousel */}
          <div className="md:hidden">
            <CardCarousel defaultIndex={STARTER_PACKAGES.findIndex(p => p.highlight)}>
              {STARTER_PACKAGES.map((pkg) => (
                <div key={pkg.name} className={`p-6 rounded-xl border flex flex-col h-full ${pkg.highlight ? "gradient-border bg-elevated shadow-glow" : pkg.name === "Pro" ? "gradient-border-violet bg-elevated" : pkg.name === "Startti" ? "gradient-border-white bg-elevated" : "border-wire bg-elevated"}`}>
                  {pkg.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                  <h3 className="font-display font-bold text-ink text-xl mb-1">{pkg.name}</h3>
                  <div className="mb-3"><span className="text-copper font-bold text-2xl">{pkg.setup}</span><span className="text-ink-dim text-sm ml-1">aloitus</span><span className="text-ink-ghost mx-2">+</span><span className="text-copper font-semibold">{pkg.monthly}</span></div>
                  <p className="text-ink-dim text-sm mb-4 leading-relaxed">{pkg.description}</p>
                  <ul className="space-y-2 flex-1 mb-6">{pkg.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <Link href="/yhteystiedot" className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors">Pyydä tarjous <ArrowRight size={14} /></Link>
                </div>
              ))}
            </CardCarousel>
          </div>
          {/* Desktop grid */}
          <motion.div ref={starterRef} variants={staggerContainer} initial="hidden" animate={starterInView ? "visible" : "hidden"} className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STARTER_PACKAGES.map((pkg) => (
              <motion.div key={pkg.name} variants={fadeUp} className={`p-6 rounded-xl border flex flex-col ${pkg.highlight ? "gradient-border bg-elevated shadow-glow" : pkg.name === "Pro" ? "gradient-border-violet bg-elevated" : pkg.name === "Startti" ? "gradient-border-white bg-elevated" : "border-wire bg-elevated"}`}>
                {pkg.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                <h3 className="font-display font-bold text-ink text-xl mb-1">{pkg.name}</h3>
                <div className="mb-3"><span className="text-copper font-bold text-2xl">{pkg.setup}</span><span className="text-ink-dim text-sm ml-1">aloitus</span><span className="text-ink-ghost mx-2">+</span><span className="text-copper font-semibold">{pkg.monthly}</span></div>
                <p className="text-ink-dim text-sm mb-4 leading-relaxed">{pkg.description}</p>
                <ul className="space-y-2 flex-1 mb-6">{pkg.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                <Link href="/yhteystiedot" className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors">Pyydä tarjous <ArrowRight size={14} /></Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">
            Palveluiden hinnat
          </h2>
          {/* Mobile carousel */}
          <div className="md:hidden">
            <CardCarousel defaultIndex={SERVICES_PRICING.findIndex(s => s.highlight)}>
              {SERVICES_PRICING.map((svc) => (
                <div key={svc.name} className={`p-6 rounded-xl border flex flex-col h-full ${svc.highlight ? "gradient-border bg-elevated shadow-glow" : "border-wire bg-elevated"}`}>
                  {svc.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                  <div className="mb-4"><h3 className="font-display font-bold text-ink text-xl mb-1">{svc.name}</h3><p className="text-copper font-semibold text-lg">{svc.price}</p><p className="text-ink-dim text-sm mt-2 leading-relaxed">{svc.description}</p></div>
                  <ul className="space-y-2 flex-1 mb-6">{svc.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <Link href={svc.href} className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors">Lue lisää <ArrowRight size={14} /></Link>
                </div>
              ))}
            </CardCarousel>
          </div>
          {/* Desktop grid */}
          <motion.div ref={servicesRef} variants={staggerContainer} initial="hidden" animate={servicesInView ? "visible" : "hidden"} className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_PRICING.map((svc) => (
              <motion.div key={svc.name} variants={fadeUp} className={`relative p-6 rounded-xl border flex flex-col ${svc.highlight ? "gradient-border bg-elevated shadow-glow" : "border-wire bg-elevated"}`}>
                {svc.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                <div className="mb-4"><h3 className="font-display font-bold text-ink text-xl mb-1">{svc.name}</h3><p className="text-copper font-semibold text-lg">{svc.price}</p><p className="text-ink-dim text-sm mt-2 leading-relaxed">{svc.description}</p></div>
                <ul className="space-y-2 flex-1 mb-6">{svc.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                <Link href={svc.href} className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors">Lue lisää <ArrowRight size={14} /></Link>
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
          {/* Mobile carousel */}
          <div className="md:hidden">
            <CardCarousel defaultIndex={MAINTENANCE_TIERS.findIndex(t => t.highlight)}>
              {MAINTENANCE_TIERS.map((tier) => (
                <div key={tier.name} className={`p-6 rounded-xl border flex flex-col h-full ${tier.highlight ? "gradient-border bg-elevated shadow-glow" : tier.name === "Perus" ? "gradient-border-white bg-elevated" : "gradient-border-violet bg-elevated"}`}>
                  {tier.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                  <h3 className="font-heading font-bold text-ink mb-1">{tier.name}</h3>
                  <p className="text-copper font-semibold mb-4">{tier.price}</p>
                  <ul className="space-y-2 flex-1">{tier.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                </div>
              ))}
            </CardCarousel>
          </div>
          {/* Desktop grid */}
          <motion.div ref={maintenanceRef} variants={staggerContainer} initial="hidden" animate={maintenanceInView ? "visible" : "hidden"} className="hidden md:grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {MAINTENANCE_TIERS.map((tier) => (
              <motion.div key={tier.name} variants={fadeUp} className={`relative p-6 rounded-xl border flex flex-col ${tier.highlight ? "gradient-border bg-elevated shadow-glow" : tier.name === "Perus" ? "gradient-border-white bg-elevated" : "gradient-border-violet bg-elevated"}`}>
                {tier.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                <h3 className="font-heading font-bold text-ink mb-1">{tier.name}</h3>
                <p className="text-copper font-semibold mb-4">{tier.price}</p>
                <ul className="space-y-2 flex-1">{tier.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
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

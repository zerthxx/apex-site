"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/shared/PageHero";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { fadeUp, staggerContainer } from "@/lib/animations";

const SERVICES_PRICING = [
  {
    name: "Verkkosivut",
    slug: "verkkosivut",
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
    slug: "ai-ratkaisut",
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
    slug: "verkkokaupat",
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
    highlight: false,
  },
  {
    name: "Mobiilisovellus",
    slug: "mobiilisovellukset",
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
    slug: "startti",
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
    slug: "kasvu",
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
    slug: "pro",
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

const ADD_ONS = [
  { name: "Livechat-asennus", price: "150 €", desc: "Tidio tai Tawk.to -chat asiakkaille. Asiakas hallinnoi itse." },
  { name: "Google Analytics", price: "100 €", desc: "Kävijäseuranta ja raportointi Google Analyticsiin." },
  { name: "Evästebanneri (GDPR)", price: "150 €", desc: "GDPR-yhteensopiva evästehallinta ja suostumusbanneri." },
  { name: "Yhteydenottolomake", price: "100 €", desc: "Lomake joka lähettää viestit suoraan sähköpostiin." },
  { name: "Google Maps -integraatio", price: "100 €", desc: "Kartta, osoite ja aukioloajat sivulle." },
  { name: "Nopeutusoptimointi", price: "200 €", desc: "Sivuston latausajan optimointi paremmalle sijoitukselle." },
  { name: "Logo-suunnittelu", price: "250 €", desc: "Ammattimainen logo yrityksellesi." },
  { name: "Some-linkit & ikonit", price: "75 €", desc: "Instagram, Facebook, TikTok ja muut somelinkit sivulle." },
  { name: "Sähköposti-asennus", price: "100 €", desc: "Yritysdomain-sähköposti esim. support@sinundomain.fi." },
  { name: "Chatbot-asennus (AI)", price: "300 €", desc: "Tekoälychatbot joka vastaa asiakkaille automaattisesti 24/7." },
  { name: "Varausjärjestelmä", price: "350 €", desc: "Online-ajanvaraus kalenterilla asiakkaillesi." },
  { name: "Somejakotoiminnot", price: "100 €", desc: "Open Graph -kuvat ja some-jakopainikkeet." },
];

const MAINTENANCE_TIERS = [
  { name: "Perus", slug: "perus", price: "150 €/kk", highlight: false, features: ["Tietoturvapäivitykset", "Varmuuskopiointi", "Sähköpostituki", "1 h muutostyöt/kk"] },
  { name: "Standardi", slug: "standardi", price: "350 €/kk", highlight: false, features: ["Kaikki Perus-tason ominaisuudet", "Suorituskyvyn seuranta", "Puhelintuki", "4 h muutostyöt/kk", "Kuukausiraportti"] },
  { name: "Premium", slug: "premium", price: "750 €/kk", highlight: false, features: ["Kaikki Standardi-tason ominaisuudet", "Prioriteettituki (2h vasteaika)", "8 h muutostyöt/kk", "Kvartaalikatsaus", "CRO-suositukset"] },
];

const PRICING_REASONS = [
  { title: "Ei piilokuluja", text: "Saat aina selkeän tarjouksen." },
  { title: "Räätälöity tarjous", text: "Maksat vain tarvitsemistasi ominaisuuksista." },
  { title: "Maksuton kartoitus", text: "30 minuutin kartoitus ilman sitoutumista." },
  { title: "Skaalautuva ratkaisu", text: "Voit laajentaa projektia myöhemmin." },
];

const PRICING_STEPS = [
  { num: "1", label: "Kartoitus" },
  { num: "2", label: "Tarpeiden määrittely" },
  { num: "3", label: "Tarjous" },
  { num: "4", label: "Projektin toteutus" },
  { num: "5", label: "Julkaisu" },
];

const INCLUDED = [
  "Maksuton kartoitus",
  "Moderni toteutus",
  "Responsiivinen design",
  "Testaus",
  "Julkaisu",
  "Käyttöönoton tuki",
];

const TRUST_STATS = [
  { value: "47+", label: "Projektia" },
  { value: "98%", label: "Tyytyväisiä asiakkaita" },
  { value: "5★", label: "Google-arvosana" },
  { value: "3+", label: "Vuotta kokemusta" },
];

const FAQ = [
  { q: "Onko hinnoittelu kiinteä vai tuntiperusteiset?", a: "Useimmille projekteille annamme kiinteän hinnan. Isommissa projekteissa voidaan sopia virstanpylväspohjaisesta laskutuksesta. Jatkokehityksessä käytämme tuntihintaa (95–145 €/h)." },
  { q: "Miksi hintanne eroaa halvemmista toimijoista?", a: "Käytämme hyviä materiaaleja, parempia prosesseja ja kokeneitampia ihmisiä. Tyypillinen halpa projekti maksaa enemmän vuoden päästä kun sille tarvitaan uusintakehitystä." },
  { q: "Voiko projektin jakaa eriin?", a: "Kyllä. Projektit laskutetaan tyypillisesti kolmessa erässä: 30% aloituksessa, 40% kehityksen puolivälissä, 30% julkaisun yhteydessä." },
  { q: "Voinko maksaa projektin osissa?", a: "Kyllä. Laskutamme tyypillisesti kolmessa erässä: 30% aloituksessa, 40% kehityksen puolivälissä ja 30% julkaisussa. Isommille projekteille voidaan sopia yksilöllinen maksutapa." },
  { q: "Voinko vaihtaa pakettia myöhemmin?", a: "Kyllä. Voit päivittää tai muuttaa pakettia projektin edetessä. Käymme muutoksen läpi ja päivitämme tarjouksen." },
  { q: "Sisältyykö domain ja hosting?", a: "Domain ei sisälly — se rekisteröidään yleensä asiakkaan omille tunnuksille. Hosting on valittavissa: me hoidamme sen (+50 €/kk) tai asiakas käyttää omaa hostingiaan." },
  { q: "Voinko käyttää omaa hostingia?", a: "Kyllä. Voit valita oman hostingin ja maksaa vain kertaluonteisen aloitusmaksun. Tällöin hosting on sinun vastuullasi." },
  { q: "Kuinka nopeasti projekti voidaan aloittaa?", a: "Yleensä aloitamme 1–2 viikon sisällä sopimuksen allekirjoituksesta. Kiireellisemmissä tapauksissa voivat löytyä aikaisemmat aloitusajankohdat — kysy." },
  { q: "Mitä tapahtuu julkaisun jälkeen?", a: "Projektin päättyessä siirräme sivuston omistajuuden ja lähdekoodit sinulle. Voit valita ylläpitosopimuksen tai hoitaa itse. Tarjoamme myös jatkokehitystä tarpeen mukaan." },
];

export function HinnoitteluContent() {
  const router = useRouter();
  const reasonsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const starterRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const addOnsRef = useRef<HTMLDivElement>(null);
  const maintenanceRef = useRef<HTMLDivElement>(null);
  const includedRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const reasonsInView = useInView(reasonsRef, { once: true, margin: "-80px" });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });
  const starterInView = useInView(starterRef, { once: true, margin: "-80px" });
  const servicesInView = useInView(servicesRef, { once: true, margin: "-80px" });
  const addOnsInView = useInView(addOnsRef, { once: true, margin: "-80px" });
  const maintenanceInView = useInView(maintenanceRef, { once: true, margin: "-80px" });
  const includedInView = useInView(includedRef, { once: true, margin: "-80px" });
  const trustInView = useInView(trustRef, { once: true, margin: "-80px" });
  const faqInView = useInView(faqRef, { once: true, margin: "-80px" });

  return (
    <>
      <PageHero
        eyebrow="Hinnoittelu"
        title="Selkeät hinnat. Ei yllätyksiä."
        description="Kaikki tarjouksemme ovat kiinteitä. Tiedät tarkalleen mitä saat ja mitä maksat — ennen kuin allekirjoitat mitään."
        cta={{ label: "Pyydä ilmainen tarjous", href: "/yhteystiedot" }}
      />

      {/* ── MIKSI HINNAT ALKAVAT TÄSTÄ? ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Läpinäkyvä hinnoittelu
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
              Miksi hinnat alkavat tästä?
            </h2>
            <p className="text-ink-dim max-w-lg mx-auto">
              Jokainen projekti on erilainen. Lopullinen hinta määräytyy yrityksesi tarpeiden,
              ominaisuuksien ja projektin laajuuden mukaan.
            </p>
          </div>
          <motion.div
            ref={reasonsRef}
            variants={staggerContainer}
            initial="hidden"
            animate={reasonsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {PRICING_REASONS.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200"
              >
                <CheckCircle2 size={20} className="text-copper mb-3" />
                <h3 className="font-heading font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MITEN HINNOITTELU MUODOSTUU? ── */}
      <section className="py-12 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-ink text-2xl sm:text-3xl">
              Miten hinnoittelu muodostuu?
            </h2>
            <p className="text-ink-dim text-sm mt-2">
              Hinta ei ole satunnainen — se syntyy selkeän prosessin kautta.
            </p>
          </div>
          <motion.div
            ref={stepsRef}
            variants={staggerContainer}
            initial="hidden"
            animate={stepsInView ? "visible" : "hidden"}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 max-w-3xl mx-auto"
          >
            {PRICING_STEPS.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-copper/10 border border-copper/30 flex items-center justify-center text-copper font-bold text-sm">
                    {step.num}
                  </div>
                  <span className="text-[11px] font-medium text-ink-dim text-center whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
                {i < PRICING_STEPS.length - 1 && (
                  <span className="text-ink-ghost hidden sm:inline mx-2 mb-5">→</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Starter packages for small businesses */}
      <section className="py-16">
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
            <CardCarousel defaultIndex={1}>
              {STARTER_PACKAGES.map((pkg) => (
                <Link key={pkg.name} href={`/yhteystiedot?palvelu=${pkg.slug}`} className={`p-6 rounded-xl border flex flex-col h-full hover:opacity-90 transition-opacity ${pkg.name === "Pro" ? "gradient-border-violet bg-elevated" : pkg.name === "Startti" ? "gradient-border-white bg-elevated" : "gradient-border bg-elevated shadow-glow"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-ink text-xl">{pkg.name}</h3>
                    {pkg.highlight && <Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge>}
                  </div>
                  <div className="mb-3"><span className="text-copper font-bold text-2xl">{pkg.setup}</span><span className="text-ink-dim text-sm ml-1">aloitus</span><span className="text-ink-ghost mx-2">+</span><span className="text-copper font-semibold">{pkg.monthly}</span></div>
                  <p className="text-ink-dim text-sm mb-4 leading-relaxed">{pkg.description}</p>
                  <ul className="space-y-2 flex-1 mb-6">{pkg.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-copper">Pyydä tarjous <ArrowRight size={14} /></span>
                </Link>
              ))}
            </CardCarousel>
          </div>
          {/* Desktop grid */}
          <motion.div ref={starterRef} variants={staggerContainer} initial="hidden" animate={starterInView ? "visible" : "hidden"} className="hidden md:grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STARTER_PACKAGES.map((pkg) => (
              <motion.div key={pkg.name} variants={fadeUp}>
                <Link href={`/yhteystiedot?palvelu=${pkg.slug}`} className={`p-6 rounded-xl border flex flex-col h-full hover:opacity-90 transition-opacity ${pkg.name === "Pro" ? "gradient-border-violet bg-elevated" : pkg.name === "Startti" ? "gradient-border-white bg-elevated" : "gradient-border bg-elevated"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-ink text-xl">{pkg.name}</h3>
                    {pkg.highlight && <Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge>}
                  </div>
                  <div className="mb-3"><span className="text-copper font-bold text-2xl">{pkg.setup}</span><span className="text-ink-dim text-sm ml-1">aloitus</span><span className="text-ink-ghost mx-2">+</span><span className="text-copper font-semibold">{pkg.monthly}</span></div>
                  <p className="text-ink-dim text-sm mb-4 leading-relaxed">{pkg.description}</p>
                  <ul className="space-y-2 flex-1 mb-6">{pkg.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-copper">Pyydä tarjous <ArrowRight size={14} /></span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10 text-center">
            Palveluiden hinnat
          </h2>
          {/* Mobile carousel */}
          <div className="md:hidden">
            <CardCarousel defaultIndex={2}>
              {SERVICES_PRICING.map((svc) => (
                <div key={svc.name} onClick={() => router.push(`/yhteystiedot?palvelu=${svc.slug}`)} className={`p-6 rounded-xl border flex flex-col h-full cursor-pointer hover:opacity-90 transition-opacity ${svc.name === "Verkkosivut" ? "gradient-border-white bg-elevated" : svc.name === "AI-ratkaisut" ? "gradient-border-teal bg-elevated" : svc.name === "Verkkokauppa" ? "gradient-border bg-elevated" : "gradient-border-violet bg-elevated"}`}>
                  <div className="mb-4"><h3 className="font-display font-bold text-ink text-xl mb-1">{svc.name}</h3><p className="text-copper font-semibold text-lg">{svc.price}</p><p className="text-ink-dim text-sm mt-2 leading-relaxed">{svc.description}</p></div>
                  <ul className="space-y-2 flex-1 mb-4">{svc.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <div className="flex items-center justify-between pt-3 border-t border-wire/40">
                    <Link href={svc.href} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-sm text-ink-dim hover:text-ink transition-colors">Lue lisää <ArrowRight size={13} /></Link>
                    <span className="flex items-center gap-1 text-sm font-medium text-copper">Pyydä tarjous <ArrowRight size={13} /></span>
                  </div>
                </div>
              ))}
            </CardCarousel>
          </div>
          {/* Desktop grid */}
          <motion.div ref={servicesRef} variants={staggerContainer} initial="hidden" animate={servicesInView ? "visible" : "hidden"} className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_PRICING.map((svc) => (
              <motion.div key={svc.name} variants={fadeUp}>
                <div onClick={() => router.push(`/yhteystiedot?palvelu=${svc.slug}`)} className={`p-6 rounded-xl border flex flex-col h-full cursor-pointer hover:opacity-90 transition-opacity ${svc.name === "Verkkosivut" ? "gradient-border-white bg-elevated" : svc.name === "AI-ratkaisut" ? "gradient-border-teal bg-elevated" : svc.name === "Verkkokauppa" ? "gradient-border bg-elevated" : "gradient-border-violet bg-elevated"}`}>
                  <div className="mb-4"><h3 className="font-display font-bold text-ink text-xl mb-1">{svc.name}</h3><p className="text-copper font-semibold text-lg">{svc.price}</p><p className="text-ink-dim text-sm mt-2 leading-relaxed">{svc.description}</p></div>
                  <ul className="space-y-2 flex-1 mb-4">{svc.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <div className="flex items-center justify-between pt-3 border-t border-wire/40">
                    <Link href={svc.href} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-sm text-ink-dim hover:text-ink transition-colors">Lue lisää <ArrowRight size={13} /></Link>
                    <span className="flex items-center gap-1 text-sm font-medium text-copper">Pyydä tarjous <ArrowRight size={13} /></span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16">
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
            <CardCarousel defaultIndex={1}>
              {MAINTENANCE_TIERS.map((tier) => (
                <div key={tier.name} className={`p-6 rounded-xl border flex flex-col h-full ${tier.name === "Perus" ? "gradient-border-white bg-elevated" : tier.name === "Standardi" ? "gradient-border bg-elevated" : "gradient-border-violet bg-elevated"}`}>
                  {tier.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                  <h3 className="font-heading font-bold text-ink mb-1">{tier.name}</h3>
                  <p className="text-copper font-semibold mb-4">{tier.price}</p>
                  <ul className="space-y-2 flex-1 mb-6">{tier.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                  <Link href={`/yhteystiedot?palvelu=${tier.slug}`} className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors">Pyydä tarjous <ArrowRight size={14} /></Link>
                </div>
              ))}
            </CardCarousel>
          </div>
          {/* Desktop grid */}
          <motion.div ref={maintenanceRef} variants={staggerContainer} initial="hidden" animate={maintenanceInView ? "visible" : "hidden"} className="hidden md:grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {MAINTENANCE_TIERS.map((tier) => (
              <motion.div key={tier.name} variants={fadeUp} className={`relative p-6 rounded-xl border flex flex-col ${tier.name === "Perus" ? "gradient-border-white bg-elevated" : tier.name === "Standardi" ? "gradient-border bg-elevated" : "gradient-border-violet bg-elevated"}`}>
                {tier.highlight && <div className="flex justify-center mb-4"><Badge variant="accent" className="ring-1 ring-copper/40">Suosituin</Badge></div>}
                <h3 className="font-heading font-bold text-ink mb-1">{tier.name}</h3>
                <p className="text-copper font-semibold mb-4">{tier.price}</p>
                <ul className="space-y-2 flex-1 mb-6">{tier.features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-dim"><CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{f}</li>)}</ul>
                <Link href={`/yhteystiedot?palvelu=${tier.slug}`} className="flex items-center gap-1.5 text-sm font-medium text-copper hover:text-copper-light transition-colors">Pyydä tarjous <ArrowRight size={14} /></Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Lisäpalvelut</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-3">
              Yksittäiset lisäykset
            </h2>
            <p className="text-ink-dim max-w-lg mx-auto">
              Tarvitsetko vain yhden ominaisuuden? Lisätään se sivustollesi ilman koko pakettia.
            </p>
          </div>
          <motion.div
            ref={addOnsRef}
            variants={staggerContainer}
            initial="hidden"
            animate={addOnsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto"
          >
            {ADD_ONS.map((addon) => (
              <motion.div key={addon.name} variants={fadeUp} className="flex items-start gap-2.5 p-3 rounded-xl border border-wire bg-elevated hover:border-copper/30 transition-colors">
                <CheckCircle2 size={13} className="text-copper shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink text-xs leading-tight">{addon.name}</p>
                  <p className="text-copper font-bold text-xs mt-0.5">{addon.price}</p>
                  <p className="text-ink-ghost text-[10px] leading-relaxed mt-1">{addon.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-8">
            <Link href="/yhteystiedot" className="inline-flex items-center gap-2 text-sm font-medium text-copper hover:text-copper-light transition-colors">
              Kysy lisäpalvelusta <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MITÄ KAIKKI PROJEKTIT SISÄLTÄVÄT? ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Jokaisessa projektissa
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-3">
              Mitä kaikki projektit sisältävät?
            </h2>
            <p className="text-ink-dim max-w-md mx-auto">
              Nämä kuuluvat jokaiseen projektiimme — riippumatta koosta tai paketista.
            </p>
          </div>
          <motion.div
            ref={includedRef}
            variants={staggerContainer}
            initial="hidden"
            animate={includedInView ? "visible" : "hidden"}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {INCLUDED.map((item) => (
              <motion.div
                key={item}
                variants={fadeUp}
                className="p-5 rounded-xl border border-wire bg-elevated flex items-center gap-3 hover:border-copper/30 transition-colors"
              >
                <CheckCircle2 size={18} className="text-copper shrink-0" />
                <span className="font-heading font-semibold text-ink text-sm">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 bg-surface/30">
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

      {/* ── LUOTTAMUSOSIO ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
            Tulokset puhuvat puolestaan
          </p>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10">
            Miksi asiakkaat valitsevat Apex Siten?
          </h2>
          <motion.div
            ref={trustRef}
            variants={staggerContainer}
            initial="hidden"
            animate={trustInView ? "visible" : "hidden"}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {TRUST_STATS.map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="text-center">
                <p className="text-4xl font-bold text-copper leading-none">{value}</p>
                <p className="text-sm text-ink-dim mt-2">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VAHVEMPI CTA ── */}
      <section className="relative py-24 overflow-hidden bg-elevated border-t border-wire">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-copper/10 blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center max-w-3xl">
          <p className="text-ink-ghost text-sm mb-4">
            Etkö ole varma mikä ratkaisu sopii yrityksellesi?
          </p>
          <h2 className="font-display font-bold text-ink text-4xl sm:text-5xl leading-tight mb-5">
            Varaa maksuton{" "}
            <span className="text-copper">30 minuutin kartoitus.</span>
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Käymme yhdessä läpi yrityksesi tarpeet ja suosittelemme juuri sinulle sopivan
            ratkaisun ilman sitoutumista.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button asChild size="lg" className="group">
              <Link href="/yhteystiedot">
                Varaa maksuton kartoitus
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="tel:+358442455490" className="flex items-center gap-2">
                <Phone size={16} /> Soita meille
              </Link>
            </Button>
          </div>
          <p className="text-xs text-ink-ghost">
            Vastaamme 24 tunnissa · Ei sitoutumista · Ilmainen kartoitus
          </p>
        </div>
      </section>
    </>
  );
}

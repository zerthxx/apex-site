import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BarChart2,
  Settings,
  Zap,
  Shield,
  Code2,
  Headphones,
  TrendingUp,
  Layers,
  Globe,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RequestQuoteLink } from "@/components/ui/RequestQuoteLink";
import { RevealSection } from "@/components/shared/RevealSection";
import { ProcessTimeline } from "@/components/shared/ProcessTimeline";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { SoftwareDashboardMockup } from "./SoftwareDashboardMockup";

export const metadata: Metadata = {
  title:
    "Räätälöidyt ohjelmistot — Dashboardit, portaalit ja verkkosovellukset",
  description:
    "Rakennamme yrityksille räätälöityjä verkkosovelluksia, dashboardeja, asiakasportaaleja, varausjärjestelmiä ja muita liiketoimintaa tukevia ohjelmistoja.",
  alternates: { canonical: "https://apexsite.fi/palvelut/ohjelmistot" },
};

const TRUST_ITEMS = [
  "Räätälöity ratkaisu",
  "Next.js & React",
  "Alkaen 5 000 €",
  "Maksuton kartoitus",
];

const BUILD_CARDS = [
  {
    icon: LayoutDashboard,
    title: "Dashboardit",
    text: "Reaaliaikaiset näkymät liiketoimintadataan ja mittareihin.",
  },
  {
    icon: Users,
    title: "Asiakasportaalit",
    text: "Asiakkaillesi räätälöity kirjautumisalue palveluiden hallintaan.",
  },
  {
    icon: CalendarDays,
    title: "Varausjärjestelmät",
    text: "Ajanvaraus, resurssien hallinta ja kalenteriintegraatiot.",
  },
  {
    icon: Settings,
    title: "Hallintapaneelit",
    text: "Sisällön, käyttäjien ja datan hallinta helposti selaimesta.",
  },
  {
    icon: Globe,
    title: "CRM-ratkaisut",
    text: "Asiakassuhteiden hallinta räätälöitynä juuri teidän prosesseihinne.",
  },
  {
    icon: Zap,
    title: "Sisäiset työkalut",
    text: "Automatisoi manuaaliset prosessit ja tehosta tiimisi työtä.",
  },
  {
    icon: BarChart2,
    title: "Raportointijärjestelmät",
    text: "Automaattiset raportit, analytiikka ja datan visualisointi.",
  },
  {
    icon: Layers,
    title: "Integraatiot",
    text: "Yhdistä olemassaolevat järjestelmät saumattomasti.",
  },
];

const USE_CASES = [
  {
    emoji: "🏗️",
    title: "Rakennusyritykset",
    text: "Projektien ja resurssien hallinta",
  },
  {
    emoji: "🍔",
    title: "Ravintolat",
    text: "Tilaukset, varaukset ja kanta-asiakkaat",
  },
  {
    emoji: "🚗",
    title: "Autoliikkeet",
    text: "Varastonhallinta ja asiakkaiden seuranta",
  },
  {
    emoji: "🏥",
    title: "Terveyspalvelut",
    text: "Ajanvaraus ja potilashallinta",
  },
  {
    emoji: "⚖️",
    title: "Lakitoimistot",
    text: "Asiakkuudet ja dokumenttien hallinta",
  },
  {
    emoji: "🏠",
    title: "Kiinteistövälittäjät",
    text: "Kohteet ja asiakkaiden seuranta",
  },
  { emoji: "💼", title: "Konsultit", text: "Projektit, laskutus ja asiakkaat" },
  {
    emoji: "🏢",
    title: "PK-yritykset",
    text: "Räätälöity juuri teidän prosesseihinne",
  },
];

const FEATURES = [
  {
    emoji: "🔐",
    title: "Käyttäjähallinta",
    text: "Kirjautuminen ja tunnistautuminen",
  },
  {
    emoji: "👥",
    title: "Roolit ja oikeudet",
    text: "Hallitse kuka näkee mitä",
  },
  {
    emoji: "📊",
    title: "Dashboardit",
    text: "Reaaliaikaiset mittarit ja KPI:t",
  },
  {
    emoji: "📈",
    title: "Raportointi",
    text: "Automaattiset raportit ja vienti",
  },
  {
    emoji: "🔌",
    title: "API-integraatiot",
    text: "Yhdistä kolmansien osapuolien palvelut",
  },
  { emoji: "🗄️", title: "Tietokannat", text: "Skaalautuva tietoarkkitehtuuri" },
  { emoji: "🔔", title: "Ilmoitukset", text: "Sähköposti, push ja in-app" },
  {
    emoji: "📁",
    title: "Tiedostojen hallinta",
    text: "Lataus, tallennus ja jako",
  },
  {
    emoji: "🔍",
    title: "Hakutoiminnot",
    text: "Nopea haku kaikesta sisällöstä",
  },
  {
    emoji: "⚡",
    title: "Automaatiot",
    text: "Automatisoi toistuvat työnkulut",
  },
];

const TECHS = [
  { name: "React", slug: "react", desc: "UI-komponenttikirjasto" },
  { name: "Next.js", slug: "nextdotjs", desc: "Full-stack framework" },
  { name: "Node.js", slug: "nodedotjs", desc: "Palvelinpuolen logiikka" },
  { name: "TypeScript", slug: "typescript", desc: "Tyyppiturvallinen kehitys" },
  { name: "PostgreSQL", slug: "postgresql", desc: "Luotettava tietokanta" },
  { name: "Supabase", slug: "supabase", desc: "Open-source backend" },
  { name: "Docker", slug: "docker", desc: "Konttipohjainen deploy" },
  { name: "Cloudflare", slug: "cloudflare", desc: "CDN ja tietoturva" },
  { name: "OpenAI", slug: "openai", desc: "AI-ominaisuudet" },
  { name: "Stripe", slug: "stripe", desc: "Maksuintegraatiot" },
];

const STEPS = [
  {
    title: "Maksuton kartoitus",
    text: "30 min puhelu: liiketoimintatarpeet, haasteet ja tavoitteet.",
  },
  {
    title: "Suunnittelu",
    text: "Tekninen arkkitehtuuri, tietokantasuunnittelu ja rajapinnat.",
  },
  {
    title: "UX/UI-suunnittelu",
    text: "Wireframe ja visuaalinen design Figmassa.",
  },
  { title: "Kehitys", text: "Sprinteissä — näytämme edistymisen viikoittain." },
  {
    title: "Testaus",
    text: "Automaattiset testit ja käyttäjätestaus oikeilla käyttäjillä.",
  },
  { title: "Julkaisu", text: "Käyttöönotto, koulutus ja dokumentaatio." },
  { title: "Jatkuva ylläpito", text: "Päivitykset, seuranta ja jatkokehitys." },
];

const KARTOITUS_ITEMS = [
  "Liiketoimintatarpeet ja nykyiset haasteet",
  "Tavoitteet ja mittarit",
  "Käyttäjät ja käyttöoikeudet",
  "Mahdolliset integraatiot olemassaoleviin järjestelmiin",
  "Aikataulu ja virstanpylväät",
  "Alustava kustannusarvio",
  "Teknologiasuositukset",
  "Ei sitoutumista — täysin maksuton",
];

const WHY_INVEST = [
  {
    emoji: "⏱️",
    title: "Säästää aikaa",
    text: "Automaattiset prosessit vapauttavat tunteja viikossa manuaalisesta työstä.",
  },
  {
    emoji: "⚡",
    title: "Lisää tehokkuutta",
    text: "Tiimisi tekee enemmän vähemmällä — ilman ylimääräisiä rekrytointeja.",
  },
  {
    emoji: "🎯",
    title: "Vähentää virheitä",
    text: "Ohjelmisto ei unohda eikä tee inhimillisiä virheitä.",
  },
  {
    emoji: "📈",
    title: "Skaalautuu kasvun mukana",
    text: "Järjestelmä kasvaa yrityksesi mukana ilman uudelleenrakentamista.",
  },
];

const WHY_US = [
  {
    icon: Code2,
    title: "Räätälöity ratkaisu",
    text: "Ei valmistuotteita. Ohjelmisto rakennetaan juuri sinun prosesseihin sopivaksi.",
  },
  {
    icon: Zap,
    title: "Nopea kehitys",
    text: "MVP valmiina 6–10 viikossa. Iteroimme nopeasti palautteen perusteella.",
  },
  {
    icon: Layers,
    title: "Skaalautuva arkkitehtuuri",
    text: "Kasva sadoista tuhansiin käyttäjiin ilman uudelleenrakentamista.",
  },
  {
    icon: Shield,
    title: "Turvallinen toteutus",
    text: "GDPR, salattu tiedonsiirto, roolipohjainen pääsynhallinta.",
  },
  {
    icon: Headphones,
    title: "Jatkuva tuki",
    text: "Emme katoa julkaisun jälkeen. Ylläpito ja kehitys kuuluvat kumppanuuteen.",
  },
  {
    icon: TrendingUp,
    title: "Mitattavat tulokset",
    text: "Seuraamme käyttödataa ja kehitämme ohjelmistoa sen perusteella.",
  },
];

const FAQ = [
  {
    id: "1",
    question: "Kuinka kauan kehitys kestää?",
    answer:
      "MVP 6–10 viikkoa, laajempi järjestelmä 3–6 kuukautta. Tarkka aikataulu määrittyy kartoituspuhelussa.",
  },
  {
    id: "2",
    question: "Voidaanko ohjelmisto integroida nykyisiin järjestelmiin?",
    answer:
      "Kyllä. Integroimme mihin tahansa moderniin API:iin. Legacy-järjestelmille rakennumme tarvittaessa välitason.",
  },
  {
    id: "3",
    question: "Voinko laajentaa ohjelmistoa myöhemmin?",
    answer:
      "Kyllä. Rakennamme modulaarisen arkkitehtuurin, johon uusia ominaisuuksia lisätään helposti ilman koko järjestelmän uudelleenrakentamista.",
  },
  {
    id: "4",
    question: "Tarjoatteko ylläpitoa?",
    answer:
      "Kyllä. Ylläpitosopimus kattaa päivitykset, bugikorjaukset, suorituskyvyn seurannan ja tukipalvelun.",
  },
  {
    id: "5",
    question: "Omistanko lähdekoodin?",
    answer:
      "Kyllä. Kaikki lähdekoodi ja tekijänoikeudet siirtyvät sinulle projektin päättyessä.",
  },
  {
    id: "6",
    question: "Paljonko ohjelmiston kehitys maksaa?",
    answer:
      "Pienemmät ohjelmistot alkaen 5 000 €, laajemmat järjestelmät 15 000–50 000 €. Tarkka hinta selviää kartoituksen jälkeen.",
  },
];

export default function OhjelmistotPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-copper/8 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-copper/5 blur-[80px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-5">
                Räätälöidyt ohjelmistot
              </Badge>
              <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Rakennamme ohjelmistoja, jotka{" "}
                <span className="text-copper">
                  automatisoivat yrityksesi työn ja säästävät aikaa.
                </span>
              </h1>
              <p className="text-ink-dim text-lg leading-relaxed mb-8">
                Lopeta manuaalinen työ. Räätälöity ohjelmisto hoitaa
                rutiinitehtävät automaattisesti — niin tiimisi voi keskittyä
                oikeasti tärkeisiin asioihin.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
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
                  <RequestQuoteLink href="/yhteystiedot">
                    Pyydä tarjous
                  </RequestQuoteLink>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_ITEMS.map((t) => (
                  <span
                    key={t}
                    className="text-sm text-ink-dim flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} className="text-copper shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-copper/6 blur-2xl" />
              <SoftwareDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── MITÄ RAKENNAMME ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Mitä rakennamme?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Moderneja ohjelmistoja, jotka tukevat liiketoimintaasi.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BUILD_CARDS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-copper" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink mb-2">
                    {title}
                  </h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── KENELLE SOPII ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Kenelle palvelu sopii?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Räätälöity ohjelmisto sopii lähes kaikille toimialoille.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {USE_CASES.map(({ emoji, title, text }) => (
                <div
                  key={title}
                  className="p-5 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3">{emoji}</div>
                  <h3 className="font-heading font-semibold text-ink text-sm mb-1">
                    {title}
                  </h3>
                  <p className="text-ink-ghost text-xs leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── MITÄ VOI SISÄLTÄÄ ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Mitä ohjelmisto voi sisältää?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Kaikki mitä moderni liiketoimintaohjelmisto tarvitsee.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {FEATURES.map(({ emoji, title, text }) => (
                <div
                  key={title}
                  className="p-5 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3">{emoji}</div>
                  <h3 className="font-heading font-semibold text-ink text-sm mb-1">
                    {title}
                  </h3>
                  <p className="text-ink-ghost text-xs leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── TEKNOLOGIAT ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Teknologiat
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Parhaat teknologiat moderniin ohjelmistokehitykseen.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-3">
              {TECHS.map(({ name, slug, desc }) => (
                <div
                  key={name}
                  className="group relative p-4 rounded-xl bg-elevated border border-wire hover:border-copper/30 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow transition-all duration-200 flex flex-col items-center gap-2.5 cursor-default"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.simpleicons.org/${slug}/C8813A`}
                    width={28}
                    height={28}
                    alt={name}
                    loading="lazy"
                    className="transition-transform duration-200 group-hover:scale-110"
                  />
                  <span className="text-[11px] text-ink-ghost text-center leading-tight">
                    {name}
                  </span>
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-150 pointer-events-none z-20">
                    <div className="bg-surface border border-wire rounded-lg px-3 py-1.5 text-[11px] text-ink whitespace-nowrap shadow-xl">
                      {desc}
                    </div>
                    <div className="w-2 h-2 bg-surface border-b border-r border-wire rotate-45 mx-auto -mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── PROSESSI ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Prosessi
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Ohjelmisto valmiiksi askel askeleelta.
            </h2>
          </RevealSection>
          <ProcessTimeline steps={STEPS} />
        </div>
      </section>

      {/* ── MAKSUTON KARTOITUS ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
                  Maksuton kartoitus
                </p>
                <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">
                  Aloitetaan 30 minuutin puhelulla.
                </h2>
                <p className="text-ink-dim leading-relaxed mb-8">
                  Kerro ohjelmistotarpeesi — me hoidamme loput. Kartoituspuhelu
                  on täysin maksuton ja ilman sitoutumista. Saat selkeän
                  suosituksen teknologiasta, aikataulusta ja kustannuksista.
                </p>
                <Button asChild size="lg" className="group">
                  <Link href="/yhteystiedot">
                    Varaa maksuton kartoitus
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              </div>
              <div className="p-6 rounded-xl border border-wire bg-elevated">
                <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-4">
                  Kartoituksessa käymme läpi
                </p>
                <ul className="space-y-3">
                  {KARTOITUS_ITEMS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-ink-dim"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-copper shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── MIKSI INVESTOIDA ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Miksi investoida?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Miksi yritykset investoivat räätälöityyn ohjelmistoon?
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {WHY_INVEST.map(({ emoji, title, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:-translate-y-0.5 hover:shadow-glow transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3">{emoji}</div>
                  <h3 className="font-heading font-semibold text-ink mb-2">
                    {title}
                  </h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── TULEVAT PROJEKTIT ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Tulevat asiakasprojektit
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Projektimme ovat vielä käynnissä.
            </h2>
            <p className="text-ink-dim mt-4 max-w-lg leading-relaxed">
              Referenssimme julkaistaan asiakkaiden luvalla heti projektien
              valmistuttua. Ota yhteyttä — kerromme mielellään tarkemmin
              millaisiin projekteihin olemme erikoistuneet.
            </p>
          </RevealSection>
          <RevealSection>
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-copper/30 bg-copper/5 text-sm text-copper font-medium">
              <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />3
              projektia parhaillaan kehityksessä
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── MIKSI APEX SITE ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Miksi Apex Site?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Kumppani, joka rakentaa ohjelmiston — ja pitää sen ajan tasalla.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_US.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-copper" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink mb-2">
                    {title}
                  </h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <RevealSection className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Usein kysyttyä
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl">
              Vastauksia yleisimpiin kysymyksiin.
            </h2>
          </RevealSection>
          <RevealSection>
            <FaqAccordion items={FAQ} />
          </RevealSection>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-32 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-copper/12 blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative text-center max-w-4xl">
          <Badge className="mb-6">Aloitetaan</Badge>
          <h2 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            Rakennetaan ohjelmisto, joka{" "}
            <span className="text-copper">
              säästää aikaa ja kasvattaa yrityksesi tehokkuutta.
            </span>
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Varaa maksuton 30 minuutin kartoitus. Käymme läpi yrityksesi tarpeet
            ja suunnittelemme juuri sinulle sopivan ohjelmistoratkaisun ilman
            sitoutumista.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
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
              <Link
                href="tel:+358401234567"
                className="flex items-center gap-2"
              >
                <Phone size={16} /> Soita meille
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              "Maksuton kartoitus",
              "Ei sitoutumista",
              "Lähdekoodi sinulle",
            ].map((t) => (
              <span
                key={t}
                className="text-sm text-ink-dim flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} className="text-copper shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

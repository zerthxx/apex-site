import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  MessageCircle,
  BarChart2,
  Zap,
  Timer,
  TrendingUp,
  Bot,
  Plug,
  Wand2,
  Shield,
  Lock,
  Headphones,
  ArrowRight,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RequestQuoteLink } from "@/components/ui/RequestQuoteLink";
import { RevealSection } from "@/components/shared/RevealSection";
import { ProcessTimeline } from "@/components/shared/ProcessTimeline";
import { AiDashboardMockup } from "./AiDashboardMockup";

export const metadata: Metadata = {
  title: "AI-ratkaisut yritykselle — Automaatio, chatbotit ja integraatiot",
  description:
    "Räätälöidyt AI-ratkaisut yrityksille. Automatisoi prosessit, säästä aikaa ja kasvata liiketoimintaasi. Chatbotit, automaatiot ja AI-integraatiot. Alkaen 4 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/ai-ratkaisut" },
};

const WHY_AI_CARDS = [
  {
    icon: Clock,
    title: "Toistuvat tehtävät vievät aikaa",
    text: "Sähköpostien lajittelu, raporttien luonti, datan syöttäminen — AI automatisoi nämä sekunteissa ja vapauttaa tiimisi aikaa tärkeämpään.",
  },
  {
    icon: MessageCircle,
    title: "Asiakaspalvelu ei ole käytettävissä 24/7",
    text: "80 % asiakaskysymyksistä on toistuvia. AI-chatbot vastaa niihin välittömästi — yöllä, viikonloppuna, ilman odotusaikaa.",
  },
  {
    icon: BarChart2,
    title: "Dataa ei hyödynnetä tehokkaasti",
    text: "Tieto on hajallaan eri järjestelmissä. AI kokoaa, analysoi ja esittää sen selkeästi — parempia päätöksiä, nopeammin.",
  },
  {
    icon: Zap,
    title: "Manuaalinen työ hidastaa kasvua",
    text: "Jokainen minuutti manuaalisessa työssä on poissa liiketoiminnan kehittämisestä. AI tekee nämä tehtävät automaattisesti.",
  },
  {
    icon: Timer,
    title: "Prosessit ovat hitaita",
    text: "Hyväksyntäkierrokset, raportointi, tiedonhaku — AI nopeuttaa prosesseja tunnista minuutteihin.",
  },
  {
    icon: TrendingUp,
    title: "Yritys haluaa automatisoida enemmän",
    text: "Kilpailijat ottavat AI:n käyttöön. Automaatio ei ole enää tulevaisuutta — se on nykypäivää.",
  },
];

const SERVICE_CARDS = [
  {
    icon: Bot,
    title: "AI Chatbotit",
    desc: "Asiakaspalvelu, joka ei nuku.",
    items: [
      "24/7 asiakaspalvelu",
      "Useita kieliä",
      "FAQ-automaatio",
      "Leadien kerääminen",
    ],
  },
  {
    icon: Zap,
    title: "AI Automaatiot",
    desc: "Toistuvat tehtävät pois tiimiltäsi.",
    items: [
      "Sähköpostiautomaatio",
      "CRM-päivitykset",
      "PDF-käsittely",
      "Raportit",
      "Työnkulut",
    ],
  },
  {
    icon: Plug,
    title: "AI Integraatiot",
    desc: "AI osaksi nykyisiä järjestelmiäsi.",
    items: [
      "OpenAI & Anthropic",
      "Gemini",
      "REST API",
      "Dashboardit",
      "Olemassaoleva infra",
    ],
  },
];

const USE_CASES = [
  {
    emoji: "🤖",
    title: "Asiakaspalvelu",
    text: "AI vastaa kysymyksiin 24/7 ilman odotusaikaa",
  },
  {
    emoji: "📧",
    title: "Sähköpostit",
    text: "Automaattinen lajittelu ja vastausluonnokset",
  },
  {
    emoji: "📄",
    title: "Dokumentit",
    text: "Analysointi, yhteenvedot ja tiedon haku",
  },
  {
    emoji: "📊",
    title: "Raportointi",
    text: "Automaattiset raportit ajastettuna",
  },
  {
    emoji: "📅",
    title: "Varausjärjestelmät",
    text: "Automaattiset vahvistukset ja muistutukset",
  },
  {
    emoji: "🛒",
    title: "Verkkokauppa",
    text: "Tuotesuositukset ja asiakastuki",
  },
  {
    emoji: "📈",
    title: "Myyntianalytiikka",
    text: "Ennusteet, trendit ja myyntiputken hallinta",
  },
  {
    emoji: "🔗",
    title: "CRM-integraatiot",
    text: "Automaattiset asiakastietojen päivitykset",
  },
];

const TECHS = [
  { name: "OpenAI", slug: "openai", desc: "GPT-4o ja o3-mallit" },
  { name: "Anthropic", slug: "anthropic", desc: "Claude 3.5 & 4" },
  { name: "Gemini", slug: "googlegemini", desc: "Googlen AI-malli" },
  { name: "LangChain", slug: "langchain", desc: "AI-ketjutusframework" },
  { name: "Python", slug: "python", desc: "AI-kehityksen kieli" },
  { name: "FastAPI", slug: "fastapi", desc: "Nopea API-kehys" },
  { name: "React", slug: "react", desc: "UI-komponenttikirjasto" },
  { name: "Next.js", slug: "nextdotjs", desc: "Full-stack framework" },
  { name: "Node.js", slug: "nodedotjs", desc: "Palvelinpuolen JS" },
  { name: "Docker", slug: "docker", desc: "Konttipohjainen deploy" },
  { name: "PostgreSQL", slug: "postgresql", desc: "Luotettava tietokanta" },
  {
    name: "Azure OpenAI",
    slug: "microsoftazure",
    desc: "Enterprise AI-palvelu",
  },
];

const STEPS = [
  {
    title: "Ota yhteyttä",
    text: "Live Chat, AI-chatbotti tai yhteydenottolomake — valitse sinulle sopivin tapa.",
  },
  {
    title: "Maksuton 30 min kartoitus",
    text: "Selvitämme yrityksesi tarpeet, tavoitteet ja mahdollisuudet.",
  },
  {
    title: "AI-prosessien kartoitus",
    text: "Tunnistamme prosessit, joissa AI tuo eniten hyötyä ja konkreettisia säästöjä.",
  },
  {
    title: "Ratkaisun suunnittelu",
    text: "Suunnittelemme teknisen arkkitehtuurin ja valitsemme oikeat mallit.",
  },
  {
    title: "Prototyyppi",
    text: "Rakennamme toimivan prototyypin ja validoimme sen kanssasi nopeasti.",
  },
  {
    title: "Kehitys",
    text: "Rakennamme ja integroimme AI-ratkaisun olemassaoleviin järjestelmiisi.",
  },
  {
    title: "Testaus",
    text: "Testaamme tarkkuuden, suorituskyvyn ja tietoturvan perusteellisesti.",
  },
  {
    title: "Käyttöönotto",
    text: "Käynnistämme ratkaisun turvallisesti ja koulutamme tiimisi.",
  },
  {
    title: "Tuki ja jatkokehitys",
    text: "Mittaamme hyödyt jatkuvasti ja kehitämme ratkaisua liiketoimintasi mukana.",
  },
];

const KARTOITUS_ITEMS = [
  "Käymme läpi yrityksesi nykyiset prosessit",
  "Kartoitamme mitkä työvaiheet voidaan automatisoida",
  "Suosittelemme sopivaa AI-ratkaisua",
  "Arvioimme aikataulun ja resurssit",
  "Saat alustavan kustannusarvion",
  "Ei sitoutumista — täysin maksuton",
];

const WHY_US = [
  {
    icon: Wand2,
    title: "Räätälöidyt AI-ratkaisut",
    text: "Ei valmiita ratkaisuja — jokainen AI rakennetaan yrityksesi prosessien ja tavoitteiden mukaan.",
  },
  {
    icon: Zap,
    title: "Modernit teknologiat",
    text: "OpenAI, Anthropic, LangChain — parhaat mallit ja työkalut käytössäsi heti.",
  },
  {
    icon: Shield,
    title: "Turvallinen toteutus",
    text: "GDPR-vaatimusten mukainen toteutus. Arkaluonteinen data ei poistu järjestelmistäsi.",
  },
  {
    icon: Lock,
    title: "GDPR huomioitu",
    text: "Datan käsittely EU:n tietosuoja-asetuksen mukaisesti. Voidaan käyttää myös paikallisia malleja.",
  },
  {
    icon: Headphones,
    title: "Jatkuva tuki",
    text: "Emme katoa käyttöönoton jälkeen — mittaamme tuloksia ja kehitämme ratkaisua jatkuvasti.",
  },
  {
    icon: TrendingUp,
    title: "Skaalautuvat ratkaisut",
    text: "AI-ratkaisu kasvaa yrityksesi mukana. Uusia automaatioita voidaan lisätä helposti.",
  },
];

const FAQ = [
  {
    id: "1",
    question: "Tarvitsenko AI-osaamista?",
    answer:
      "Ei lainkaan. Hoidamme kaiken teknisen toteutuksen. Sinun tarvitsee vain kertoa, mitä haluat automatisoida — me huolehdimme lopusta.",
  },
  {
    id: "2",
    question: "Voidaanko AI integroida nykyiseen järjestelmääni?",
    answer:
      "Kyllä. Rakennamme AI:n integroitumaan olemassaoleviin järjestelmiisi — CRM, sähköposti, ERP tai täysin räätälöity ohjelmisto. Integraatio on osa jokaista projektia.",
  },
  {
    id: "3",
    question: "Kuinka turvallista AI on?",
    answer:
      "Erittäin turvallista. Rakennamme ratkaisut siten, että arkaluonteinen data ei poistu järjestelmistäsi. Voimme käyttää myös paikallisia malleja täydellisen tietosuojan takaamiseksi.",
  },
  {
    id: "4",
    question: "Voinko käyttää OpenAI:tä?",
    answer:
      "Kyllä. Käytämme OpenAI:n GPT-4o- ja o3-malleja laajasti. Sinulla voi olla oma API-avain tai hoidamme sen puolestasi kustannustehokkaasti.",
  },
  {
    id: "5",
    question: "Voinko käyttää Anthropic Claudea?",
    answer:
      "Kyllä. Claude 3.5 ja Claude 4 ovat erinomaisia ratkaisuja erityisesti pitkien dokumenttien käsittelyyn, tarkkaan analytiikkaan ja monimutkaisiin tehtäviin.",
  },
  {
    id: "6",
    question: "Kuinka kauan projekti kestää?",
    answer:
      "Yksinkertainen automaatio tai chatbot valmistuu 2–4 viikossa. Monimutkaisempi ratkaisu integraatioineen 6–12 viikossa. Saat tarkan aikataulun kartoituspuhelun jälkeen.",
  },
  {
    id: "7",
    question: "Voinko aloittaa pienellä pilotilla?",
    answer:
      "Kyllä — ja suosittelemme sitä lämpimästi. Pilotti on nopein tapa osoittaa konkreettiset hyödyt ennen laajempaa käyttöönottoa.",
  },
  {
    id: "8",
    question: "Paljonko AI-ratkaisu maksaa?",
    answer:
      "Projekti alkaen 4 000 €. API-kulut vaihtelevat käytön mukaan, tyypillisesti 20–500 €/kk. Saat läpinäkyvän tarjouksen ilman piilokuluja kartoituspuhelun jälkeen.",
  },
];

export default function AiRatkaisutPage() {
  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-copper/5 blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-teal-brand/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <Badge variant="accent" className="mb-5">
                AI-ratkaisut
              </Badge>
              <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Tekoäly tekee rutiinityöt puolestasi – sinä keskityt
                liiketoimintasi kasvattamiseen.
              </h1>
              <p className="text-ink-dim text-lg leading-relaxed mb-8">
                Rakennamme yrityksellesi räätälöityjä AI-ratkaisuja, jotka
                automatisoivat työvaiheita, nopeuttavat asiakaspalvelua,
                analysoivat dataa ja vapauttavat aikaa tärkeämpiin tehtäviin.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button asChild size="lg" className="group">
                  <Link href="/yhteystiedot">
                    Varaa maksuton 30 min kartoitus
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <RequestQuoteLink href="/yhteystiedot?palvelu=ai-ratkaisut">
                    <Phone size={16} />
                    Pyydä tarjous
                  </RequestQuoteLink>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  "Maksuton kartoitus",
                  "Ei sitoutumista",
                  "Räätälöity ratkaisu",
                  "Integrointi järjestelmiisi",
                ].map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 text-sm text-ink-dim"
                  >
                    <span className="text-copper font-bold">✓</span>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — AI dashboard mockup */}
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl bg-copper/6 blur-2xl"
                aria-hidden
              />
              <AiDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MIKSI AI? ───────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                Miksi AI?
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Tunnistetko nämä haasteet?
              </h2>
              <p className="text-ink-dim mt-3 max-w-lg mx-auto">
                Nämä ovat yleisimmät syyt, miksi yritykset ottavat AI:n
                käyttöön.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_AI_CARDS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/40 hover:shadow-glow hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-copper" />
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

      {/* ─── MITÄ SAAT MEILTÄ ────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                Palvelut
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Mitä saat meiltä
              </h2>
              <p className="text-ink-dim mt-3 max-w-lg mx-auto">
                Konkreettisia, mitattavia tuloksia — ei pelkkiä kokeiluja.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {SERVICE_CARDS.map(({ icon: Icon, title, desc, items }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-copper/10 flex items-center justify-center">
                      <Icon size={16} className="text-copper" />
                    </div>
                    <h3 className="font-heading font-semibold text-ink">
                      {title}
                    </h3>
                  </div>
                  <p className="text-ink-dim text-sm mb-4">{desc}</p>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-ink-dim"
                      >
                        <CheckCircle2
                          size={14}
                          className="text-copper shrink-0"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-wire">
              <div>
                <span className="text-ink-ghost text-sm">Alkaen </span>
                <span className="text-copper font-bold text-2xl">4 000 €</span>
                <span className="text-ink-ghost text-sm ml-1">
                  räätälöity AI-projekti
                </span>
              </div>
              <Button asChild size="md" className="group">
                <RequestQuoteLink href="/yhteystiedot?palvelu=ai-ratkaisut">
                  Pyydä tarjous
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </RequestQuoteLink>
              </Button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── KÄYTTÖKOHTEET ───────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                Käyttökohteet
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Missä AI auttaa?
              </h2>
              <p className="text-ink-dim mt-3 max-w-lg mx-auto">
                AI sopii lähes kaikkiin toistuviin prosesseihin. Tässä
                yleisimmät käyttökohteet.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {USE_CASES.map(({ emoji, title, text }) => (
                <div
                  key={title}
                  className="p-5 rounded-xl border border-wire bg-elevated hover:border-copper/40 hover:shadow-glow hover:scale-[1.02] transition-all duration-200 text-center"
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

      {/* ─── TEKNOLOGIAT ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                Teknologiat
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Parhaat AI-työkalut käytössäsi
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {TECHS.map(({ name, slug, desc }) => (
                <div
                  key={name}
                  className="group relative p-4 rounded-xl bg-elevated border border-wire
                  hover:border-copper/30 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-glow
                  transition-all duration-200 flex flex-col items-center gap-2.5 cursor-default"
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
                  <div
                    className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                    transition-opacity duration-150 delay-150 pointer-events-none z-20"
                  >
                    <div
                      className="bg-surface border border-wire rounded-lg px-3 py-1.5 text-[11px]
                      text-ink whitespace-nowrap shadow-xl"
                    >
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

      {/* ─── PROSESSI ────────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                Prosessi
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Näin projekti etenee
              </h2>
              <p className="text-ink-dim mt-3 max-w-lg mx-auto">
                Läpinäkyvä prosessi alusta loppuun — tiedät aina missä mennään.
              </p>
            </div>
          </RevealSection>
          <ProcessTimeline steps={STEPS} />
        </div>
      </section>

      {/* ─── MAKSUTON KARTOITUS ──────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                  Maksuton kartoitus
                </span>
                <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-4">
                  Mitä tapahtuu maksuttomassa kartoituksessa?
                </h2>
                <p className="text-ink-dim leading-relaxed mb-6">
                  Ennen kuin teet mitään päätöksiä, haluamme ymmärtää yrityksesi
                  prosessit. Kartoitus on täysin maksuton, eikä sido sinua
                  mihinkään.
                </p>
                <Button asChild size="md" className="group">
                  <Link href="/yhteystiedot">
                    Varaa maksuton kartoitus
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              </div>
              <ul className="space-y-3">
                {KARTOITUS_ITEMS.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 p-3.5 rounded-lg bg-elevated border border-wire text-sm text-ink-dim"
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
          </RevealSection>
        </div>
      </section>

      {/* ─── MIKSI APEX SITE? ────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                Miksi me
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Miksi yritykset valitsevat Apex Siten?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_US.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/40 hover:shadow-glow hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-copper" />
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

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <RevealSection>
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">
                UKK
              </span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
                Usein kysyttyä
              </h2>
            </div>
          </RevealSection>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ─── PRE-CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <RevealSection className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">
            Valmis ottamaan AI:n hyödyksi?
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed">
            AI ei ole tulevaisuutta — se on tätä päivää. Kilpailijasi ottavat
            sen käyttöön nyt. Aloita maksuttomalla kartoituksella ja selvitä,
            mitä AI voisi tehdä juuri sinun yrityksellesi.
          </p>
        </RevealSection>
      </section>

      {/* ─── BOTTOM CTA ──────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-copper/12 blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-teal-brand/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge variant="accent" className="mb-5">
            Aloitetaan
          </Badge>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-5xl lg:text-6xl mb-4 max-w-2xl mx-auto">
            Anna tekoälyn tehdä rutiinityöt puolestasi.
          </h2>
          <p className="text-ink-dim text-lg mb-8 max-w-xl mx-auto">
            Varaa maksuton 30 minuutin kartoitus. Selvitämme yhdessä, miten AI
            voi auttaa yritystäsi säästämään aikaa, vähentämään manuaalista
            työtä ja kasvattamaan liiketoimintaasi.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="group">
              <Link href="/yhteystiedot">
                Varaa maksuton kartoitus
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <RequestQuoteLink href="/yhteystiedot?palvelu=ai-ratkaisut">
                <Phone size={16} />
                Pyydä tarjous
              </RequestQuoteLink>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-6">
            {["Maksuton kartoitus", "Tarjous 48 h", "Ei sitoutumista"].map(
              (t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 text-sm text-ink-ghost"
                >
                  <span className="text-copper">✓</span>
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}

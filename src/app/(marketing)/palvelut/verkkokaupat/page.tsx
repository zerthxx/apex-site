import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingCart,
  Clock,
  CreditCard,
  Package,
  TrendingUp,
  BarChart2,
  Globe,
  Shield,
  Headphones,
  Zap,
  ArrowRight,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevealSection } from "@/components/shared/RevealSection";
import { ProcessTimeline } from "@/components/shared/ProcessTimeline";
import { EcommerceDashboardMockup } from "./EcommerceDashboardMockup";

export const metadata: Metadata = {
  title: "Verkkokauppa yritykselle — Shopify, WooCommerce ja räätälöity",
  description:
    "Rakennamme toimivan ja myyvän verkkokaupan. Shopify, WooCommerce tai täysin räätälöity ratkaisu. Alkaen 5 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/verkkokaupat" },
};

const WHY_CARDS = [
  {
    icon: Clock,
    title: "Myynti käy yötä päivää",
    text: "Verkkokauppa ottaa tilauksia vastaan 24/7 — myös silloin kun olet lomalla tai nukut.",
  },
  {
    icon: Globe,
    title: "Asiakkaat koko Suomesta",
    text: "Maantieteelliset rajat katoavat. Tavoitat asiakkaat kaikkialta Suomesta ja maailmalta.",
  },
  {
    icon: CreditCard,
    title: "Luotettava maksaminen",
    text: "Stripe, Klarna ja Paytrail tekevät maksamisesta turvallista ja helppoa ostajalle.",
  },
  {
    icon: Package,
    title: "Hallitse varastoa helposti",
    text: "Reaaliaikainen varastonhallinta, automaattiset ilmoitukset ja tilaushistoria yhdessä paikassa.",
  },
  {
    icon: TrendingUp,
    title: "Skaalautuva kasvu",
    text: "Kauppa kasvaa yrityksesi mukana — lisää tuotteita, markkinoita ja maksutapoja ilman uudelleenrakentamista.",
  },
  {
    icon: BarChart2,
    title: "Data ohjaa päätöksiä",
    text: "Google Analytics 4 ja konversioseuranta näyttävät mikä myy, mikä ei ja missä on parannettavaa.",
  },
];

const SERVICE_CARDS = [
  {
    icon: ShoppingCart,
    title: "Verkkokauppa",
    items: [
      "Shopify",
      "WooCommerce",
      "Räätälöity ratkaisu",
      "Tuoteluettelo ja varasto",
      "Mobiiliresponsiivinen design",
    ],
  },
  {
    icon: CreditCard,
    title: "Maksaminen",
    items: [
      "Stripe (kansainvälinen)",
      "Klarna (lasku/erät)",
      "Paytrail (pankit)",
      "MobilePay",
      "Apple Pay & Google Pay",
    ],
  },
  {
    icon: TrendingUp,
    title: "Kasvu",
    items: [
      "SEO ja tuotesivut",
      "Google Analytics 4",
      "Konversioseuranta",
      "Nopeusoptimointi",
      "Asiakastilit ja ostohistoria",
    ],
  },
];

const USE_CASES = [
  { emoji: "👗", title: "Vaatteet ja muoti", text: "Kokovalitsin, värit, kuvagalleria" },
  { emoji: "🍕", title: "Ruoka ja juoma", text: "Tilaukset, toimitus, keittiöintegraatio" },
  { emoji: "💻", title: "Elektroniikka", text: "Tuotekonfiguraattorit, vertailu" },
  { emoji: "🎨", title: "Käsityöt ja taide", text: "Rajatut erät, pre-order, lahjakortit" },
  { emoji: "📦", title: "Tilauslaatikot", text: "Toistuva tilaus, hallintapaneeli" },
  { emoji: "🌿", title: "Luomutuotteet", text: "Sertifikaatit, alkuperämerkinnät" },
  { emoji: "🏋️", title: "Urheilu ja fitness", text: "Varaukset, jäsenyydet, kurssit" },
  { emoji: "🎓", title: "Digitaaliset tuotteet", text: "E-kirjat, kurssit, lisenssit" },
];

const TECHS = [
  { name: "Shopify", slug: "shopify", desc: "Helpoin kauppa-alusta" },
  { name: "WooCommerce", slug: "woocommerce", desc: "WordPress-pohjainen kauppa" },
  { name: "Stripe", slug: "stripe", desc: "Kansainvälinen maksuratkaisu" },
  { name: "Klarna", slug: "klarna", desc: "Lasku ja erämaksu" },
  { name: "Paytrail", slug: "paytrail", desc: "Suomalaiset pankit" },
  { name: "React", slug: "react", desc: "UI-komponenttikirjasto" },
  { name: "Next.js", slug: "nextdotjs", desc: "Full-stack framework" },
  { name: "Node.js", slug: "nodedotjs", desc: "Palvelinpuolen logiikka" },
  { name: "PostgreSQL", slug: "postgresql", desc: "Luotettava tietokanta" },
  { name: "Docker", slug: "docker", desc: "Konttipohjainen deploy" },
  { name: "Cloudflare", slug: "cloudflare", desc: "CDN ja tietoturva" },
  { name: "Google Analytics", slug: "googleanalytics", desc: "Konversioseuranta" },
];

const STEPS = [
  { title: "Yhteydenotto", text: "Täytä lomake tai soita — kerro lyhyesti mitä myyt ja kenelle." },
  {
    title: "Maksuton kartoitus",
    text: "30 minuutin puhelu, jossa selvitetään tuotteet, kohderyhmä ja tavoitteet.",
  },
  {
    title: "Alusta ja teknologia",
    text: "Valitsemme parhaan alustan — Shopify, WooCommerce tai räätälöity.",
  },
  {
    title: "Design ja visuaalisuus",
    text: "Suunnittelemme ilmeen joka heijastaa brändiäsi ja ohjaa ostopäätökseen.",
  },
  {
    title: "Tuotteet ja maksaminen",
    text: "Lisäämme tuotteet, konfiguroimme maksutavat ja toimitusasetukset.",
  },
  {
    title: "Integraatiot",
    text: "Kytkemme analytiikan, sähköpostimarkkinoinnin ja muut järjestelmät.",
  },
  {
    title: "Testaus",
    text: "Testaamme koko kassavirran oikeilla maksutavoilla ja eri laitteilla.",
  },
  {
    title: "Julkaisu",
    text: "Siirretään tuotantoon, varmistetaan SSL, nopeus ja hakukoneet.",
  },
  {
    title: "Tuki ja kehitys",
    text: "Seuraamme konversiota ja kehitämme myyntiä datan perusteella.",
  },
];

const KARTOITUS_ITEMS = [
  "Käymme läpi tuotteesi ja kohderyhmäsi",
  "Selvitämme parhaan alustan tarpeidesi mukaan",
  "Kartoitamme maksutavat ja toimitusasetukset",
  "Arvioimme aikataulun ja kustannukset",
  "Saat alustavan tarjouksen",
  "Ei sitoutumista — täysin maksuton",
];

const WHY_US = [
  {
    icon: ShoppingCart,
    title: "Kauppa valmiina myyntiin",
    text: "Ei prototyyppiä tai puolivalmista — toimitus sisältää kaiken mitä tarvitset myydäksesi heti julkaisusta alkaen.",
  },
  {
    icon: CreditCard,
    title: "Kaikki tärkeimmät maksutavat",
    text: "Stripe, Klarna, Paytrail, MobilePay, Apple Pay ja Google Pay — asiakas maksaa millä haluaa.",
  },
  {
    icon: Zap,
    title: "Nopea ja optimoitu",
    text: "Kauppa ladataan alle 2 sekunnissa. Nopeus parantaa konversiota ja hakukonenäkyvyyttä suoraan.",
  },
  {
    icon: Shield,
    title: "Tietoturva kunnossa",
    text: "SSL, PCI DSS -yhteensopivat maksuratkaisut, GDPR-vaatimusten mukainen toteutus.",
  },
  {
    icon: BarChart2,
    title: "Data ja analytiikka",
    text: "Google Analytics 4, konversioseuranta ja myyntiraportit auttavat tekemään datapohjaisia päätöksiä.",
  },
  {
    icon: Headphones,
    title: "Pitkäaikainen kumppanuus",
    text: "Emme katoa julkaisun jälkeen — ylläpito, kehitys ja tuki ovat saatavilla kun niitä tarvitset.",
  },
];

const FAQ = [
  {
    id: "1",
    question: "Shopify vai WooCommerce — kumpi sopii minulle?",
    answer:
      "Shopify on helpompi ylläpitää ja sopii useimmille — kaikki sisältyy kuukausimaksuun. WooCommerce on joustavampi ja halvempi, mutta vaatii enemmän ylläpitoa. Räätälöity ratkaisu on paras, kun tarvitset erityistoimintoja. Suosittelemme sopivimman kartoituksessa.",
  },
  {
    id: "2",
    question: "Mitä maksutapoja voitte integroida?",
    answer:
      "Stripe (kansainväliset kortit), Klarna (lasku ja erämaksu), Paytrail (suomalaiset pankit), MobilePay, Apple Pay ja Google Pay. Kaikki tärkeimmät maksutavat toimivat mobiilissa ja tietokoneella.",
  },
  {
    id: "3",
    question: "Voitteko siirtää tuotteet vanhasta kaupasta?",
    answer:
      "Kyllä. Voimme migratoida tuotteet, asiakastilit, tilaushistorian ja arvostelut nykyisestä järjestelmästä.",
  },
  {
    id: "4",
    question: "Kuinka kauan verkkokaupan rakentaminen kestää?",
    answer:
      "Yksinkertainen kauppa valmistuu 4–6 viikossa. Laajempi tai räätälöity ratkaisu integraatioineen 8–14 viikossa. Aikataulun näet tarjouksessa.",
  },
  {
    id: "5",
    question: "Tarjoatteko ylläpitoa julkaisun jälkeen?",
    answer:
      "Kyllä. Ylläpitosopimus kattaa päivitykset, tietoturvakorjaukset, varmuuskopioinnin ja tukipalvelun. Tarjoamme myös jatkokehitystä — uusia ominaisuuksia, A/B-testejä ja konversion parantamista.",
  },
  {
    id: "6",
    question: "Voinko hallita kauppaa itse?",
    answer:
      "Kyllä. Käytät selainpohjaista hallintapaneelia tuotteiden lisäämiseen, tilausten käsittelyyn ja raporttien seuraamiseen. Koulutamme sinut käyttöön julkaisun yhteydessä.",
  },
  {
    id: "7",
    question: "Paljonko verkkokauppa maksaa?",
    answer:
      "Verkkokaupparatkaisu alkaen 5 000 €. Hinta riippuu tuotemäärästä, integraatioista ja räätälöinnistä. Saat tarkan tarjouksen kartoituspuhelun jälkeen.",
  },
  {
    id: "8",
    question: "Toimiiko kauppa mobiilissa?",
    answer:
      "Kyllä — jokainen rakennettu kauppa on täysin mobiiliresponsiivinen. Teemme kassavirran testauksen oikeilla mobiililaitteilla ennen julkaisua.",
  },
];

const TRUST_ITEMS = ["Maksuton kartoitus", "Tarjous 48 h", "Shopify & WooCommerce", "Alkaen 5 000 €"];

export default function VerkkokauppatPage() {
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
                Verkkokaupat
              </Badge>
              <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Verkkokauppa, joka myy puolestasi{" "}
                <span className="text-copper">ympäri vuorokauden.</span>
              </h1>
              <p className="text-ink-dim text-lg leading-relaxed mb-8">
                Rakennamme yrityksellesi verkkokaupan, joka ottaa tilauksia vastaan 24/7 — myös
                silloin kun olet lomalla. Shopify, WooCommerce tai täysin räätälöity ratkaisu.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Button asChild size="lg" className="group">
                  <Link href="/yhteystiedot">
                    Pyydä maksuton tarjous
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/portfolio">Katso referenssit</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {TRUST_ITEMS.map((t) => (
                  <span key={t} className="text-sm text-ink-dim flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-copper shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-copper/6 blur-2xl" />
              <EcommerceDashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── MIKSI VERKKOKAUPPA ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Miksi verkkokauppa?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Verkkokauppa on yrityksesi tehokkain myyjä.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_CARDS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-copper" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink mb-2">{title}</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── MITÄ SAAT MEILTÄ ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Mitä saat meiltä
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Kaikki mitä tarvitset myyvään verkkokauppaan.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICE_CARDS.map(({ icon: Icon, title, items }) => (
                <div
                  key={title}
                  className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/30 hover:shadow-glow transition-all duration-200 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-copper" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink text-lg mb-4">{title}</h3>
                  <ul className="space-y-2 mt-auto">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-ink-dim">
                        <CheckCircle2 size={14} className="text-copper shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── KÄYTTÖKOHTEET ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Käyttökohteet
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Verkkokauppa sopii lähes kaikille toimialoille.
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
                  <h3 className="font-heading font-semibold text-ink text-sm mb-1">{title}</h3>
                  <p className="text-ink-ghost text-xs leading-relaxed">{text}</p>
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
              Parhaat alustat ja maksuratkaisut.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
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
                  <span className="text-[11px] text-ink-ghost text-center leading-tight">{name}</span>
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
              Verkkokauppa valmiiksi askel askeleelta.
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
                  Kerro mitä myyt ja kenelle — me hoidamme loput. Kartoituspuhelu on maksuton ja
                  ilman sitoutumista. Saat konkreettisen suosituksen ja alustavan kustannusarvion.
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
                    <li key={item} className="flex items-start gap-3 text-sm text-ink-dim">
                      <CheckCircle2 size={16} className="text-copper shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
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
              Kumppani, joka rakentaa kaupan — ja pitää huolen sen menestyksestä.
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
                  <h3 className="font-heading font-semibold text-ink mb-2">{title}</h3>
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
            Rakennetaan verkkokauppa, joka{" "}
            <span className="text-copper">kasvattaa myyntiäsi.</span>
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Varaa maksuton 30 minuutin kartoitus. Selvitämme yhdessä sopivimman alustan, maksutavat
            ja kaupan rakenteen — ilman sitoutumista.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <Button asChild size="lg" className="group">
              <Link href="/yhteystiedot">
                Pyydä maksuton tarjous
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="tel:+358401234567" className="flex items-center gap-2">
                <Phone size={16} /> Soita meille
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {["Maksuton kartoitus", "Tarjous 48 h", "Ei sitoutumista"].map((t) => (
              <span key={t} className="text-sm text-ink-dim flex items-center gap-1.5">
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

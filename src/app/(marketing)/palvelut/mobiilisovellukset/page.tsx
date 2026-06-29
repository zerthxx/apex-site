import type { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  Bell,
  WifiOff,
  Zap,
  TrendingUp,
  Shield,
  Headphones,
  BarChart2,
  ArrowRight,
  Phone,
  CheckCircle2,
  Layers,
  Globe,
} from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RevealSection } from "@/components/shared/RevealSection";
import { ProcessTimeline } from "@/components/shared/ProcessTimeline";
import { MobileAppMockup } from "./MobileAppMockup";

export const metadata: Metadata = {
  title: "Mobiilisovellukset — iOS ja Android yritykselle",
  description:
    "Native iOS- ja Android-sovellukset sekä cross-platform React Native -ratkaisut. Julkaisemme App Storeen ja Google Playhin. Alkaen 15 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/mobiilisovellukset" },
};

const WHY_CARDS = [
  {
    icon: Smartphone,
    title: "Asiakkaat käyttävät puhelinta 5+ h päivässä",
    text: "Mobiilisovellus on siellä missä asiakkaasi jo ovat — suoraan heidän taskussaan.",
  },
  {
    icon: Bell,
    title: "Push-ilmoitukset tuovat asiakkaat takaisin",
    text: "Sähköpostimarkkinointiin verrattuna push-ilmoitusten avausprosentti on jopa 4× parempi.",
  },
  {
    icon: Zap,
    title: "Parempi asiakaskokemus kuin selainversio",
    text: "Native-sovellus on nopeampi, sujuvampi ja reagoi välittömästi — ilman latausaikoja.",
  },
  {
    icon: WifiOff,
    title: "Toimii myös ilman yhteyttä",
    text: "Offline-tuki mahdollistaa sovelluksen käytön junassa, kellarissa tai huonon yhteyden alueilla.",
  },
  {
    icon: Shield,
    title: "Parantunut turvallisuus",
    text: "Face ID, Touch ID ja biometrinen tunnistautuminen suojaavat asiakkaasi tilin.",
  },
  {
    icon: TrendingUp,
    title: "Kasvaa yrityksesi mukana",
    text: "Lisää ominaisuuksia ja käyttäjiä ilman täydellistä uudelleenrakentamista.",
  },
];

const SERVICE_CARDS = [
  {
    icon: Smartphone,
    title: "Sovellus",
    items: [
      "Native iOS (Swift)",
      "Native Android (Kotlin)",
      "React Native",
      "Moderni UI/UX",
      "Responsiivinen käyttöliittymä",
    ],
  },
  {
    icon: Layers,
    title: "Toiminnot",
    items: [
      "Push-ilmoitukset",
      "Kirjautuminen (Face ID)",
      "Offline-tuki",
      "Maksaminen",
      "Kamera & GPS",
    ],
  },
  {
    icon: Globe,
    title: "Integraatiot",
    items: [
      "REST API & GraphQL",
      "CRM & ERP",
      "Stripe-maksaminen",
      "Firebase / Supabase",
      "Analytics",
    ],
  },
];

const USE_CASES = [
  { emoji: "🛒", title: "Verkkokauppa", text: "Mobiiliostos sujuvammin" },
  { emoji: "🍔", title: "Ravintolat", text: "Tilaukset ja kanta-asiakas" },
  { emoji: "🚚", title: "Kuljetukset", text: "Seuranta ja reittioptimoint" },
  { emoji: "🏥", title: "Terveyspalvelut", text: "Ajanvaraus ja potilastiedot" },
  { emoji: "🏋️", title: "Jäsenyydet", text: "Tunnit, kortit, kirjautuminen" },
  { emoji: "📅", title: "Ajanvaraus", text: "Kalenteri ja muistutukset" },
  { emoji: "💬", title: "Asiakasportaali", text: "Viestintä ja tukipyynnöt" },
  { emoji: "🎓", title: "Verkkokurssit", text: "Opiskelu, edistyminen, sertifikaatit" },
];

const FEATURES = [
  { emoji: "🔔", title: "Push-ilmoitukset", text: "Tavoita asiakkaat juuri oikealla hetkellä" },
  { emoji: "📍", title: "GPS", text: "Sijainti, kartat ja reittioptimoint" },
  { emoji: "📷", title: "Kamera", text: "Kuvaus, skannaus ja AR" },
  { emoji: "💳", title: "Maksaminen", text: "Stripe, Apple Pay, Google Pay" },
  { emoji: "🌐", title: "Offline", text: "Toimii myös ilman verkkoyhteyttä" },
  { emoji: "🔐", title: "Kirjautuminen", text: "Face ID, Touch ID, Google Sign-in" },
  { emoji: "📊", title: "Dashboard", text: "Reaaliaikaiset tilastot ja raportit" },
  { emoji: "❤️", title: "Suosikit", text: "Henkilökohtainen käyttökokemus" },
];

const TECHS = [
  { name: "React Native", slug: "reactnative", desc: "Cross-platform iOS & Android" },
  { name: "Swift", slug: "swift", desc: "Native iOS kehitys" },
  { name: "Kotlin", slug: "kotlin", desc: "Native Android kehitys" },
  { name: "Flutter", slug: "flutter", desc: "Googlen cross-platform UI" },
  { name: "React", slug: "react", desc: "UI-komponenttikirjasto" },
  { name: "Next.js", slug: "nextdotjs", desc: "Full-stack backend" },
  { name: "Node.js", slug: "nodedotjs", desc: "Palvelinpuolen logiikka" },
  { name: "PostgreSQL", slug: "postgresql", desc: "Luotettava tietokanta" },
  { name: "Firebase", slug: "firebase", desc: "Reaaliaikadata ja auth" },
  { name: "Supabase", slug: "supabase", desc: "Open-source backend" },
  { name: "Docker", slug: "docker", desc: "Konttipohjainen deploy" },
  { name: "Cloudflare", slug: "cloudflare", desc: "CDN ja tietoturva" },
];

const STEPS = [
  {
    title: "Ota yhteyttä",
    text: "Kerro sovelluksesi idea — lomakkeella, sähköpostilla tai puhelimella.",
  },
  {
    title: "Maksuton kartoitus",
    text: "30 minuutin puhelu: ideat, kohderyhmä, ominaisuudet ja aikataulu.",
  },
  {
    title: "UX/UI-suunnittelu",
    text: "Suunnittelemme wireframen ja visuaalisen designin Figmassa.",
  },
  {
    title: "Prototyyppi",
    text: "Rakennamme klikkailavan prototyypin ja validoimme sen kanssasi.",
  },
  {
    title: "Kehitys",
    text: "Kehitys sprinteissä — näytämme edistymisen viikoittain.",
  },
  {
    title: "Testaus",
    text: "Testaamme oikeilla laitteilla, beta-käyttäjillä ja automaattisilla testeillä.",
  },
  {
    title: "Julkaisu",
    text: "Viimeistely, suorituskyvyn optimointi ja store-materiaalit.",
  },
  {
    title: "App Store & Google Play",
    text: "Julkaisemme puolestasi — hoitamme review-prosessin ja metadatan.",
  },
  {
    title: "Tuki ja jatkokehitys",
    text: "Seuraamme analytiikkaa ja kehitämme sovellusta datan perusteella.",
  },
];

const KARTOITUS_ITEMS = [
  "Käymme läpi sovelluksesi idean",
  "Kartoitamme kohderyhmäsi",
  "Määrittelemme tärkeimmät ominaisuudet",
  "Valitsemme teknologian (Native tai React Native)",
  "Arvioimme aikataulun",
  "Saat alustavan kustannusarvion",
  "Suunnittelemme julkaisuprosessin",
  "Ei sitoutumista — täysin maksuton",
];

const WHY_US = [
  {
    icon: Smartphone,
    title: "Moderni design",
    text: "Apple Human Interface Guidelinen ja Material Designin mukainen ulkoasu — tuttu, mutta ainutlaatuinen.",
  },
  {
    icon: Zap,
    title: "Nopea suorituskyky",
    text: "60 fps animaatiot, sub-second lataukset. Natiivisovellus ilman kompromisseja.",
  },
  {
    icon: Layers,
    title: "Native-laatu",
    text: "Ei hybridiratkaisun tunnetta. Käyttökokemus on juuri sellainen kuin asiakkaasi odottavat.",
  },
  {
    icon: Shield,
    title: "Turvallinen kehitys",
    text: "Turvallinen autentikaatio, salattu tiedonsiirto ja GDPR-vaatimusten mukainen toteutus.",
  },
  {
    icon: Headphones,
    title: "Jatkuva tuki",
    text: "Emme katoa julkaisun jälkeen — päivitykset, analytiikka ja tuki ovat aina saatavilla.",
  },
  {
    icon: TrendingUp,
    title: "Skaalautuva ratkaisu",
    text: "Lisää käyttäjiä ja ominaisuuksia ilman arkkitehtuurin uudelleenrakentamista.",
  },
];

const FAQ = [
  {
    id: "1",
    question: "Native vai React Native — kumpi sopii minulle?",
    answer:
      "React Native on kustannustehokkain valinta: yksi codebase toimii sekä iOS:ssä että Androidissa. Native Swift tai Kotlin kannattaa valita, jos sovellus vaatii erityistä suorituskykyä, laitteistolähestymistä tai AR/VR-ominaisuuksia. Suosittelemme sopivimman kartoituksessa.",
  },
  {
    id: "2",
    question: "Voiko sovellus toimia ilman internetiä?",
    answer:
      "Kyllä. Rakennamme offline-tuen, joka tallentaa datan laitteelle ja synkronoi sen automaattisesti, kun yhteys palautuu.",
  },
  {
    id: "3",
    question: "Voiko sovellus lähettää push-ilmoituksia?",
    answer:
      "Kyllä. Push-ilmoitukset ovat yksi mobiilisovelluksen tehokkaimmista ominaisuuksista. Integroimme Firebase Cloud Messaging (Android) ja APNs (iOS).",
  },
  {
    id: "4",
    question: "Voinko hallita sisältöä itse?",
    answer:
      "Kyllä. Rakennamme hallintapaneelin, jolla voit muokata sisältöä, lähettää ilmoituksia ja seurata käyttäjätilastoja selaimesta.",
  },
  {
    id: "5",
    question: "Kuinka kauan kehitys kestää?",
    answer:
      "MVP-sovellus valmistuu 3–4 kuukaudessa. Laajempi sovellus integraatioineen 5–8 kuukaudessa. Aikataulun näet tarjouksessa.",
  },
  {
    id: "6",
    question: "Voitteko julkaista sovelluksen App Storessa?",
    answer:
      "Kyllä. Hoidamme koko julkaisuprosessin — App Storen review-vaatimukset, metadatan, kuvakaappaukset ja Google Playn julkaisun.",
  },
  {
    id: "7",
    question: "Tarjoatteko ylläpitoa julkaisun jälkeen?",
    answer:
      "Kyllä. Ylläpitosopimus kattaa OS-päivitykset, bugikorjaukset, analytiikan seurannan ja tukipalvelun.",
  },
  {
    id: "8",
    question: "Paljonko mobiilisovellus maksaa?",
    answer:
      "MVP-sovellus alkaen 15 000 €. Hinta riippuu ominaisuuksista, integraatioista ja kehitysajasta. Saat tarkan tarjouksen kartoituspuhelun jälkeen.",
  },
];

const TRUST_ITEMS = [
  "iOS ja Android",
  "Native & React Native",
  "App Store & Google Play",
  "Alkaen 15 000 €",
];

export default function MobiilisovelluksetPage() {
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
                Mobiilisovellukset
              </Badge>
              <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Mobiilisovellus, jonka asiakkaasi haluavat{" "}
                <span className="text-copper">avata uudelleen.</span>
              </h1>
              <p className="text-ink-dim text-lg leading-relaxed mb-8">
                Suunnittelemme ja rakennamme moderneja iOS- ja Android-sovelluksia, jotka tarjoavat
                erinomaisen käyttökokemuksen, toimivat nopeasti ja kasvavat yrityksesi mukana.
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
                  <Link href="/yhteystiedot">Pyydä tarjous</Link>
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
              <MobileAppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── MIKSI MOBIILISOVELLUS ── */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Miksi mobiilisovellus?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Sovellus on yrityksesi suorin kanava asiakkaaseen.
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
              Kaikki suunnittelusta julkaisuun.
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
              Mobiilisovellus sopii lähes kaikille toimialoille.
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

      {/* ── OMINAISUUDET ── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Ominaisuudet
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Kaikki mitä moderni mobiilisovellus tarvitsee.
            </h2>
          </RevealSection>
          <RevealSection>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {FEATURES.map(({ emoji, title, text }) => (
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
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Teknologiat
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Parhaat teknologiat iOS:lle ja Androidille.
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Prosessi
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Sovellus valmiiksi askel askeleelta.
            </h2>
          </RevealSection>
          <ProcessTimeline steps={STEPS} />
        </div>
      </section>

      {/* ── MAKSUTON KARTOITUS ── */}
      <section className="py-20 bg-surface/30">
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
                  Kerro sovelluksesi idea — me hoidamme loput. Kartoituspuhelu on maksuton ja
                  ilman sitoutumista. Saat selkeän suosituksen teknologiasta, aikataulusta ja
                  kustannuksista.
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-copper mb-3">
              Miksi Apex Site?
            </p>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl max-w-xl">
              Kumppani, joka rakentaa sovelluksen — ja pitää sen ajan tasalla.
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
      <section className="py-20 bg-surface/30">
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
            Rakennetaan mobiilisovellus, jota asiakkaasi{" "}
            <span className="text-copper">käyttävät joka päivä.</span>
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Varaa maksuton 30 minuutin kartoitus. Suunnittelemme yhdessä sovelluksen, joka tarjoaa
            erinomaisen käyttökokemuksen ja tukee yrityksesi kasvua.
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
              <Link href="tel:+358401234567" className="flex items-center gap-2">
                <Phone size={16} /> Soita meille
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {["Maksuton kartoitus", "Ei sitoutumista", "App Store & Google Play"].map((t) => (
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

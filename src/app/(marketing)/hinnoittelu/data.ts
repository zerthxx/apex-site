import type { PricingCardVariant } from "@/components/shared/PricingCard";

export const SERVICES_PRICING: {
  name: string;
  slug: string;
  price: string;
  description: string;
  features: string[];
  href: string;
  variant: PricingCardVariant;
}[] = [
  {
    name: "Verkkosivut",
    slug: "verkkosivut",
    price: "alkaen 3 000 €",
    description:
      "Moderni, nopea ja hakukoneoptimoitu yrityspresenssi verkossa.",
    features: [
      "Responsiivinen design",
      "On-page SEO",
      "Google Analytics",
      "CMS sisällönhallinta",
      "Yhteydenottolomake",
      "6 kk takuu",
    ],
    href: "/palvelut/verkkosivut",
    variant: "neutral",
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
    variant: "teal",
  },
  {
    name: "Verkkokauppa",
    slug: "verkkokaupat",
    price: "alkaen 6 000 €",
    description:
      "Myyvä verkkokauppa Shopify, WooCommerce tai täysin räätälöitynä.",
    features: [
      "Stripe + Klarna + Paytrail",
      "Varastonhallinta",
      "Mobiilioptimoidut kassavirrat",
      "Konversioseuranta",
      "SEO-optimointi",
      "Asiakastilit",
    ],
    href: "/palvelut/verkkokaupat",
    variant: "copper",
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
    variant: "neutral",
  },
];

export const STARTER_PACKAGES: {
  name: string;
  slug: string;
  setup: string;
  monthly: string;
  description: string;
  features: string[];
  variant: PricingCardVariant;
  badge?: string;
}[] = [
  {
    name: "Startti",
    slug: "startti",
    setup: "299 €",
    monthly: "49 €/kk",
    description:
      "Täydellinen pienelle yritykselle. Ravintola, parturi, kampaamo, paikallinen kauppa.",
    features: [
      "Jopa 5 sivua",
      "Mobiilioptimoidut",
      "Yhteydenottolomake",
      "Google Maps -integraatio",
      "Ylläpito sisältyy",
      "Ei sitoutumisaikaa",
    ],
    variant: "neutral",
  },
  {
    name: "Kasvu",
    slug: "kasvu",
    setup: "599 €",
    monthly: "79 €/kk",
    description:
      "Enemmän sivuja, SEO-optimointi ja Google Analytics. Kasvavalle yritykselle.",
    features: [
      "Jopa 10 sivua",
      "SEO-optimointi",
      "Google Analytics",
      "CMS sisällönhallinta",
      "Blogimahdollisuus",
      "Kuukausiraportti",
    ],
    variant: "copper",
    badge: "Suosituin",
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
    variant: "teal",
  },
];

export const ADD_ONS = [
  {
    name: "Livechat-asennus",
    price: "150 €",
    desc: "Tidio tai Tawk.to -chat asiakkaille. Asiakas hallinnoi itse.",
  },
  {
    name: "Google Analytics",
    price: "100 €",
    desc: "Kävijäseuranta ja raportointi Google Analyticsiin.",
  },
  {
    name: "Evästebanneri (GDPR)",
    price: "150 €",
    desc: "GDPR-yhteensopiva evästehallinta ja suostumusbanneri.",
  },
  {
    name: "Yhteydenottolomake",
    price: "100 €",
    desc: "Lomake joka lähettää viestit suoraan sähköpostiin.",
  },
  {
    name: "Google Maps -integraatio",
    price: "100 €",
    desc: "Kartta, osoite ja aukioloajat sivulle.",
  },
  {
    name: "Nopeutusoptimointi",
    price: "200 €",
    desc: "Sivuston latausajan optimointi paremmalle sijoitukselle.",
  },
  {
    name: "Logo-suunnittelu",
    price: "250 €",
    desc: "Ammattimainen logo yrityksellesi.",
  },
  {
    name: "Some-linkit & ikonit",
    price: "75 €",
    desc: "Instagram, Facebook, TikTok ja muut somelinkit sivulle.",
  },
  {
    name: "Sähköposti-asennus",
    price: "100 €",
    desc: "Yritysdomain-sähköposti esim. support@sinundomain.fi.",
  },
  {
    name: "Chatbot-asennus (AI)",
    price: "300 €",
    desc: "Tekoälychatbot joka vastaa asiakkaille automaattisesti 24/7.",
  },
  {
    name: "Varausjärjestelmä",
    price: "350 €",
    desc: "Online-ajanvaraus kalenterilla asiakkaillesi.",
  },
  {
    name: "Somejakotoiminnot",
    price: "100 €",
    desc: "Open Graph -kuvat ja some-jakopainikkeet.",
  },
];

export const MAINTENANCE_TIERS: {
  name: string;
  slug: string;
  price: string;
  variant: PricingCardVariant;
  badge?: string;
  features: string[];
}[] = [
  {
    name: "Perus",
    slug: "perus",
    price: "150 €/kk",
    variant: "neutral",
    features: [
      "Tietoturvapäivitykset",
      "Varmuuskopiointi",
      "Sähköpostituki",
      "1 h muutostyöt/kk",
    ],
  },
  {
    name: "Standardi",
    slug: "standardi",
    price: "350 €/kk",
    variant: "copper",
    badge: "Suosituin",
    features: [
      "Kaikki Perus-tason ominaisuudet",
      "Suorituskyvyn seuranta",
      "Puhelintuki",
      "4 h muutostyöt/kk",
      "Kuukausiraportti",
    ],
  },
  {
    name: "Premium",
    slug: "premium",
    price: "750 €/kk",
    variant: "teal",
    features: [
      "Kaikki Standardi-tason ominaisuudet",
      "Prioriteettituki (2h vasteaika)",
      "8 h muutostyöt/kk",
      "Kvartaalikatsaus",
      "CRO-suositukset",
    ],
  },
];

export const PRICING_REASONS = [
  { title: "Ei piilokuluja", text: "Saat aina selkeän tarjouksen." },
  {
    title: "Räätälöity tarjous",
    text: "Maksat vain tarvitsemistasi ominaisuuksista.",
  },
  {
    title: "Maksuton kartoitus",
    text: "30 minuutin kartoitus ilman sitoutumista.",
  },
  {
    title: "Skaalautuva ratkaisu",
    text: "Voit laajentaa projektia myöhemmin.",
  },
];

export const PRICING_STEPS = [
  { num: "1", label: "Kartoitus" },
  { num: "2", label: "Tarpeiden määrittely" },
  { num: "3", label: "Tarjous" },
  { num: "4", label: "Projektin toteutus" },
  { num: "5", label: "Julkaisu" },
];

export const INCLUDED = [
  "Maksuton kartoitus",
  "Moderni toteutus",
  "Responsiivinen design",
  "Testaus",
  "Julkaisu",
  "Käyttöönoton tuki",
];

export const TRUST_STATS = [
  { value: "47+", label: "Projektia" },
  { value: "98%", label: "Tyytyväisiä asiakkaita" },
  { value: "5★", label: "Google-arvosana" },
  { value: "3+", label: "Vuotta kokemusta" },
];

export const FAQ = [
  {
    q: "Onko hinnoittelu kiinteä vai tuntiperusteiset?",
    a: "Useimmille projekteille annamme kiinteän hinnan. Isommissa projekteissa voidaan sopia virstanpylväspohjaisesta laskutuksesta. Jatkokehityksessä käytämme tuntihintaa (95–145 €/h).",
  },
  {
    q: "Miksi hintanne eroaa halvemmista toimijoista?",
    a: "Käytämme hyviä materiaaleja, parempia prosesseja ja kokeneitampia ihmisiä. Tyypillinen halpa projekti maksaa enemmän vuoden päästä kun sille tarvitaan uusintakehitystä.",
  },
  {
    q: "Voiko projektin jakaa eriin?",
    a: "Kyllä. Projektit laskutetaan tyypillisesti kolmessa erässä: 30% aloituksessa, 40% kehityksen puolivälissä, 30% julkaisun yhteydessä.",
  },
  {
    q: "Voinko maksaa projektin osissa?",
    a: "Kyllä. Laskutamme tyypillisesti kolmessa erässä: 30% aloituksessa, 40% kehityksen puolivälissä ja 30% julkaisussa. Isommille projekteille voidaan sopia yksilöllinen maksutapa.",
  },
  {
    q: "Voinko vaihtaa pakettia myöhemmin?",
    a: "Kyllä. Voit päivittää tai muuttaa pakettia projektin edetessä. Käymme muutoksen läpi ja päivitämme tarjouksen.",
  },
  {
    q: "Sisältyykö domain ja hosting?",
    a: "Domain ei sisälly — se rekisteröidään yleensä asiakkaan omille tunnuksille. Hosting on valittavissa: me hoidamme sen (+50 €/kk) tai asiakas käyttää omaa hostingiaan.",
  },
  {
    q: "Voinko käyttää omaa hostingia?",
    a: "Kyllä. Voit valita oman hostingin ja maksaa vain kertaluonteisen aloitusmaksun. Tällöin hosting on sinun vastuullasi.",
  },
  {
    q: "Kuinka nopeasti projekti voidaan aloittaa?",
    a: "Yleensä aloitamme 1–2 viikon sisällä sopimuksen allekirjoituksesta. Kiireellisemmissä tapauksissa voivat löytyä aikaisemmat aloitusajankohdat — kysy.",
  },
  {
    q: "Mitä tapahtuu julkaisun jälkeen?",
    a: "Projektin päättyessä siirräme sivuston omistajuuden ja lähdekoodit sinulle. Voit valita ylläpitosopimuksen tai hoitaa itse. Tarjoamme myös jatkokehitystä tarpeen mukaan.",
  },
];

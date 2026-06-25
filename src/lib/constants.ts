import type {
  NavLink,
  Service,
  TechItem,
  Testimonial,
  FaqItem,
  ProcessStep,
  Differentiator,
  CaseStudyPreview,
} from "./types";

export const SITE_URL = "https://apexsite.fi";
export const COMPANY_NAME = "Apex Site";
export const COMPANY_EMAIL = "info@apexsite.fi";
export const COMPANY_PHONE = "+358 50 123 4567";
export const COMPANY_ADDRESS = "Helsinki, Finland";
export const COMPANY_BUSINESS_ID = "1234567-8";

export const SOCIAL_LINKS = {
  linkedin: "https://linkedin.com/company/apexsite-fi",
  github: "https://github.com/apexsite-fi",
  twitter: "https://twitter.com/apexsite_fi",
};

export const SERVICES: Service[] = [
  {
    id: "verkkosivut",
    title: "Verkkosivut",
    slug: "verkkosivut",
    description: "Modernit, nopeat ja konvertoivat verkkosivut yrityksellesi.",
    icon: "Globe",
    href: "/palvelut/verkkosivut",
    startingPrice: "2 500 €",
  },
  {
    id: "verkkokaupat",
    title: "Verkkokaupat",
    slug: "verkkokaupat",
    description: "Myy enemmän kauniilla ja toimivalla verkkokaupalla.",
    icon: "ShoppingCart",
    href: "/palvelut/verkkokaupat",
    startingPrice: "5 000 €",
  },
  {
    id: "mobiilisovellukset",
    title: "Mobiilisovellukset",
    slug: "mobiilisovellukset",
    description: "Native iOS ja Android -sovellukset yrityksesi tarpeisiin.",
    icon: "Smartphone",
    href: "/palvelut/mobiilisovellukset",
    startingPrice: "15 000 €",
  },
  {
    id: "ai-ratkaisut",
    title: "AI-ratkaisut",
    slug: "ai-ratkaisut",
    description: "Automatisoi prosesseja ja hyödynnä tekoälyä liiketoiminnassasi.",
    icon: "Cpu",
    href: "/palvelut/ai-ratkaisut",
    startingPrice: "4 000 €",
  },
  {
    id: "ohjelmistot",
    title: "Ohjelmistot",
    slug: "ohjelmistot",
    description: "Räätälöidyt SaaS-alustat ja toiminnanohjausjärjestelmät.",
    icon: "Code2",
    href: "/palvelut/ohjelmistot",
    startingPrice: "Tarjous projektikohtaisesti",
  },
  {
    id: "digitaaliset-tuotteet",
    title: "Digitaaliset tuotteet",
    slug: "digitaaliset-tuotteet",
    description: "Uniikit digitaaliset ratkaisut ideasta tuotantoon.",
    icon: "Layers",
    href: "/palvelut",
  },
];

export const NAV_LINKS: NavLink[] = [
  {
    label: "Palvelut",
    href: "/palvelut",
    dropdown: SERVICES.slice(0, 5).map((s) => ({
      label: s.title,
      href: s.href,
      description: s.description,
      icon: s.icon,
    })),
  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Prosessi", href: "/prosessi" },
  { label: "Hinnoittelu", href: "/hinnoittelu" },
  { label: "Meistä", href: "/meista" },
  { label: "Blogi", href: "/blogi" },
];

export const TECH_STACK: TechItem[] = [
  { name: "React", logo: "/images/tech-logos/react.svg", category: "Frontend" },
  { name: "Next.js", logo: "/images/tech-logos/nextjs.svg", category: "Frontend" },
  { name: "TypeScript", logo: "/images/tech-logos/typescript.svg", category: "Frontend" },
  { name: "Node.js", logo: "/images/tech-logos/nodejs.svg", category: "Backend" },
  { name: "Python", logo: "/images/tech-logos/python.svg", category: "Backend" },
  { name: "PostgreSQL", logo: "/images/tech-logos/postgresql.svg", category: "Backend" },
  { name: "MongoDB", logo: "/images/tech-logos/mongodb.svg", category: "Backend" },
  { name: "Swift", logo: "/images/tech-logos/swift.svg", category: "Mobile" },
  { name: "Kotlin", logo: "/images/tech-logos/kotlin.svg", category: "Mobile" },
  { name: "AWS", logo: "/images/tech-logos/aws.svg", category: "Cloud" },
  { name: "Vercel", logo: "/images/tech-logos/vercel.svg", category: "Cloud" },
  { name: "Supabase", logo: "/images/tech-logos/supabase.svg", category: "Cloud" },
  { name: "OpenAI", logo: "/images/tech-logos/openai.svg", category: "AI" },
  { name: "Stripe", logo: "/images/tech-logos/stripe.svg", category: "CMS" },
  { name: "Shopify", logo: "/images/tech-logos/shopify.svg", category: "CMS" },
  { name: "WordPress", logo: "/images/tech-logos/wordpress.svg", category: "CMS" },
  { name: "Sanity", logo: "/images/tech-logos/sanity.svg", category: "CMS" },
  { name: "Redis", logo: "/images/tech-logos/redis.svg", category: "Backend" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Mikko Leinonen",
    role: "Toimitusjohtaja",
    company: "Leinonen Group",
    avatar: "/images/team/avatar-1.jpg",
    rating: 5,
    quote:
      "Apex Site rakensi meille verkkokaupan, joka ylitti kaikki odotuksemme. Myynti kasvoi 47 % ensimmäisten kolmen kuukauden aikana. Tiimi oli ammattitaitoinen ja toimitusajasta pidettiin kiinni.",
  },
  {
    id: "2",
    name: "Sari Korhonen",
    role: "Markkinointipäällikkö",
    company: "NordicTech Oy",
    avatar: "/images/team/avatar-2.jpg",
    rating: 5,
    quote:
      "AI-chatbottimme on säästänyt asiakaspalvelullamme yli 20 tuntia viikossa. Apex Siten asiantuntemus tekoälyssä on ensiluokkainen, ja yhteistyö sujui alusta loppuun erinomaisesti.",
  },
  {
    id: "3",
    name: "Pekka Virtanen",
    role: "Yrittäjä",
    company: "Virtanen Consulting",
    avatar: "/images/team/avatar-3.jpg",
    rating: 5,
    quote:
      "Uudet verkkosivumme ovat täsmälleen mitä tarvitsimme. Selkeä prosessi, nopea toteutus ja lopputulos puhuu puolestaan. Suosittelemme lämpimästi kaikille yrityksille.",
  },
];

export const FAQ_HOME: FaqItem[] = [
  {
    id: "1",
    question: "Kuinka kauan projekti kestää?",
    answer:
      "Se riippuu laajuudesta: yksinkertainen verkkosivusto valmistuu 3–4 viikossa, verkkokauppa 6–10 viikossa ja mobiilisovellus 3–6 kuukaudessa. Käymme aikataulun läpi ilmaisessa kartoituspuhelussa.",
  },
  {
    id: "2",
    question: "Kuinka paljon se maksaa?",
    answer:
      "Verkkosivut alkavat 2 500 €:sta, verkkokaupat 5 000 €:sta ja mobiilisovellukset 15 000 €:sta. Tarjous on aina ilmainen ja projektikohtainen — hinta riippuu ominaisuuksista ja laajuudesta.",
  },
  {
    id: "3",
    question: "Saanko itse lähdekoodin?",
    answer:
      "Kyllä, ehdottomasti. Toimitus sisältää aina täyden lähdekoodin ja dokumentaation. Et ole sidoksissa meihin — voit jatkaa kehitystä kenen tahansa kanssa.",
  },
  {
    id: "4",
    question: "Teettekö myös ylläpitoa?",
    answer:
      "Kyllä. Tarjoamme kuukausittaisia ylläpitosopimuksia alkaen 150 €/kk. Sopimus sisältää päivitykset, tietoturvaseurannan, varmuuskopioinnin ja tukipalvelun.",
  },
  {
    id: "5",
    question: "Miten projekti aloitetaan?",
    answer:
      "Ota yhteyttä lomakkeella tai soita meille. Sovitaan maksuton 30 minuutin kartoituspuhelu, jonka jälkeen saat kirjallisen tarjouksen 48 tunnin kuluessa — ilman sitoumuksia.",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "Kartoitus",
    description: "Opimme liiketoimintasi, tavoitteet ja haasteet perusteellisesti.",
  },
  {
    number: "02",
    title: "Suunnittelu",
    description: "Luomme wireframet, designin ja teknisen arkkitehtuurin.",
  },
  {
    number: "03",
    title: "Toteutus",
    description: "Rakennamme ketterästi ja näytämme edistymisen joka viikko.",
  },
  {
    number: "04",
    title: "Julkaisu & tuki",
    description: "Julkaisemme, mittaamme tuloksia ja kehitämme jatkuvasti.",
  },
];

export const DIFFERENTIATORS: Differentiator[] = [
  {
    icon: "Timer",
    title: "Toimitamme ajallaan",
    proof: "94 % projekteista toimitettu ajatellun aikataulun puitteissa",
    description:
      "Selkeä projektinhallinta ja avoin kommunikaatio pitävät aikataulut kiinni. Saat viikoittaiset tilannepäivitykset.",
  },
  {
    icon: "Code2",
    title: "Koodi on sinun",
    proof: "100 % omistusoikeus — aina",
    description:
      "Et ole sidoksissa meihin. Saat kaiken lähdekoodin ja dokumentaation. Voit jatkaa kenen tahansa kanssa.",
  },
  {
    icon: "Building2",
    title: "Yksi kumppani, kaikki palvelut",
    proof: "Web + mobiili + AI + SaaS saman katon alta",
    description:
      "Ei koordinointia eri toimittajien välillä. Me hoidamme kaiken suunnittelusta tuotantoon.",
  },
  {
    icon: "HeartHandshake",
    title: "Jatkuva tuki",
    proof: "Keskimääräinen asiakassuhde kestää 2,8 vuotta",
    description:
      "Julkaisun jälkeen olemme vierellä: ylläpito, päivitykset ja jatkokehitys kun tarve vaatii.",
  },
];

export const MOCK_CASE_STUDIES: CaseStudyPreview[] = [
  {
    slug: "leinonen-verkkokauppa",
    client: "Leinonen Group",
    title: "Verkkokauppa kasvatti myyntiä 47 %",
    service: "Verkkokaupat",
    coverImage: "/images/portfolio/leinonen.jpg",
    outcome: "+47 % myynti ensimmäisenä kvartaalina",
  },
  {
    slug: "nordictech-ai-chatbot",
    client: "NordicTech Oy",
    title: "AI-chatbot säästää 20 h/viikko asiakaspalvelussa",
    service: "AI-ratkaisut",
    coverImage: "/images/portfolio/nordictech.jpg",
    outcome: "−20 h/viikko asiakaspalvelutyötä",
  },
  {
    slug: "virtanen-verkkosivut",
    client: "Virtanen Consulting",
    title: "Uudet sivut triplasiivat yhteydenotot",
    service: "Verkkosivut",
    coverImage: "/images/portfolio/virtanen.jpg",
    outcome: "+3× yhteydenotot kuukaudessa",
  },
];

export const FOOTER_NAV = {
  palvelut: SERVICES.slice(0, 5).map((s) => ({ label: s.title, href: s.href })),
  yritys: [
    { label: "Meistä", href: "/meista" },
    { label: "Prosessi", href: "/prosessi" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Blogi", href: "/blogi" },
    { label: "Urat", href: "/urat" },
    { label: "UKK", href: "/ukk" },
  ],
};

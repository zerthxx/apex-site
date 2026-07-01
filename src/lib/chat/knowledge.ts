export interface CompanyKnowledge {
  company: {
    name: string;
    location: string;
    email: string;
    phone: string;
    address: string;
    stats: string;
    values: string;
    responseTime: string;
  };
  services: {
    name: string;
    startingPrice: string;
    includes: string;
    timeline: string;
  }[];
  packages: {
    name: string;
    setupFee: string;
    monthly: string;
    includes: string;
  }[];
  maintenance: {
    name: string;
    price: string;
    includes: string;
  }[];
  addons: string;
  process: string[];
  faq: string[];
  hosting: string;
}

export async function getKnowledge(): Promise<CompanyKnowledge> {
  // Future: replace with vector DB / CMS call
  return {
    company: {
      name: "Apex Site",
      location: "Helsinki, Suomi (palvelee koko Suomea ja kansainvälisesti)",
      email: "info@apexsite.fi",
      phone: "+358 44 2455490",
      address: "Helsinki, Suomi",
      stats: "47+ projektia toimitettu, 98% tyytyväisiä asiakkaita, keskimääräinen asiakassuhde 2.8 vuotta",
      values: "Laatu ennen nopeutta, pitkäaikaiset kumppanuudet, rehellinen viestintä, moderni tekniikka",
      responseTime: "24h arkisin, ylläpitoasiakkaat 2–4h",
    },
    services: [
      {
        name: "Verkkosivut",
        startingPrice: "3 000 €",
        includes: "Responsiivinen design, On-page SEO, Google Analytics, CMS sisällönhallinta, yhteydenottolomake, SSL, 6 kk takuu, täysi lähdekoodi",
        timeline: "3–6 viikossa",
      },
      {
        name: "AI-ratkaisut",
        startingPrice: "4 000 €",
        includes: "Chatbotit, automaatiot, RAG-ratkaisut, OpenAI/Anthropic-integraatiot, työnkulun automaatio, dashboard, koulutus tiimille",
        timeline: "Yksinkertainen 2–4 viikossa, monimutkaisempi 6–12 viikossa",
      },
      {
        name: "Verkkokauppa",
        startingPrice: "6 000 €",
        includes: "Shopify, WooCommerce tai räätälöity, Stripe + Klarna + Paytrail, varastonhallinta, asiakastilit, konversioseuranta, SEO",
        timeline: "Shopify 6–8 viikossa, räätälöity 10–16 viikossa",
      },
      {
        name: "Mobiilisovellus",
        startingPrice: "15 000 €",
        includes: "Native iOS (Swift) tai Android (Kotlin), tai React Native, App Store + Google Play -julkaisu, push-ilmoitukset, offline-toiminnallisuus, 3 kk takuu",
        timeline: "MVP 3–4 kuukaudessa, monimutkaisempi 5–8 kuukaudessa",
      },
      {
        name: "Räätälöity ohjelmisto / SaaS",
        startingPrice: "Tarjous projektikohtaisesti (alkaen 5 000 €)",
        includes: "Räätälöidyt dashboardit, asiakasportaalit, varausjärjestelmät, CRM, sisäiset työkalut, integraatiot",
        timeline: "Riippuu laajuudesta — kartoitetaan yhdessä",
      },
    ],
    packages: [
      {
        name: "Startti",
        setupFee: "299 €",
        monthly: "49 €/kk",
        includes: "Jopa 5 sivua, mobiilioptimoidut, yhteydenottolomake, Google Maps, ylläpito sisältyy, ei sitoutumisaikaa",
      },
      {
        name: "Kasvu (suosituin)",
        setupFee: "599 €",
        monthly: "79 €/kk",
        includes: "Jopa 10 sivua, SEO-optimointi, Google Analytics, CMS sisällönhallinta, blogi, kuukausiraportti",
      },
      {
        name: "Pro",
        setupFee: "999 €",
        monthly: "99 €/kk",
        includes: "Rajaton sivumäärä, verkkokauppa tai varausjärjestelmä, maksujärjestelmä, prioriteettituki, 4h muutostyöt/kk, kvartaalikatsaus",
      },
    ],
    maintenance: [
      {
        name: "Perus",
        price: "150 €/kk",
        includes: "Tietoturvapäivitykset, varmuuskopiointi, sähköpostituki, 1h muutostyöt/kk",
      },
      {
        name: "Standardi",
        price: "350 €/kk",
        includes: "Kaikki Perus + suorituskyvyn seuranta, puhelintuki, 4h muutostyöt/kk, kuukausiraportti",
      },
      {
        name: "Premium",
        price: "750 €/kk",
        includes: "Kaikki Standardi + prioriteettituki 2h vasteaika, 8h muutostyöt/kk, kvartaalikatsaus, CRO-suositukset",
      },
    ],
    addons: "Livechat-asennus 150 €, Google Analytics 100 €, Evästebanneri (GDPR) 150 €, Yhteydenottolomake 100 €, Google Maps 100 €, Nopeutusoptimointi 200 €, Logo-suunnittelu 250 €, Some-linkit & ikonit 75 €, Sähköposti-asennus 100 €, Chatbot-asennus (AI) 300 €, Varausjärjestelmä 350 €, Somejakotoiminnot 100 €",
    process: [
      "1. Maksuton 30 min kartoituspuhelu",
      "2. Kirjallinen tarjous 48h sisällä — kiinteä hinta, ei yllätyksiä",
      "3. Sopimus ja aloituspäivä sovitaan",
      "4. Vaatimusmäärittely + wireframet Figmassa (ei koodiriviä ennen hyväksyntää)",
      "5. Kehitys 1–2 viikon sprinteissä — edistymistä joka viikko",
      "6. Testaus staging-ympäristössä ennen julkaisua",
      "7. Julkaisu + 2 viikon intensiivinen seurantajakso",
      "Maksu erissä: 30% alussa, 40% puolivälissä, 30% julkaisussa",
    ],
    faq: [
      "Teknistä osaamista ei tarvita — Apex hoitaa kaiken teknisen",
      "Lähdekoodi siirtyy aina asiakkaalle täysin projektin päättyessä (100% omistus)",
      "Teknologiat: Next.js, React, TypeScript, Node.js, PostgreSQL, Shopify, WordPress",
      "Takuu: 6 kk verkkosivuille, 3 kk mobiilille — ilmaiset korjaukset",
      "Kiireellinen projekti: mahdollinen tapauskohtaisesti lisäkululla",
      "Kehitystä voi jatkaa itse tai muulla kehittäjällä — koodi on hyvin dokumentoitu",
      "Piilokustannuksia ei ole — kiinteä hinta sovitaan etukäteen",
      "Tuntiveloitus jatkokehityksessä: 95–145 €/h",
    ],
    hosting: "Apex Site hosting +50 €/kk (EU-palvelimet, SSL, varmuuskopiot, tietoturva, 24/7 monitorointi) tai asiakas hoitaa itse 0 €/kk",
  };
}

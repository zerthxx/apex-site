import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "Usein kysyttyä — Apex Site",
  description:
    "Vastaukset yleisimpiin kysymyksiin: projektin kesto, hinnoittelu, prosessi, teknologia ja tuki.",
  alternates: { canonical: "https://apexsite.fi/ukk" },
};

const CATEGORIES = [
  {
    category: "Projektin aloitus",
    items: [
      { id: "p1", question: "Miten projekti aloitetaan?", answer: "Ota yhteyttä joko lomakkeella tai soittamalla. Sovimme 30 minuutin maksuttoman kartoituspuhelun. Sen jälkeen toimitamme kirjallisen tarjouksen 48 tunnissa." },
      { id: "p2", question: "Tarvitseeko minulla olla teknistä osaamista?", answer: "Ei. Hoidamme kaiken teknisen puolen. Sinun tarvitsee vain kertoa mitä haluat saavuttaa — me toteutamme sen." },
      { id: "p3", question: "Voitteko auttaa myös ideointivaiheessa?", answer: "Kyllä. Voimme auttaa selkeyttämään vaatimukset, suunnittelemaan teknisen ratkaisun ja arvioimaan toteutettavuuden ennen projektin aloittamista." },
    ],
  },
  {
    category: "Aikataulut",
    items: [
      { id: "a1", question: "Kuinka kauan verkkosivut kestää rakentaa?", answer: "Yksinkertainen yrityspresenssi valmistuu 3–4 viikossa. Laajempi sivusto 5–8 viikossa. Annamme aina tarkan aikataulun tarjouksessa." },
      { id: "a2", question: "Kuinka kauan verkkokauppa kestää?", answer: "Shopify-pohjainen kauppa 6–8 viikossa. Räätälöity ratkaisu 10–16 viikossa." },
      { id: "a3", question: "Kuinka kauan mobiilisovellus kestää?", answer: "MVP-sovellus 3–4 kuukaudessa. Monimutkaisempi sovellus 5–8 kuukaudessa." },
      { id: "a4", question: "Voitteko tehdä projektin kiireellisesti?", answer: "Joissakin tapauksissa kyllä. Kiireelliset projektit käsitellään tapauskohtaisesti ja niihin voi liittyä kiireellisyyskorotus." },
    ],
  },
  {
    category: "Hinnoittelu ja maksaminen",
    items: [
      { id: "h1", question: "Voiko projektin maksaa erissä?", answer: "Kyllä. Tyypillinen maksujärjestely: 30% aloituksessa, 40% kehityksen puolivälissä, 30% julkaisun yhteydessä." },
      { id: "h2", question: "Mitä tapahtuu jos laajuus muuttuu?", answer: "Muutoksista sovitaan aina kirjallisesti ennen toteutusta. Lisätyö laskutetaan erikseen sovitun tuntihinnan mukaan." },
      { id: "h3", question: "Tarjoatteko ylläpitosopimuksia?", answer: "Kyllä. Ylläpitosopimukset alkavat 150 €/kk ja sisältävät päivitykset, varmuuskopioinnin ja tukipalvelun. Ei sitoutumisaikaa." },
    ],
  },
  {
    category: "Tekniikka ja omistajuus",
    items: [
      { id: "t1", question: "Saanko lähdekoodin?", answer: "Kyllä, aina. Koko lähdekoodi, dokumentaatio ja kaikki tekijänoikeudet siirtyvät sinulle projektin päättyessä." },
      { id: "t2", question: "Mitä teknologioita käytätte?", answer: "Pääasiassa Next.js, React, TypeScript, Node.js, PostgreSQL sekä Shopify ja WordPress tarvittaessa. Valitsemme aina projektin tarpeisiin sopivimmat teknologiat." },
      { id: "t3", question: "Voinko jatkaa kehitystä omalla tiimilläni?", answer: "Kyllä. Toimitetaan selkeä dokumentaatio ja koodia kirjoitetaan niin, että mikä tahansa kehittäjä voi jatkaa työtä." },
      { id: "t4", question: "Onko koodi laadukasta?", answer: "Kyllä. Käytämme automaattisia testejä, code review -prosessia ja kirjoitamme koodia, joka noudattaa alan parhaita käytäntöjä." },
    ],
  },
  {
    category: "Tuki ja takuu",
    items: [
      { id: "s1", question: "Mitä takuu kattaa?", answer: "6 kuukauden takuu julkaisun jälkeen. Jos jokin ei toimi sovitulla tavalla, korjaamme sen maksutta." },
      { id: "s2", question: "Kuinka nopeasti vastaatte?", answer: "Sähköpostiin vastaamme 24 tunnin sisällä arkipäivisin. Ylläpitoasiakkaat saavat prioriteettituen (2–4h vasteaika)." },
      { id: "s3", question: "Entä jos en ole tyytyväinen?", answer: "Kommunikoimme avoimesti koko projektin ajan. Jos jotain menee pieleen, puhumme siitä ja löydämme ratkaisun yhdessä." },
    ],
  },
];

export default function UkkPage() {
  return (
    <>
      <PageHero
        eyebrow="Usein kysyttyä"
        title="Vastauksia yleisimpiin kysymyksiin."
        description="Löydät vastaukset täältä. Jos et löydä, ota yhteyttä — vastaamme mielellämme."
        cta={{ label: "Lähetä kysymys", href: "/yhteystiedot" }}
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-14 max-w-3xl">
            {CATEGORIES.map((cat) => (
              <div key={cat.category}>
                <h2 className="font-display font-bold text-ink text-2xl mb-6 pb-3 border-b border-wire">
                  {cat.category}
                </h2>
                <FaqAccordion items={cat.items} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "Räätälöidyt ohjelmistot — SaaS, CRM, ERP ja toiminnanohjaus",
  description:
    "Rakennamme räätälöidyt SaaS-alustat, CRM- ja ERP-järjestelmät sekä muut bisnestyökalut. Tarjous projektikohtaisesti.",
  alternates: { canonical: "https://apexsite.fi/palvelut/ohjelmistot" },
};

const DELIVERABLES = [
  "Täysin räätälöity ohjelmistoratkaisu",
  "Käyttäjien hallinta ja roolitus",
  "Dashboard ja raportointimoduuli",
  "API-integraatiot kolmansiin järjestelmiin",
  "Tietokantasuunnittelu (PostgreSQL, MongoDB)",
  "Skaalautuva pilviarkkitehtuuri (AWS/Vercel)",
  "Automaattiset testit ja CI/CD-pipeline",
  "Dokumentaatio ja koulutus",
  "Täysi lähdekoodi — omistajuus sinulle",
  "Jatkuva kehityssopimus saatavilla",
];

const PAIN_POINTS = [
  { title: "Valmisohjelma ei vastaa prosessejanne", description: "Maksat ominaisuuksista joita et käytä, mutta tarvitsemasi puuttuvat." },
  { title: "Excel ei enää riitä", description: "Data on hajallaan taulukoissa. Virheet, päivitykset ja raportointi vievät liikaa aikaa." },
  { title: "Järjestelmäintegraatiot puuttuvat", description: "CRM, kirjanpito, varasto ja logistiikka eivät kommunikoi keskenään." },
];

const STEPS = [
  { number: "01", title: "Vaatimusmäärittely", description: "Dokumentoimme kaikki toiminnallisuudet, käyttäjäroolit ja integraatiot." },
  { number: "02", title: "Arkkitehtuuri", description: "Suunnittelemme teknisen ratkaisun, tietokannan ja rajapinnat." },
  { number: "03", title: "MVP-kehitys", description: "Rakennamme toimivan minimiversion nopeaa validointia varten." },
  { number: "04", title: "Iteraatio", description: "Kehitämme sprinteissä palautteen perusteella." },
  { number: "05", title: "Testaus ja tuotantoon vienti", description: "Automaattiset testit, tietoturva-auditointi ja julkaisu." },
  { number: "06", title: "Ylläpito ja kehitys", description: "Jatkuva kehityssopimus uusille ominaisuuksille." },
];

const FAQ = [
  { id: "1", question: "Miten projektin hinta muodostuu?", answer: "Laskutamme tuntiperusteisesti tai sovituilla kiinteillä virstanpylväillä. Kartoituspuhelussa arvioimme kokonaisbudjetin." },
  { id: "2", question: "Kuinka kauan toteutus kestää?", answer: "MVP-versio 2–4 kuukaudessa. Täysimuotoinen järjestelmä 4–12 kuukaudessa laajuudesta riippuen." },
  { id: "3", question: "Voitteko integroida olemassaolevaan järjestelmään?", answer: "Kyllä. Integroimme mihin tahansa moderniin API:iin tai rakennumme legacy-järjestelmää varten välitasoja." },
  { id: "4", question: "Kuka omistaa koodin?", answer: "Sinä. Kaikki lähdekoodi ja tekijänoikeudet siirtyvät sinulle projektin päättyessä." },
  { id: "5", question: "Mitä tapahtuu projektin jälkeen?", answer: "Tarjoamme ylläpito- ja kehityssopimuksia. Voit myös jatkaa kehitystä omalla tai muulla tiimillä — kaikki dokumentaatio on siirretty." },
];

export default function OhjelmistotPage() {
  return (
    <>
      <PageHero
        eyebrow="Räätälöidyt ohjelmistot"
        title="Ohjelmisto, joka on tehty juuri teidän liiketoiminnallenne."
        description="Generic ERP ei riitä? Rakennamme SaaS-alustat, toiminnanohjausjärjestelmät ja räätälöidyt bisnestyökalut — täsmälleen niin kuin tarvitset."
        cta={{ label: "Pyydä ilmainen tarjous", href: "/yhteystiedot" }}
        secondaryCta={{ label: "Katso referenssit", href: "/portfolio" }}
        backgroundVariant="service"
      />
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-8">Tunnistetko nämä haasteet?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (<div key={p.title} className="p-6 rounded-xl border border-bad/20 bg-bad/5"><h3 className="font-heading font-semibold text-ink mb-2">{p.title}</h3><p className="text-ink-dim text-sm leading-relaxed">{p.description}</p></div>))}
          </div>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">Mitä saat meiltä</h2>
              <p className="text-ink-dim leading-relaxed mb-4">Kattava toimitus vaatimusmäärittelystä tuotantoon.</p>
              <p className="text-copper font-semibold">Tarjous projektikohtaisesti</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERABLES.map((item) => (<li key={item} className="flex items-start gap-2.5 text-sm text-ink-dim"><CheckCircle2 size={16} className="text-copper shrink-0 mt-0.5" />{item}</li>))}
            </ul>
          </div>
        </div>
      </section>
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10">Prosessi askel askeleelta</h2>
          <ProcessSteps steps={STEPS} variant="vertical" />
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8">Usein kysyttyä</h2>
          <FaqAccordion items={FAQ} />
        </div>
      </section>
      <ContactCtaSection />
    </>
  );
}

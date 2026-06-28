import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";
import { CaseStudyCard } from "@/components/shared/CaseStudyCard";
import { MOCK_CASE_STUDIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Verkkosivut yritykselle — Modernit ja konvertoivat",
  description:
    "Rakennamme modernit, nopeat ja hakukoneoptimoidut verkkosivut yrityksellesi. Alkaen 3 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/verkkosivut" },
};

const DELIVERABLES = [
  "Responsiivinen, mobiilioptimoidtu design",
  "On-page SEO ja tekninen optimointi",
  "Google Analytics ja hakukonsoli",
  "Yhteydenotto- ja tarjouslomake",
  "Sisällönhallintajärjestelmä (CMS)",
  "Sivuston nopeus ≥ 90 Lighthouse",
  "SSL-sertifikaatti ja tietoturva",
  "6 kuukauden takuu ja ilmainen korjaus",
  "Koulutus sisällönhallintaan",
  "Täysi lähdekoodi ja dokumentaatio",
];

const PAIN_POINTS = [
  {
    title: "Sivusi ovat hitaat ja vanhanaikaiset",
    description: "Asiakkaat poistuvat ennen kuin sivu edes latautuu. Jokainen sekunti maksaa.",
  },
  {
    title: "Google ei löydä yritystäsi",
    description: "Kilpailijasi näkyvät hakutuloksissa, sinä et. Menetät asiakkaita joka päivä.",
  },
  {
    title: "Kävijät eivät ota yhteyttä",
    description: "Sivuilla käy ihmisiä, mutta puhelimesi ei soi. Konversio on lähellä nollaa.",
  },
];

const STEPS = [
  { number: "01", title: "Kartoitus", description: "Opimme yrityksesi, kohderyhmäsi ja tavoitteesi." },
  { number: "02", title: "Design", description: "Suunnittelemme wireframen ja visuaalisen designin Figmassa." },
  { number: "03", title: "Kehitys", description: "Rakennamme sivut nopealla ja modernilla teknologialla." },
  { number: "04", title: "Testaus & julkaisu", description: "Testaamme huolellisesti kaikilla laitteilla ennen julkaisua." },
  { number: "05", title: "SEO & seuranta", description: "Konfiguroimme analytiikan ja hakukoneoptimoinnin." },
  { number: "06", title: "Koulutus & tuki", description: "Koulutamme sinut hallinnoimaan sivuja itsenäisesti." },
];

const FAQ = [
  { id: "1", question: "Kauanko verkkosivujen rakentaminen kestää?", answer: "Tyypillisesti 3–6 viikkoa riippuen laajuudesta. Yksinkertainen yrityssivusto valmistuu 3 viikossa, laajempi 5–6 viikossa." },
  { id: "2", question: "Pystynkö itse päivittämään sisältöä?", answer: "Kyllä. Rakennamme sivut helppokäyttöisellä CMS-järjestelmällä (yleensä Sanity tai WordPress), jonka avulla voit lisätä tekstejä, kuvia ja blogijulkaisuja ilman koodaustaitoja." },
  { id: "3", question: "Sisältyykö palveluun domain ja hosting?", answer: "Ei automaattisesti, mutta autamme sinua hankkimaan ja konfiguroimaan molemmat. Suosittelemme Vercel-hostausta, joka on nopea ja luotettava." },
  { id: "4", question: "Teettekö myös logosuunnittelua?", answer: "Voimme suositella luotettavia suunnittelijoita, mutta emme itse tuota brändäystä. Keskitymme ohjelmistokehitykseen." },
  { id: "5", question: "Mitä jos en ole tyytyväinen tulokseen?", answer: "Meillä on 6 kuukauden takuu julkaisun jälkeen. Jos jokin ei toimi odotetusti, korjaamme sen maksutta." },
];

export default function VerkkosivutPage() {
  return (
    <>
      <PageHero
        eyebrow="Verkkosivut"
        title="Verkkosivut, jotka myyvät — eivät vain näytä hyvältä."
        description="Rakennamme yrityksellesi verkkosivuston, joka herättää luottamusta, näkyy Googlessa ja muuttaa kävijät asiakkaiksi. Nopeat, mobiiliystävälliset ja konversioon optimoidut."
        cta={{ label: "Pyydä ilmainen tarjous", href: "/yhteystiedot" }}
        secondaryCta={{ label: "Katso referenssit", href: "/portfolio" }}
        backgroundVariant="service"
      />

      {/* Pain points */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-8">
            Tunnistetko nämä haasteet?
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <div key={p.title} className="p-6 rounded-xl border border-bad/20 bg-bad/5">
                <h3 className="font-heading font-semibold text-ink mb-2">{p.title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">
                Mitä saat meiltä
              </h2>
              <p className="text-ink-dim leading-relaxed mb-6">
                Toimitus sisältää kaiken mitä tarvitset toimivaan, näkyvään ja konvertoivaan
                verkkosivustoon. Ei lisäkustannuksia, ei yllätyksiä.
              </p>
              <p className="text-copper font-semibold">Alkaen 3 000 €</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-dim">
                  <CheckCircle2 size={16} className="text-copper shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-10">
            Prosessi askel askeleelta
          </h2>
          <ProcessSteps steps={STEPS} variant="vertical" />
        </div>
      </section>

      {/* Case study preview */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8">
            Referenssit
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            {MOCK_CASE_STUDIES.filter((s) => s.service === "Verkkosivut").map((study) => (
              <CaseStudyCard key={study.slug} study={study} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8">
            Usein kysyttyä
          </h2>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

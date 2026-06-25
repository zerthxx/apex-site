import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "Verkkokauppa yritykselle — Shopify, WooCommerce ja räätälöity",
  description:
    "Rakennamme toimivan ja myyvän verkkokaupan. Shopify, WooCommerce tai täysin räätälöity ratkaisu. Alkaen 5 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/verkkokaupat" },
};

const DELIVERABLES = [
  "Täysi verkkokaupparatkaisu valmiina myyntiin",
  "Stripe, Klarna ja Paytrail maksutavat",
  "Varastonhallinta ja tuoteluettelo",
  "Tilausten käsittely ja sähköposti-ilmoitukset",
  "Asiakastilit ja ostohistoria",
  "Kuponki- ja alennuskooditoiminnot",
  "Google Analytics 4 ja konversioseuranta",
  "Mobiilioptimoidut kassavirrat",
  "SEO ja tuotesivujen optimointi",
  "Täysi lähdekoodi ja dokumentaatio",
];

const PAIN_POINTS = [
  { title: "Nykyinen kauppa on hidas tai vaikea käyttää", description: "Asiakkaat keskeyttävät ostokset ennen kassalle pääsyä. Konversio kärsii joka päivä." },
  { title: "Maksaminen tuntuu epäluotettavalta", description: "Ilman tunnettuja maksutapoja asiakkaat epäilevät turvallisuutta ja poistuvat." },
  { title: "Kaupan hallinta vie liikaa aikaa", description: "Tuotteiden lisääminen, tilausten käsittely ja raportointi on työlästä ja manuaalista." },
];

const STEPS = [
  { number: "01", title: "Kartoitus", description: "Selvitämme tuotteesi, kohderyhmäsi ja kaupan tarpeet." },
  { number: "02", title: "Alusta ja design", description: "Valitsemme sopivan alustan ja suunnittelemme visuaalisen ilmeen." },
  { number: "03", title: "Tuotteet ja maksaminen", description: "Konfiguroimme tuoteluettelon, maksut ja toimitustavat." },
  { number: "04", title: "Testaus", description: "Testaamme koko kassavirran eri laitteilla ja maksutavoilla." },
  { number: "05", title: "Julkaisu", description: "Julkaisemme kaupan ja varmistamme sujuvan startin." },
  { number: "06", title: "Seuranta ja kehitys", description: "Seuraamme konversiota ja kehitämme myyntiä dataan perustuen." },
];

const FAQ = [
  { id: "1", question: "Shopify vai WooCommerce?", answer: "Shopify on helpompi ylläpitää, WooCommerce joustavampi. Suosittelemme Shopifya useimmille, mutta valinta riippuu tarpeistasi." },
  { id: "2", question: "Mitkä maksutavat ovat saatavilla?", answer: "Integroimme Stripe (kansainvälinen), Klarna (laskulla/erissä) ja Paytrail (suomalaiset pankit). Kaikki yleisimmät maksutavat ovat saatavilla." },
  { id: "3", question: "Voitko tuoda tuotteet vanhasta kaupasta?", answer: "Kyllä. Voimme migratoida tuotteet, asiakastilit ja tilaushistorian nykyisestä järjestelmästä." },
  { id: "4", question: "Kuinka kauan toteutus kestää?", answer: "Yksinkertainen verkkokauppa valmistuu 6–8 viikossa. Laajempi tai räätälöity ratkaisu 10–16 viikossa." },
  { id: "5", question: "Tarjoatteko ylläpitoa kaupalle?", answer: "Kyllä. Ylläpitosopimus kattaa päivitykset, tietoturvan, varmuuskopioinnin ja tukipalvelun." },
];

export default function VerkkokauppatPage() {
  return (
    <>
      <PageHero
        eyebrow="Verkkokaupat"
        title="Verkkokauppa, joka tekee töitä puolestasi vuorokauden ympäri."
        description="Shopify-, WooCommerce- tai täysin räätälöidyt verkkokaupparatkaisut. Myy tuotteitasi, palveluitasi tai tilauksia verkossa — turvallisesti ja tehokkaasti."
        cta={{ label: "Pyydä ilmainen tarjous", href: "/yhteystiedot" }}
        secondaryCta={{ label: "Katso referenssit", href: "/portfolio" }}
        backgroundVariant="service"
      />
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-ghost mb-8">Tunnistetko nämä haasteet?</p>
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
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">Mitä saat meiltä</h2>
              <p className="text-ink-dim leading-relaxed mb-4">Toimitus sisältää kaiken mitä tarvitset toimivaan ja myyvään verkkokauppaan.</p>
              <p className="text-copper font-semibold">Alkaen 5 000 €</p>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-dim">
                  <CheckCircle2 size={16} className="text-copper shrink-0 mt-0.5" />{item}
                </li>
              ))}
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
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-8">Usein kysyttyä</h2>
          <FaqAccordion items={FAQ} />
        </div>
      </section>
      <ContactCtaSection />
    </>
  );
}

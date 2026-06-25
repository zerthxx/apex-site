import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "AI-ratkaisut ja automaatio yritykselle",
  description:
    "Automatisoi liiketoimintaprosesseja AI:n avulla. Chatbotit, automaatio, RAG-ratkaisut ja OpenAI-integraatiot. Alkaen 4 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/ai-ratkaisut" },
};

const DELIVERABLES = [
  "Räätälöity AI-chatbot tai -agentti",
  "Dokumenttien automaattinen käsittely",
  "RAG (Retrieval-Augmented Generation) -ratkaisu",
  "OpenAI / Anthropic API -integraatio",
  "Työnkulun automaatio (n8n, Zapier-tasolla)",
  "Raportointi- ja analytiikka-automaatio",
  "Asiakaspalvelubotti yhteydenottolomakkeelle",
  "Tuloksia mittaava dashboard",
  "Koulutus tiimillesi",
  "Dokumentaatio ja lähdekoodi",
];

const PAIN_POINTS = [
  { title: "Toistat samoja manuaalisia tehtäviä päivittäin", description: "Sähköpostien lajittelu, raporttien luonti, tiedon etsintä. AI voi tehdä nämä sekunteissa." },
  { title: "Asiakaspalvelu kuormittuu rutiiniviesteillä", description: "80 % asiakaskysymyksistä on toistuvia. AI-chatbot vastaa niihin 24/7 ilman odotusaikaa." },
  { title: "Dataa on, mutta se ei palvele päätöksentekoa", description: "Tieto on hajallaan eri järjestelmissä. AI kokoaa ja analysoi sen puolestasi." },
];

const STEPS = [
  { number: "01", title: "Prosessikartoitus", description: "Tunnistamme prosessit, joissa AI tuo eniten hyötyä." },
  { number: "02", title: "Ratkaisusuunnittelu", description: "Suunnittelemme teknisen arkkitehtuurin ja valitsemme mallit." },
  { number: "03", title: "Prototyyppi", description: "Rakennamme toimivan prototyypin ja validoimme sen kanssasi." },
  { number: "04", title: "Kehitys ja integraatio", description: "Integroimme ratkaisun olemassaoleviin järjestelmiisi." },
  { number: "05", title: "Testaus ja koulutus", description: "Testaamme tarkkuuden ja koulutamme tiimisi käyttämään ratkaisua." },
  { number: "06", title: "Seuranta", description: "Mittaamme hyödyt ja kehitämme ratkaisua jatkuvasti." },
];

const FAQ = [
  { id: "1", question: "Tarvitseeko minulla olla AI-osaamista?", answer: "Ei lainkaan. Hoidamme kaiken teknisen toteutuksen. Sinun tarvitsee vain kertoa mitä haluat automatisoida." },
  { id: "2", question: "Käytättekö ChatGPT:tä?", answer: "Käytämme OpenAI:n ja Anthropicin malleja (GPT-4o, Claude 3.5) sekä muita malleja tarpeen mukaan. Valitsemme parhaan ratkaisun käyttötapauksellesi." },
  { id: "3", question: "Onko datani turvallista?", answer: "Kyllä. Rakennamme ratkaisut siten, että arkaluonteinen data ei poistu järjestelmistäsi. Voidaan käyttää myös paikallisia malleja." },
  { id: "4", question: "Kuinka nopeasti näen tuloksia?", answer: "Yksinkertainen automaatio voi olla käytössä 2–4 viikossa. Monimutkaisempi ratkaisu 6–12 viikossa." },
  { id: "5", question: "Mitä AI maksaa kuukaudessa?", answer: "API-kulut vaihtelevat käytön mukaan, tyypillisesti 20–500 €/kk. Kerromme arviot etukäteen." },
];

export default function AiRatkaisutPage() {
  return (
    <>
      <PageHero
        eyebrow="AI-ratkaisut"
        title="Tekoäly tekee töitä — sinä kasvat."
        description="Automatisoi toistuvat prosessit, säästä henkilöstöresursseja ja tee parempia päätöksiä dataan perustuen. Räätälöidyt AI-ratkaisut yrityksesi tarpeisiin."
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
              <p className="text-ink-dim leading-relaxed mb-4">Konkreettinen, mitattava AI-ratkaisu — ei pelkkiä kokeiluja.</p>
              <p className="text-copper font-semibold">Alkaen 4 000 €</p>
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

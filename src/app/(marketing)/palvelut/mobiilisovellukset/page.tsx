import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

export const metadata: Metadata = {
  title: "Mobiilisovellukset — iOS ja Android yritykselle",
  description:
    "Native iOS- ja Android-sovellukset sekä cross-platform React Native -ratkaisut. Julkaisemme App Storeen ja Google Playhin. Alkaen 15 000 €.",
  alternates: { canonical: "https://apexsite.fi/palvelut/mobiilisovellukset" },
};

const DELIVERABLES = [
  "Native iOS (Swift) tai Android (Kotlin) sovellus",
  "React Native cross-platform vaihtoehdolla",
  "App Store ja Google Play -julkaisu",
  "Push-ilmoitukset ja tausta-ajot",
  "Offline-toiminnallisuus",
  "Analytiikka ja kaatumisraportointi",
  "Käyttäjätodennustus (Face ID, Google Sign-in)",
  "RESTful tai GraphQL API-integraatiot",
  "Täysi lähdekoodi ja dokumentaatio",
  "3 kuukauden takuuaika",
];

const PAIN_POINTS = [
  { title: "Yritykseltäsi puuttuu mobiilikanava", description: "Asiakkaasi haluavat asioida puhelimella. Ilman sovellusta menetät heidät kilpailijoille." },
  { title: "Kilpailijat tavoittavat asiakkaat mobiililla", description: "Sovellukset lisäävät sitoutumista ja asiakasuskollisuutta dramaattisesti." },
  { title: "Web-applikaatio ei riitä", description: "Jotkin toiminnot — offline, kamera, paikannus — vaativat native-sovelluksen." },
];

const STEPS = [
  { number: "01", title: "Kartoitus", description: "Määrittelemme sovelluksen toiminnallisuudet, kohderyhmän ja liiketoimintatavoitteet." },
  { number: "02", title: "UX/UI-suunnittelu", description: "Suunnittelemme wireframen ja visuaalisen designin Figmassa." },
  { number: "03", title: "Kehitys", description: "Rakennamme sovelluksen sprinteissä ja esittelemme edistymisen viikoittain." },
  { number: "04", title: "Testaus", description: "Testaamme laitteilla, beta-käyttäjillä ja automaattisilla testeillä." },
  { number: "05", title: "Julkaisu", description: "Julkaisemme App Storeen ja/tai Google Playhin." },
  { number: "06", title: "Ylläpito", description: "Seuraamme analytiikkaa ja julkaisemme päivityksiä tarpeen mukaan." },
];

const FAQ = [
  { id: "1", question: "iOS vai Android vai molemmat?", answer: "Suosittelemme React Native -kehitystä, jolla yksi codebase tuottaa sekä iOS- että Android-sovelluksen. Se on kustannustehokkain vaihtoehto." },
  { id: "2", question: "Kuinka kauan kehitys kestää?", answer: "Yksinkertainen MVP-sovellus valmistuu 3–4 kuukaudessa. Monimutkaisempi sovellus 5–8 kuukaudessa." },
  { id: "3", question: "Tarvitsenko Apple Developer -tilin?", answer: "Kyllä, App Store -julkaisua varten tarvitaan Apple Developer -tili (99 €/vuosi). Google Play vaatii vastaavan 25 € kertamaksun." },
  { id: "4", question: "Voitteko integroida olemassaolevaan backendiin?", answer: "Kyllä. Integroimme mihin tahansa REST API:iin, GraphQL-endpointiin tai tietokantaan." },
  { id: "5", question: "Saanko lähdekoodin?", answer: "Kyllä, aina. Koko lähdekoodi dokumentaatioineen siirtyy sinulle julkaisun yhteydessä." },
];

export default function MobiilisovelluksetPage() {
  return (
    <>
      <PageHero
        eyebrow="Mobiilisovellukset"
        title="Mobiilisovellus, jota asiakkaasi rakastaa käyttää."
        description="Native iOS- ja Android-sovellukset sekä cross-platform React Native -ratkaisut. Suunnittelemme, rakennamme ja julkaisemme sovelluksesi App Storeen ja Google Playhin."
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
              <p className="text-ink-dim leading-relaxed mb-4">Kattava toimitus suunnittelusta julkaisuun ja ylläpitoon.</p>
              <p className="text-copper font-semibold">Alkaen 15 000 €</p>
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

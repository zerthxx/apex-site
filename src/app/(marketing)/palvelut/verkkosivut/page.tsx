import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye, MousePointerClick, Search, Smartphone, TrendingUp,
  Palette, Code2, Rocket, CheckCircle2, XCircle,
  Wand2, Zap, Shield, Headphones, ArrowRight, Phone,
  Server, Globe,
} from "lucide-react";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Verkkosivut yritykselle — Modernit, nopeat ja hakukoneoptimoidut",
  description:
    "Räätälöidyt verkkosivustot yrityksille. Moderni design, nopea suorituskyky, SEO ja jatkuva tuki. Alkaen 3 000 €. Varaa maksuton kartoitus.",
  alternates: { canonical: "https://apexsite.fi/palvelut/verkkosivut" },
};

const WHY_CARDS = [
  { icon: Eye, title: "Ensivaikutelma ratkaisee", text: "Useimmat asiakkaat muodostavat mielipiteensä yrityksestä muutamassa sekunnissa. Moderni sivusto lisää luottamusta välittömästi." },
  { icon: MousePointerClick, title: "Enemmän yhteydenottoja", text: "Selkeä rakenne, hyvä käyttökokemus ja toimivat yhteydenottokanavat auttavat muuttamaan kävijät asiakkaiksi." },
  { icon: Search, title: "Parempi näkyvyys Googlessa", text: "Hakukoneoptimoitu sivusto auttaa yritystäsi löytymään silloin, kun asiakkaat etsivät palveluitasi." },
  { icon: Smartphone, title: "Nopea ja mobiiliystävällinen", text: "Sivusto toimii erinomaisesti kaikilla laitteilla — tietokoneella, tabletilla ja puhelimella." },
  { icon: TrendingUp, title: "Yrityksen kasvu", text: "Hyvät verkkosivut eivät ole pelkkä käyntikortti. Ne auttavat hankkimaan uusia asiakkaita ja tukevat liiketoimintasi kasvua." },
];

const DESIGN_ITEMS = ["Räätälöity ulkoasu", "Responsiivinen suunnittelu", "Moderni käyttöliittymä", "Brändin mukainen ilme", "Selkeä käyttäjäkokemus"];
const DEV_ITEMS = ["Nopea suorituskyky", "Hakukoneoptimointi (SEO)", "Google Analytics", "SSL-suojaus", "Sisällönhallinta (CMS)", "Yhteydenottolomakkeet", "Tekninen optimointi", "Helppo laajennettavuus"];
const AFTER_ITEMS = ["Käyttöönotto ja opastus", "6 kuukauden takuu", "Virheiden korjaus veloituksetta", "Tekninen tuki", "Mahdollisuus jatkuvaan ylläpitoon"];

const INDUSTRIES = [
  "Ravintolat", "Parturit & kampaamot", "Rakennusyritykset", "Lakitoimistot",
  "Kiinteistövälittäjät", "Verkkokaupat", "Terveyspalvelut", "Konsultit & asiantuntijat",
  "Tilitoimistot", "Autokorjaamot", "Ja kaikki kasvua hakevat yritykset",
];

const TECHS = [
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextdotjs" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "Framer Motion", slug: "framer" },
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "Docker", slug: "docker" },
  { name: "Vercel", slug: "vercel" },
  { name: "Cloudflare", slug: "cloudflare" },
  { name: "Cloudinary", slug: "cloudinary" },
  { name: "Google Analytics", slug: "googleanalytics" },
];

const STEPS = [
  { title: "Ota yhteyttä", text: "Live Chat, AI-chatbotti, yhteydenottolomake tai sähköposti — valitse sinulle sopivin tapa." },
  { title: "Maksuton 30 min kartoitus", text: "Keskustelemme tavoitteistasi ja suosittelemme juuri yrityksellesi sopivaa ratkaisua." },
  { title: "Tarjous", text: "Saat selkeän, läpinäkyvän tarjouksen ilman piilokuluja." },
  { title: "Suunnittelu", text: "Suunnittelemme verkkosivuston rakenteen, ulkoasun ja käyttäjäpolut." },
  { title: "Kehitys", text: "Rakennamme verkkosivuston moderneilla teknologioilla — nopeasti ja laadukkaasti." },
  { title: "Testaus", text: "Testaamme kaiken huolellisesti kaikilla laitteilla ja selaimilla ennen julkaisua." },
  { title: "Julkaisu", text: "Julkaisemme verkkosivuston turvallisesti ja varmistamme, että kaikki toimii." },
  { title: "Hosting", text: "Valitset oman hostingin tai Apex Site -hosting-palvelumme — me hoidamme loput." },
  { title: "Ylläpito", text: "Jatkuva ylläpito, tietoturva, päivitykset ja tekninen tuki kun tarvitset." },
];

const APEX_HOSTING_ITEMS = [
  "Hosting EU-palvelimilla", "SSL-sertifikaatti", "Domain-hallinta tarvittaessa",
  "Automaattiset varmuuskopiot", "Tietoturvapäivitykset", "Nopeusoptimointi",
  "Jatkuva valvonta 24/7", "Tekninen tuki", "Pienet muutokset ylläpitopaketin mukaan",
];

const OWN_HOSTING_CONS = [
  "Vastaat itse palvelimesta", "Vastaat itse päivityksistä", "Ei automaattisia varmuuskopioita", "SSL hankittava erikseen",
];

const WHY_APEX_HOSTING = [
  "Sinun ei tarvitse huolehtia teknisistä asioista", "Sivusto pysyy aina turvallisena ja ajan tasalla",
  "Automaattiset varmuuskopiot — tiedot eivät katoa", "Nopea palvelin parantaa käyttäjäkokemusta ja SEO:ta",
  "Tekninen tuki aina saatavilla", "Tietoturvapäivitykset hoidetaan puolestasi",
];

const KARTOITUS_ITEMS = [
  "Käymme läpi yrityksesi tavoitteet", "Kartoitamme tarpeesi ja toiveesi",
  "Suosittelemme sopivinta ratkaisua", "Arvioimme aikataulun ja budjetin",
  "Saat alustavan kustannusarvion", "Ei sitoutumista — täysin maksuton",
];

const WHY_US = [
  { icon: Wand2, title: "Räätälöidyt ratkaisut", text: "Ei valmiita teemoja — jokainen sivusto rakennetaan yrityksesi tarpeisiin ja tavoitteisiin." },
  { icon: Zap, title: "Nopeat verkkosivustot", text: "Lighthouse-pisteet 90+. Nopeus on sekä käyttäjäkokemus- että SEO-tekijä." },
  { icon: Shield, title: "Turvallinen toteutus", text: "SSL, GDPR, palomuurit ja automaattiset varmuuskopiot jokaisessa projektissa." },
  { icon: Headphones, title: "Jatkuva tekninen tuki", text: "Emme katoa julkaisun jälkeen — olemme tavoitettavissa kun tarvitset apua." },
  { icon: TrendingUp, title: "Skaalautuva ratkaisu", text: "Sivusto kasvaa yrityksesi mukana. Uudet ominaisuudet lisätään helposti." },
  { icon: Code2, title: "Modernit teknologiat", text: "React, Next.js ja parhaat työkalut — tekniikka joka kestää aikaa." },
];

const FAQ = [
  { id: "1", question: "Kuinka kauan verkkosivuston toteutus kestää?", answer: "Tyypillisesti 2–6 viikkoa laajuudesta riippuen. Yksinkertainen yrityssivusto valmistuu 2–3 viikossa, laajempi 4–6 viikossa. Sovimme aikataulusta tarkemmin kartoituspuhelussa." },
  { id: "2", question: "Voinko käyttää omaa domainia?", answer: "Kyllä. Voit käyttää olemassa olevaa domainiasi tai autamme sinua hankkimaan uuden. Hoidamme myös DNS-konfiguroinnin puolestasi." },
  { id: "3", question: "Sisältyykö hosting?", answer: "Voit valita oman hostingin tai Apex Site -hosting-palvelumme. Hosting-paketissamme kaikki on hoidettu puolestasi: palvelin, SSL, varmuuskopiot, päivitykset ja tuki." },
  { id: "4", question: "Voinko päivittää sisältöä itse?", answer: "Kyllä. Rakennamme sivustot helppokäyttöisellä CMS-järjestelmällä, jonka avulla voit lisätä tekstejä, kuvia ja blogijulkaisuja ilman koodaustaitoja." },
  { id: "5", question: "Sisältyykö hakukoneoptimointi?", answer: "Kyllä. On-page SEO, tekninen optimointi, metatiedot ja Google Analytics sisältyvät jokaiseen projektiin." },
  { id: "6", question: "Mitä tapahtuu projektin valmistuttua?", answer: "Tarjoamme 6 kuukauden takuun — kaikki julkaisun jälkeen havaitut viat korjataan veloituksetta. Jatkuvaan ylläpitoon on saatavilla kuukausisopimus." },
  { id: "7", question: "Voitteko uudistaa nykyisen verkkosivuni?", answer: "Kyllä. Voimme uudistaa olemassa olevan sivuston kokonaan tai osittain — design, teknologia tai molemmat." },
  { id: "8", question: "Tarjoatteko jatkuvaa ylläpitoa?", answer: "Kyllä. Ylläpitopaketit sisältävät hostingin, tietoturvapäivitykset, varmuuskopiot, teknisen tuen ja pienet muutostyöt." },
  { id: "9", question: "Miksi verkkosivut maksavat alkaen 3 000 €?", answer: "Jokainen projekti suunnitellaan yrityksen tarpeiden mukaan ilman valmiita teemoja. Lopullinen hinta määräytyy laajuuden, ominaisuuksien ja mahdollisten integraatioiden perusteella. Saat tarkan tarjouksen kartoituspuhelun jälkeen." },
];

export default function VerkkosivutPage() {
  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-copper/5 blur-3xl" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-teal-brand/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <Badge variant="accent" className="mb-5">Verkkosivut</Badge>
              <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                Verkkosivusto, joka näyttää ammattimaiselta, toimii nopeasti ja muuttaa kävijät asiakkaiksi.
              </h1>
              <p className="text-ink-dim text-lg leading-relaxed mb-8">
                Jokainen sivusto suunnitellaan yrityksesi tavoitteiden mukaan — ilman valmiita teemoja tai kompromisseja.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Button asChild size="lg">
                  <Link href="/yhteystiedot">Varaa maksuton 30 min kartoitus</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/hinnoittelu">Katso hinnat <ArrowRight size={16} /></Link>
                </Button>
              </div>
              {/* Trust row */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {["Maksuton 30 min kartoitus", "Ei sitoutumista", "Räätälöity toteutus", "Oma tai meidän hosting"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-ink-dim">
                    <span className="text-copper font-bold">✓</span>{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — browser mockup */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-wire bg-elevated shadow-2xl overflow-hidden">
                {/* Browser chrome */}
                <div className="h-9 bg-surface border-b border-wire flex items-center gap-1.5 px-4">
                  <div className="w-3 h-3 rounded-full bg-bad/50" />
                  <div className="w-3 h-3 rounded-full bg-copper/50" />
                  <div className="w-3 h-3 rounded-full bg-ok/50" />
                  <div className="flex-1 mx-4 h-5 rounded-md bg-wire flex items-center px-3 gap-2">
                    <div className="w-3 h-3 rounded-full bg-wire-bold shrink-0" />
                    <span className="text-[10px] text-ink-ghost">apexsite.fi</span>
                  </div>
                </div>
                {/* Mock page content */}
                <div className="p-5 space-y-4">
                  {/* Mock nav */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-20 rounded bg-copper/20" />
                    <div className="flex gap-3">
                      {[56, 48, 52, 44].map((w, i) => <div key={i} className="h-3 rounded bg-wire" style={{ width: w }} />)}
                    </div>
                    <div className="h-7 w-24 rounded-lg bg-copper/30" />
                  </div>
                  {/* Mock hero */}
                  <div className="py-6 space-y-3 border-b border-wire">
                    <div className="h-3 w-20 rounded bg-copper/30" />
                    <div className="h-6 w-64 rounded bg-ink/30" />
                    <div className="h-6 w-52 rounded bg-ink/20" />
                    <div className="h-4 w-72 rounded bg-ink/10" />
                    <div className="h-4 w-56 rounded bg-ink/10" />
                    <div className="flex gap-3 mt-4">
                      <div className="h-8 w-32 rounded-lg bg-copper/40" />
                      <div className="h-8 w-28 rounded-lg bg-wire" />
                    </div>
                  </div>
                  {/* Mock cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="rounded-lg border border-wire p-3 space-y-2">
                        <div className="w-6 h-6 rounded-md bg-copper/20" />
                        <div className="h-3 w-full rounded bg-ink/15" />
                        <div className="h-2.5 w-4/5 rounded bg-ink/10" />
                        <div className="h-2.5 w-3/5 rounded bg-ink/10" />
                      </div>
                    ))}
                  </div>
                  {/* Mock stats */}
                  <div className="flex gap-4 pt-1">
                    {["Nopea", "Turvallinen", "SEO-optimoitu"].map(l => (
                      <div key={l} className="flex items-center gap-1.5 text-[10px] text-ink-ghost">
                        <div className="w-1.5 h-1.5 rounded-full bg-ok/60" />{l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY QUALITY ─────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Miksi se on tärkeää</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
              Miksi laadukkaat verkkosivut ovat tärkeitä?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CARDS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/40 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-copper" />
                </div>
                <h3 className="font-heading font-semibold text-ink mb-2">{title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ──────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Toimitussisältö</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">Mitä palvelu sisältää?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Palette, title: "Design", items: DESIGN_ITEMS },
              { icon: Code2, title: "Kehitys", items: DEV_ITEMS },
              { icon: Rocket, title: "Julkaisun jälkeen", items: AFTER_ITEMS },
            ].map(({ icon: Icon, title, items }) => (
              <div key={title} className="p-6 rounded-xl border border-wire bg-elevated">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-copper/10 flex items-center justify-center">
                    <Icon size={16} className="text-copper" />
                  </div>
                  <h3 className="font-heading font-semibold text-ink">{title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-ink-dim">
                      <CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-wire">
            <div>
              <span className="text-ink-ghost text-sm">Alkaen </span>
              <span className="text-copper font-bold text-2xl">3 000 €</span>
              <span className="text-ink-ghost text-sm ml-1">räätälöity toteutus</span>
            </div>
            <Button asChild size="md">
              <Link href="/yhteystiedot">Pyydä tarjous <ArrowRight size={15} /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── WHO IS IT FOR ────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Kohderyhmä</span>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-8">Kenelle palvelu sopii?</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {INDUSTRIES.map((ind, i) => (
              <span
                key={ind}
                className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                  i === INDUSTRIES.length - 1
                    ? "border-copper/50 text-copper bg-copper/5"
                    : "border-wire bg-elevated text-ink-dim hover:border-copper/40"
                }`}
              >
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGIES ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Teknologiat</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">Modernit työkalut, kestävät tulokset</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {TECHS.map(({ name, slug }) => (
              <div key={name} className="p-4 rounded-xl bg-elevated border border-wire hover:border-copper/30 transition-colors flex flex-col items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://cdn.simpleicons.org/${slug}/C8813A`}
                  width={28}
                  height={28}
                  alt={name}
                  loading="lazy"
                />
                <span className="text-[11px] text-ink-ghost text-center leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESS ──────────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Prosessi</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">Näin projekti etenee</h2>
            <p className="text-ink-dim mt-3 max-w-lg mx-auto">Läpinäkyvä prosessi alusta loppuun — tiedät aina missä mennään.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-copper bg-copper/10 text-copper font-bold text-sm flex items-center justify-center shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-gradient-to-b from-copper/40 to-wire/20 my-1 min-h-[2rem]" />
                  )}
                </div>
                <div className="pb-8 pt-1.5">
                  <h3 className="font-heading font-semibold text-ink mb-1">{step.title}</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOSTING ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Hosting</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">Hosting-vaihtoehdot</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Own hosting */}
            <div className="gradient-border-white bg-elevated p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-wire flex items-center justify-center">
                  <Server size={16} className="text-ink-dim" />
                </div>
                <h3 className="font-heading font-semibold text-ink">Oma hosting</h3>
              </div>
              <p className="text-ink-dim text-sm mb-4">Siirrämme verkkosivuston valitsemallesi palvelimelle. Vastaat itse ylläpidosta.</p>
              <ul className="space-y-2">
                {OWN_HOSTING_CONS.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-ghost">
                    <XCircle size={14} className="text-bad/70 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Apex hosting */}
            <div className="gradient-border bg-elevated shadow-glow p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-copper/10 flex items-center justify-center">
                  <Globe size={16} className="text-copper" />
                </div>
                <h3 className="font-heading font-semibold text-ink">Apex Site Hosting</h3>
                <Badge variant="accent" size="sm">Suositeltu</Badge>
              </div>
              <p className="text-ink-dim text-sm mb-4">Kuukausimaksulla hoidamme kaiken puolestasi — sinä keskityt liiketoimintaasi.</p>
              <ul className="space-y-2">
                {APEX_HOSTING_ITEMS.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink-dim">
                    <CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Why Apex hosting */}
          <div className="mt-8 p-6 rounded-xl border border-copper/20 bg-copper/5 max-w-3xl mx-auto">
            <h3 className="font-heading font-semibold text-ink mb-4">Miksi asiakkaat valitsevat Apex Site Hostingin?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WHY_APEX_HOSTING.map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-ink-dim">
                  <CheckCircle2 size={14} className="text-copper shrink-0 mt-0.5" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── KARTOITUS ────────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Maksuton kartoitus</span>
              <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2 mb-4">
                Mitä saat maksuttomassa 30 min kartoituksessa?
              </h2>
              <p className="text-ink-dim leading-relaxed mb-6">
                Ennen kuin teet mitään päätöksiä, haluamme ymmärtää yrityksesi tarpeet. Kartoituspuhelu on täysin maksuton, eikä sido sinua mihinkään.
              </p>
              <Button asChild size="md">
                <Link href="/yhteystiedot">Varaa maksuton kartoitus <ArrowRight size={15} /></Link>
              </Button>
            </div>
            <ul className="space-y-3">
              {KARTOITUS_ITEMS.map(item => (
                <li key={item} className="flex items-start gap-3 p-3.5 rounded-lg bg-elevated border border-wire text-sm text-ink-dim">
                  <CheckCircle2 size={16} className="text-copper shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── WHY US ───────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">Miksi me</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">
              Miksi yritykset valitsevat Apex Siten?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_US.map(({ icon: Icon, title, text }) => (
              <div key={title} className="p-6 rounded-xl border border-wire bg-elevated hover:border-copper/40 transition-colors duration-200">
                <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-copper" />
                </div>
                <h3 className="font-heading font-semibold text-ink mb-2">{title}</h3>
                <p className="text-ink-dim text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-16 bg-surface/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-copper">UKK</span>
            <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mt-2">Usein kysyttyä</h2>
          </div>
          <FaqAccordion items={FAQ} />
        </div>
      </section>

      {/* ─── PRE-CTA ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-4">
            Valmis kasvattamaan yrityksesi näkyvyyttä verkossa?
          </h2>
          <p className="text-ink-dim text-lg leading-relaxed">
            Laadukas verkkosivusto rakentaa luottamusta, auttaa hankkimaan uusia asiakkaita ja tukee yrityksesi kasvua. Aloita maksuttomalla kartoituspuhelulla — ei sitoumuksia, ei piilokuluja.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-copper/8 blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] rounded-full bg-teal-brand/5 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge variant="accent" className="mb-5">Aloitetaan</Badge>
          <h2 className="font-display font-bold text-ink text-3xl sm:text-5xl mb-4 max-w-2xl mx-auto">
            Rakennetaan yrityksellesi verkkosivusto, joka tekee vaikutuksen.
          </h2>
          <p className="text-ink-dim text-lg mb-8 max-w-xl mx-auto">
            Varaa maksuton 30 minuutin kartoitus. Suunnitellaan yhdessä juuri sinulle sopiva ratkaisu — ilman sitoumuksia.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/yhteystiedot">Varaa maksuton kartoitus <ArrowRight size={16} /></Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/yhteystiedot?palvelu=verkkosivut">
                <Phone size={16} />Pyydä tarjous
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-6">
            {["Maksuton kartoitus", "Tarjous 48 h", "Ei sitoutumista"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-ink-ghost">
                <span className="text-copper">✓</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

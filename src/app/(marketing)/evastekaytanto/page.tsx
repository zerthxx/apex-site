import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";

export const metadata: Metadata = {
  title: "Evästekäytäntö — Apex Site",
  description: "Apex Siten evästekäytäntö. Miten käytämme evästeitä ja miten voit hallita niitä.",
  alternates: { canonical: "https://apexsite.fi/evastekaytanto" },
};

export default function EvastekaytantoPage() {
  return (
    <>
      <PageHero
        eyebrow="Evästekäytäntö"
        title="Evästekäytäntö"
        description="Päivitetty 28.6.2026. Tämä sivu kertoo miten käytämme evästeitä verkkosivustollamme."
        backgroundVariant="minimal"
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="prose prose-invert prose-sm max-w-none space-y-10">

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">1. Mitä evästeet ovat?</h2>
              <p className="text-ink-dim leading-relaxed">
                Evästeet ovat pieniä tekstitiedostoja, jotka verkkosivusto tallentaa selaimellesi vierailun aikana.
                Niiden avulla sivusto voi muistaa valintasi ja parantaa käyttökokemustasi.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">2. Mitä evästeitä käytämme?</h2>
              <p className="text-ink-dim leading-relaxed mb-4">Käytämme seuraavia evästetyyppejä:</p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-elevated border border-wire">
                  <h3 className="font-heading font-semibold text-ink mb-1">Välttämättömät evästeet</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">
                    Nämä evästeet ovat välttämättömiä sivuston perustoimintojen kannalta, kuten kirjautumisen
                    ja istunnonhallinnan. Niitä ei voi poistaa käytöstä. Ne eivät sisällä henkilötietoja.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-elevated border border-wire">
                  <h3 className="font-heading font-semibold text-ink mb-1">Analytiikkaevästeet</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">
                    Käytämme Google Analytics 4 -palvelua ymmärtääksemme miten kävijät käyttävät sivustoamme.
                    Nämä evästeet keräävät tietoa anonyymisti, kuten sivulatausten määrän ja käyttäjien
                    sijainnin maatasolla. Voit kieltäytyä näistä evästeistä.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-elevated border border-wire">
                  <h3 className="font-heading font-semibold text-ink mb-1">Live Chat -evästeet</h3>
                  <p className="text-ink-dim text-sm leading-relaxed">
                    Crisp-live chat -palvelu saattaa asettaa evästeen tunnistamaan aiemman keskusteluhistorian.
                    Tämä parantaa asiakaspalvelukokemusta. Eväste poistetaan, kun suljet selaimen tai tyhjennettyäsi
                    selaimen evästeet.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">3. Evästeiden hallinta</h2>
              <p className="text-ink-dim leading-relaxed mb-3">
                Voit hallita ja poistaa evästeitä selaimen asetuksista. Useimmissa selaimissa se onnistuu
                valitsemalla:
              </p>
              <ul className="list-disc list-inside text-ink-dim space-y-1.5 text-sm leading-relaxed">
                <li>Chrome: Asetukset → Tietosuoja ja turvallisuus → Evästeet ja muut sivustotiedot</li>
                <li>Firefox: Asetukset → Tietosuoja ja turvallisuus → Evästeet</li>
                <li>Safari: Asetukset → Tietosuoja → Hallitse verkkosivuston tietoja</li>
                <li>Edge: Asetukset → Evästeet ja sivustoluvat</li>
              </ul>
              <p className="text-ink-dim leading-relaxed mt-3">
                Huomaa, että evästeiden poistaminen voi vaikuttaa sivuston toiminnallisuuteen, kuten
                kirjautumiseen.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">4. Kolmansien osapuolten evästeet</h2>
              <p className="text-ink-dim leading-relaxed">
                Sivustollamme toimivat kolmannen osapuolen palvelut voivat asettaa omia evästeitään:
              </p>
              <ul className="list-disc list-inside text-ink-dim space-y-1.5 text-sm leading-relaxed mt-3">
                <li>Google Analytics (analytiikka)</li>
                <li>Crisp (live chat -asiakaspalvelu)</li>
              </ul>
              <p className="text-ink-dim leading-relaxed mt-3">
                Nämä palveluntarjoajat käsittelevät tietoja omien tietosuojakäytäntöjensä mukaisesti.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">5. Muutokset evästekäytäntöön</h2>
              <p className="text-ink-dim leading-relaxed">
                Pidätämme oikeuden päivittää tätä evästekäytäntöä. Muutoksista ilmoitetaan tällä sivulla
                ja päivämäärä ylhäällä päivittyy muutosten yhteydessä.
              </p>
            </div>

            <div>
              <h2 className="font-display font-bold text-ink text-2xl mb-4">6. Yhteystiedot</h2>
              <p className="text-ink-dim leading-relaxed">
                Evästeitä koskevat kysymykset voi lähettää osoitteeseen:{" "}
                <a href="mailto:info@apexsite.fi" className="text-copper hover:underline">
                  info@apexsite.fi
                </a>
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

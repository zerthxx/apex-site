import type { Metadata } from "next";
import { Suspense } from "react";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { ContactForm } from "@/components/shared/ContactForm";

export const metadata: Metadata = {
  title: "Yhteystiedot — Ota yhteyttä Apex Siteen",
  description:
    "Ota yhteyttä ja pyydä ilmainen tarjous. Vastaamme 24 tunnissa. Puhelin, sähköposti tai lomake.",
  alternates: { canonical: "https://apexsite.fi/yhteystiedot" },
};

const CONTACT_DETAILS = [
  { icon: Mail, label: "Sähköposti", value: "info@apexsite.fi", href: "mailto:info@apexsite.fi" },
  { icon: Phone, label: "Puhelin", value: "+358 44 2455490", href: "tel:+358442455490" },
  { icon: MapPin, label: "Osoite", value: "Helsinki, Suomi", href: null },
  { icon: Clock, label: "Vastausaika", value: "24 h arkipäivisin", href: null },
];

export default function YhteystiedotPage() {
  return (
    <>
      <PageHero
        eyebrow="Yhteystiedot"
        title="Kerro projektistasi. Vastaamme 24 tunnissa."
        description="Täytä lomake tai ota yhteyttä suoraan. Maksuton kartoituspuhelu, kirjallinen tarjous 48 tunnissa."
      />

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display font-bold text-ink text-2xl mb-6">Yhteystiedot</h2>
                <div className="space-y-4">
                  {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-copper/10 flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-copper" />
                      </div>
                      <div>
                        <p className="text-xs text-ink-ghost uppercase tracking-wider mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-ink hover:text-copper transition-colors font-medium text-sm">
                            {value}
                          </a>
                        ) : (
                          <p className="text-ink font-medium text-sm">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-elevated border border-wire">
                <h3 className="font-heading font-semibold text-ink mb-3 text-sm">Miten se etenee?</h3>
                <ol className="space-y-2.5">
                  {[
                    "Täytät lomakkeen tai soitat",
                    "Sovimme 30 min maksuttoman puhelun",
                    "Saat kirjallisen tarjouksen 48 h",
                    "Aloitetaan kun sinulle sopii",
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5 text-sm text-ink-dim">
                      <span className="w-5 h-5 rounded-full bg-copper/15 text-copper text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="lg:col-span-3">
              <Suspense>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

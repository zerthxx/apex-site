import type { Metadata } from "next";
import { HinnoitteluContent } from "./HinnoitteluContent";

export const metadata: Metadata = {
  title: "Hinnoittelu — Verkkosivut, verkkokaupat, mobiilisovellukset ja AI",
  description:
    "Selkeä, läpinäkyvä hinnoittelu. Verkkosivut alkaen 3 000 €, verkkokaupat 6 000 €, mobiilisovellukset 15 000 €. Ilmainen tarjouspyyntö.",
  alternates: { canonical: "https://apexsite.fi/hinnoittelu" },
};

export default function HinnoitteluPage() {
  return <HinnoitteluContent />;
}

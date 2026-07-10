import type { Metadata } from "next";
import { PalautaSahkopostiClient } from "./PalautaSahkopostiClient";

export const metadata: Metadata = {
  title: "Palauta sähköposti — Apex Site",
  robots: { index: false, follow: false },
};

export default function PalautaSahkopostiPage() {
  return <PalautaSahkopostiClient />;
}

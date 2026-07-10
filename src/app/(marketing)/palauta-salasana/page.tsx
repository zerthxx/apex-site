import type { Metadata } from "next";
import { PalautaSalasanaClient } from "./PalautaSalasanaClient";

export const metadata: Metadata = {
  title: "Palauta salasana — Apex Site",
  robots: { index: false, follow: false },
};

export default function PalautaSalasanaPage() {
  return <PalautaSalasanaClient />;
}

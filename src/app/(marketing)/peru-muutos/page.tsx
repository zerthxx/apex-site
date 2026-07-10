import type { Metadata } from "next";
import { PeruMuutosClient } from "./PeruMuutosClient";

export const metadata: Metadata = {
  title: "Peru muutos — Apex Site",
  robots: { index: false, follow: false },
};

export default async function PeruMuutosPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PeruMuutosClient token={token ?? ""} />;
}

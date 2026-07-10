import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Tili lukittu — Apex Site",
  robots: { index: false, follow: false },
};

export default async function TiliLukittuPage({
  searchParams,
}: {
  searchParams: Promise<{ syy?: string }>;
}) {
  const { syy } = await searchParams;
  const suspended = syy === "jaadytetty";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-md w-full rounded-2xl bg-surface border border-wire p-8 flex flex-col items-center gap-5 text-center">
        <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <Lock size={24} className="text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink">
            {suspended ? "Tilisi on jäädytetty" : "Tilisi on lukittu"}
          </h1>
          <p className="text-sm text-ink-ghost mt-2 leading-relaxed">
            {suspended
              ? "Tilisi käyttö on toistaiseksi estetty. Jos uskot tämän olevan virhe, ota yhteyttä Apex-tukeen."
              : "Tilisi on lukittu turvallisuussyistä. Tilin avaaminen onnistuu vain Apex-tuen kautta."}
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Link
            href="/yhteystiedot"
            className="w-full py-3 rounded-xl bg-copper text-[#0A0C10] font-semibold text-sm hover:bg-copper-light transition-colors"
          >
            Ota yhteyttä tukeen
          </Link>
          <a
            href="mailto:info@apexsite.fi"
            className="w-full py-3 rounded-xl bg-surface border border-wire text-ink text-sm font-medium hover:border-copper/40 transition-colors flex items-center justify-center gap-2"
          >
            <Mail size={15} className="text-copper" />
            info@apexsite.fi
          </a>
        </div>
      </div>
    </div>
  );
}

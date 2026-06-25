import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="font-display font-bold text-[120px] sm:text-[160px] leading-none text-copper/10 select-none">
          404
        </div>
        <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl -mt-6 mb-4">
          Sivua ei löydy
        </h1>
        <p className="text-ink-dim leading-relaxed mb-8">
          Etsimäsi sivu on siirretty tai poistettu. Tarkista osoite tai palaa etusivulle.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper text-ink-flip font-medium text-sm hover:bg-copper-light transition-colors"
          >
            <ArrowLeft size={15} /> Takaisin etusivulle
          </Link>
          <Link
            href="/yhteystiedot"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-wire text-ink-dim text-sm hover:text-ink hover:border-copper/40 transition-colors"
          >
            Ota yhteyttä
          </Link>
        </div>
      </div>
    </div>
  );
}

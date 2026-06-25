"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="font-display font-bold text-[120px] sm:text-[160px] leading-none text-bad/10 select-none">
          500
        </div>
        <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl -mt-6 mb-4">
          Jotain meni pieleen
        </h1>
        <p className="text-ink-dim leading-relaxed mb-8">
          Tapahtui odottamaton virhe. Yritä ladata sivu uudelleen tai ota yhteyttä jos ongelma jatkuu.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper text-ink-flip font-medium text-sm hover:bg-copper-light transition-colors"
          >
            <RefreshCw size={15} /> Yritä uudelleen
          </button>
          <a
            href="/yhteystiedot"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-wire text-ink-dim text-sm hover:text-ink hover:border-copper/40 transition-colors"
          >
            Ota yhteyttä
          </a>
        </div>
      </div>
    </div>
  );
}

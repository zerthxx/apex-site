"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const QUOTE_GATE_EVENT = "open-quote-gate";

/** Tags a /yhteystiedot href so the API knows this submission came from a gated quote CTA. */
export function withQuoteIntent(href: string): string {
  const [path, query = ""] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("intent", "quote");
  return `${path}?${params.toString()}`;
}

export function useQuoteGate() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const requestQuote = useCallback(
    (href: string) => {
      const target = withQuoteIntent(href);
      if (user) {
        router.push(target);
        return;
      }
      window.dispatchEvent(
        new CustomEvent(QUOTE_GATE_EVENT, { detail: { redirectTo: target } }),
      );
    },
    [user, router],
  );

  return { user, requestQuote };
}

"use client";

import Link from "next/link";
import { forwardRef } from "react";
import { useQuoteGate } from "@/hooks/useQuoteGate";

type NextLinkProps = React.ComponentProps<typeof Link>;

/**
 * Drop-in replacement for next/link used on every "Pyydä tarjous" CTA.
 * Authenticated users navigate through as normal; guests are intercepted
 * and shown the login/register gate instead (see QuoteGateModal).
 */
export const RequestQuoteLink = forwardRef<HTMLAnchorElement, NextLinkProps>(
  function RequestQuoteLink({ href, onClick, ...rest }, ref) {
    const { user, requestQuote } = useQuoteGate();

    function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (user) return;
      e.preventDefault();
      const target =
        typeof href === "string" ? href : (href.pathname ?? "/yhteystiedot");
      requestQuote(target);
    }

    return <Link ref={ref} href={href} onClick={handleClick} {...rest} />;
  },
);

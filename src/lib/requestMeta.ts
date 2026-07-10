/**
 * Request metadata helpers shared by the account-security routes:
 * client IP, device hint, approximate location and a same-origin (CSRF) check.
 */

export function getClientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export function getUserAgent(req: Request): string | null {
  return req.headers.get("user-agent");
}

/** "Chrome — Windows" -style summary parsed from the User-Agent. */
export function deviceHint(userAgent: string | null): string {
  if (!userAgent) return "Tuntematon laite";
  const ua = userAgent;

  let browser = "Tuntematon selain";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
  else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "tuntematon käyttöjärjestelmä";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac OS X|Macintosh/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return `${browser} — ${os}`;
}

/**
 * Approximate location from Vercel geo headers when deployed there;
 * null elsewhere (we deliberately do not call external geo-IP services).
 */
export function approxLocation(req: Request): string | null {
  const city = req.headers.get("x-vercel-ip-city");
  const country = req.headers.get("x-vercel-ip-country");
  if (!city && !country) return null;
  const decodedCity = city ? decodeURIComponent(city) : null;
  return [decodedCity, country].filter(Boolean).join(", ");
}

/**
 * CSRF guard for state-changing endpoints: when the browser sends an Origin
 * header it must match the request host. Requests without an Origin header
 * (non-browser clients, some same-origin GETs) are allowed — cookies-based
 * CSRF requires a browser, and browsers always send Origin on cross-site
 * POSTs.
 */
export function sameOriginOk(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

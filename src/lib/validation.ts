import { z } from "zod";

/**
 * Shared form validation for the Settings area — used by BOTH the client
 * forms (inline errors before save) and the API routes (the authoritative
 * check; frontend validation is never trusted alone).
 *
 * All messages in Finnish per project convention.
 */

// Letters (incl. å/ä/ö and other unicode letters), spaces, hyphens, apostrophes.
const NAME_RE = /^\p{L}[\p{L}' \-]{0,49}$/u;
const CITY_RE = /^\p{L}[\p{L} \-]{1,49}$/u;
const FI_POSTAL_RE = /^\d{5}$/;

/**
 * Finnish Business ID (Y-tunnus) with checksum: NNNNNNN-T where T is the
 * check digit computed with weights 7,9,10,5,8,4,2 mod 11 (remainder 1 is
 * an invalid ID; remainder 0 means check digit 0; otherwise 11 - remainder).
 */
export function isValidYTunnus(input: string): boolean {
  const m = input.trim().match(/^(\d{7})-(\d)$/);
  if (!m) return false;
  const digits = m[1].split("").map(Number);
  const check = Number(m[2]);
  const weights = [7, 9, 10, 5, 8, 4, 2];
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const mod = sum % 11;
  if (mod === 1) return false;
  return check === (mod === 0 ? 0 : 11 - mod);
}

/** Empty string allowed; otherwise the given schema must pass. */
function optionalField(schema: z.ZodType<string>) {
  return z.union([z.literal(""), schema]);
}

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Etunimi vaaditaan.")
    .max(50, "Etunimi on liian pitkä.")
    .regex(NAME_RE, "Etunimi voi sisältää vain kirjaimia."),
  lastName: z
    .string()
    .trim()
    .min(1, "Sukunimi vaaditaan.")
    .max(50, "Sukunimi on liian pitkä.")
    .regex(NAME_RE, "Sukunimi voi sisältää vain kirjaimia."),
  address: optionalField(
    z
      .string()
      .trim()
      .min(3, "Osoite on liian lyhyt.")
      .max(120, "Osoite on liian pitkä."),
  ),
  postalCode: optionalField(
    z
      .string()
      .trim()
      .regex(FI_POSTAL_RE, "Postinumero on 5 numeroa (esim. 00100)."),
  ),
  city: optionalField(
    z.string().trim().regex(CITY_RE, "Kaupunki voi sisältää vain kirjaimia."),
  ),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const companySchema = z.object({
  company_name: optionalField(
    z
      .string()
      .trim()
      .min(2, "Nimi on liian lyhyt.")
      .max(120, "Nimi on liian pitkä."),
  ),
  y_tunnus: optionalField(
    z
      .string()
      .trim()
      .refine(
        isValidYTunnus,
        "Virheellinen Y-tunnus — tarkista muoto 1234567-8.",
      ),
  ),
  toimiala: optionalField(
    z.string().trim().max(100, "Toimiala on liian pitkä."),
  ),
  lisatiedot: z
    .string()
    .trim()
    .max(5000, "Lisätiedot on liian pitkä (max 5000 merkkiä)."),
});

export type CompanyInput = z.infer<typeof companySchema>;

/** Flattens a Zod error into { fieldName: firstMessage } for inline display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

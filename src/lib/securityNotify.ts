import type { SupabaseClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/constants";
import { securityAlertHtml, sendEmail } from "@/lib/emails";
import { isSmsConfigured, sendSms } from "@/lib/sms";
import {
  approxLocation,
  deviceHint,
  getClientIp,
  getUserAgent,
} from "@/lib/requestMeta";

/**
 * Security notifications fired whenever a sensitive account attribute changes.
 * Sends (best effort, never throws):
 *  - a branded email to the OLD address (or current, if unchanged)
 *  - an SMS to the OLD verified phone when Twilio is configured
 *  - an in-app notification (notifications: type 'system', title/body/href)
 *
 * Notify-before-replace: callers pass the pre-change contact points so a
 * hijacked account still alerts its real owner, optionally with a revert link.
 */

export type SecurityEvent =
  | "password_changed"
  | "password_reset"
  | "email_changed"
  | "phone_changed"
  | "email_change_requested"
  | "phone_change_requested"
  | "change_reverted"
  | "account_locked"
  | "force_password_reset";

const EVENT_COPY: Record<
  SecurityEvent,
  { title: string; body: string; smsBody: string }
> = {
  password_changed: {
    title: "Salasanasi vaihdettiin",
    body: "Tilisi salasana vaihdettiin juuri.",
    smsBody: "ApexSite: tilisi salasana vaihdettiin juuri.",
  },
  password_reset: {
    title: "Salasanasi palautettiin",
    body: "Tilisi salasana asetettiin uudelleen palautuksen kautta.",
    smsBody: "ApexSite: tilisi salasana palautettiin juuri.",
  },
  email_changed: {
    title: "Sähköpostiosoitteesi vaihdettiin",
    body: "Tilisi sähköpostiosoite vaihdettiin juuri.",
    smsBody: "ApexSite: tilisi sähköpostiosoite vaihdettiin juuri.",
  },
  phone_changed: {
    title: "Puhelinnumerosi vaihdettiin",
    body: "Tilisi puhelinnumero vaihdettiin juuri.",
    smsBody: "ApexSite: tilisi puhelinnumero vaihdettiin juuri.",
  },
  email_change_requested: {
    title: "Sähköpostin vaihtoa pyydettiin",
    body: "Tilillesi pyydettiin sähköpostiosoitteen vaihtoa. Vanha osoitteesi pysyy voimassa, kunnes uusi on vahvistettu.",
    smsBody: "ApexSite: tilillesi pyydettiin sähköpostin vaihtoa.",
  },
  phone_change_requested: {
    title: "Puhelinnumeron vaihtoa pyydettiin",
    body: "Tilillesi pyydettiin puhelinnumeron vaihtoa. Vanha numerosi pysyy voimassa, kunnes uusi on vahvistettu.",
    smsBody: "ApexSite: tilillesi pyydettiin puhelinnumeron vaihtoa.",
  },
  change_reverted: {
    title: "Muutos peruttiin",
    body: "Tilillesi tehty yhteystiedon muutos peruttiin palautuslinkin kautta, ja kaikki istunnot kirjattiin ulos.",
    smsBody:
      "ApexSite: tilillesi tehty muutos peruttiin ja istunnot kirjattiin ulos.",
  },
  account_locked: {
    title: "Tilisi on lukittu",
    body: "Tilisi lukittiin turvallisuussyistä. Ota yhteyttä tukeen avataksesi tilin.",
    smsBody:
      "ApexSite: tilisi on lukittu turvallisuussyistä. Ota yhteyttä tukeen.",
  },
  force_password_reset: {
    title: "Salasanan vaihto vaaditaan",
    body: "Ylläpito on määrännyt tilillesi pakollisen salasanan vaihdon. Sinut on kirjattu ulos kaikilta laitteilta.",
    smsBody:
      "ApexSite: tilillesi vaaditaan salasanan vaihto. Kirjaudu sisään ja vaihda salasanasi.",
  },
};

export async function sendSecurityNotification(
  admin: SupabaseClient,
  opts: {
    userId: string;
    event: SecurityEvent;
    emailTo?: string | null;
    smsTo?: string | null;
    req?: Request;
    /** Extra context line, e.g. "Uusi sähköposti: ma•••@ex•••.com" */
    detail?: string;
    /** Change-revert link included in the email sent to the OLD contact. */
    revertUrl?: string;
  },
): Promise<void> {
  const copy = EVENT_COPY[opts.event];
  const now = new Date().toLocaleString("fi-FI", {
    timeZone: "Europe/Helsinki",
  });

  const ip = opts.req ? getClientIp(opts.req) : null;
  const device = opts.req ? deviceHint(getUserAgent(opts.req)) : null;
  const location = opts.req ? approxLocation(opts.req) : null;

  const facts: { label: string; value: string }[] = [
    { label: "Aika", value: now },
  ];
  if (ip) facts.push({ label: "IP-osoite", value: ip });
  if (device) facts.push({ label: "Laite", value: device });
  if (location) facts.push({ label: "Sijainti (arvio)", value: location });
  if (opts.detail) facts.push({ label: "Muutos", value: opts.detail });

  const jobs: Promise<unknown>[] = [];

  if (opts.emailTo) {
    const [copper, ...rest] = copy.title.split(" ");
    jobs.push(
      sendEmail(
        opts.emailTo,
        `${copy.title} — Apex Site`,
        securityAlertHtml({
          headingCopper: copper,
          headingRest: rest.join(" "),
          intro: copy.body,
          facts,
          ctaLabel: opts.revertUrl ? "Peru muutos ja suojaa tili" : undefined,
          ctaUrl: opts.revertUrl,
        }),
      ),
    );
  }

  if (opts.smsTo && isSmsConfigured()) {
    const smsText = opts.revertUrl
      ? `${copy.smsBody} Jos tämä et ollut sinä, peru muutos: ${opts.revertUrl}`
      : `${copy.smsBody} Jos tämä et ollut sinä, ota yhteyttä: ${SITE_URL}/yhteystiedot`;
    jobs.push(sendSms(opts.smsTo, smsText));
  }

  jobs.push(
    Promise.resolve(
      admin.from("notifications").insert({
        user_id: opts.userId,
        type: "system",
        title: copy.title,
        body: `${copy.body} Aika: ${now}.${opts.detail ? ` ${opts.detail}.` : ""} Jos tämä et ollut sinä, ota heti yhteyttä tukeen.`,
        href: "/asetukset/turvallisuus",
      }),
    ),
  );

  // Best effort: notification failures must never break the security action itself.
  await Promise.allSettled(jobs);
}

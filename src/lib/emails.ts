import { Resend } from "resend";

/**
 * Shared transactional email templates (Apex brand, dark theme) + a Resend
 * send wrapper. The code-email layout matches the original /api/otp/send
 * design; that route now renders through this module instead of its own copy.
 */

const FROM = "Apex Site <noreply@apexsite.fi>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("Resend send failed:", error);
      return { ok: false, error: "Sähköpostin lähetys epäonnistui" };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend request error:", err);
    return { ok: false, error: "Sähköpostin lähetys epäonnistui" };
  }
}

function shell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="fi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060810;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060810;min-height:100%;">
<tr><td align="center" style="padding:48px 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:linear-gradient(160deg,#0e1420 0%,#060810 60%);border:1px solid #1e2535;border-radius:20px;overflow:hidden;">

  <tr><td align="center" style="padding:36px 32px 20px;">
    <img src="https://apexsite.fi/icon.png" alt="Apex Site" width="320" style="display:block;margin:0 auto 16px;width:320px;max-width:100%;" />
    <div style="font-size:32px;font-weight:900;font-family:sans-serif;letter-spacing:-0.5px;">
      <span style="color:#C8813A;">Apex</span><span style="color:#F0EEE8;">Site</span>
    </div>
  </td></tr>

  ${inner}

  <tr><td style="padding:0 28px 20px;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#1e2535,transparent);"></div>
  </td></tr>

  <tr><td align="center" style="padding:0 28px 12px;">
    <div style="font-size:16px;font-weight:900;font-family:sans-serif;">
      <span style="color:#C8813A;">Apex</span><span style="color:#F0EEE8;">Site</span>
    </div>
    <p style="margin:4px 0 0;color:#5E5C58;font-size:11px;font-family:sans-serif;">Modernit verkkosivut yrityksille</p>
  </td></tr>
  <tr><td align="center" style="padding:0 28px 32px;">
    <p style="margin:0;color:#3a3a4a;font-size:10px;font-family:sans-serif;line-height:1.5;">
      🛡&nbsp; Jos et pyytänyt tätä sähköpostia,<br>voit jättää tämän viestin huomiotta.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function heading(copper: string, rest: string): string {
  return `
  <tr><td align="center" style="padding:0 32px 6px;">
    <h1 style="margin:0;font-size:22px;font-weight:800;font-family:sans-serif;line-height:1.3;">
      <span style="color:#C8813A;">${copper}</span>
      <span style="color:#F0EEE8;"> ${rest}</span>
    </h1>
  </td></tr>
  <tr><td align="center" style="padding-bottom:20px;">
    <div style="width:40px;height:2px;background:linear-gradient(90deg,#C8813A,#2ABFBF);margin:0 auto;border-radius:2px;"></div>
  </td></tr>`;
}

export function codeEmailHtml(opts: {
  headingCopper: string;
  headingRest: string;
  intro: string;
  code: string;
  expiresMinutes?: number;
}): string {
  const expires = opts.expiresMinutes ?? 10;
  return shell(`
  ${heading(opts.headingCopper, opts.headingRest)}

  <tr><td align="center" style="padding:0 36px 28px;">
    <p style="margin:0;color:#A8A49C;font-size:14px;line-height:1.7;font-family:sans-serif;text-align:left;">
      <strong style="color:#F0EEE8;">Hei!</strong><br>
      ${opts.intro}<br>
      Syötä alla oleva 6-numeroinen vahvistuskoodi jatkaaksesi.
    </p>
  </td></tr>

  <tr><td align="center" style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e18;border:1.5px solid #2ABFBF55;border-radius:14px;">
      <tr><td align="center" style="padding:20px 24px 8px;">
        <div style="width:36px;height:36px;border:2px solid #2ABFBF;border-radius:8px;margin:0 auto 10px;line-height:36px;text-align:center;">
          <span style="color:#2ABFBF;font-size:16px;">✓</span>
        </div>
        <p style="margin:0 0 14px;color:#A8A49C;font-size:10px;letter-spacing:3px;font-family:sans-serif;font-weight:700;">VAHVISTUSKOODI</p>
      </td></tr>
      <tr><td align="center" style="padding:0 16px 20px;">
        <table cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:6px;">
          <tr>
            ${opts.code
              .split("")
              .map(
                (d) =>
                  `<td align="center" style="width:48px;height:58px;background:#10141C;border:1.5px solid #C8813A66;border-radius:10px;font-size:28px;font-weight:900;color:#F0EEE8;font-family:monospace;">${d}</td>`,
              )
              .join("")}
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding:0 28px 28px;">
    <p style="margin:0;color:#5E5C58;font-size:12px;font-family:sans-serif;">
      ⏱&nbsp; Koodi vanhenee <span style="color:#2ABFBF;font-weight:600;">${expires} minuutissa</span>.
    </p>
  </td></tr>`);
}

export function securityAlertHtml(opts: {
  headingCopper: string;
  headingRest: string;
  intro: string;
  facts: { label: string; value: string }[];
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const factRows = opts.facts
    .map(
      (f) => `
      <tr>
        <td style="padding:6px 0;color:#5E5C58;font-size:12px;font-family:sans-serif;white-space:nowrap;vertical-align:top;padding-right:16px;">${f.label}</td>
        <td style="padding:6px 0;color:#F0EEE8;font-size:12px;font-family:sans-serif;">${f.value}</td>
      </tr>`,
    )
    .join("");

  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `
  <tr><td align="center" style="padding:0 28px 24px;">
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr><td align="center" style="border-radius:12px;background:linear-gradient(135deg,#E8A020,#2ABFBF);">
        <a href="${opts.ctaUrl}" style="display:block;padding:14px 32px;color:#060810;font-size:15px;font-weight:800;font-family:sans-serif;text-decoration:none;">
          ${opts.ctaLabel}
        </a>
      </td></tr>
    </table>
  </td></tr>`
      : "";

  return shell(`
  ${heading(opts.headingCopper, opts.headingRest)}

  <tr><td align="center" style="padding:0 36px 20px;">
    <p style="margin:0;color:#A8A49C;font-size:14px;line-height:1.7;font-family:sans-serif;text-align:left;">
      ${opts.intro}
    </p>
  </td></tr>

  <tr><td style="padding:0 28px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e18;border:1.5px solid #C8813A44;border-radius:14px;">
      <tr><td style="padding:16px 20px;">
        <table cellpadding="0" cellspacing="0" width="100%">${factRows}</table>
      </td></tr>
    </table>
  </td></tr>

  ${cta}

  <tr><td align="center" style="padding:0 36px 28px;">
    <p style="margin:0;color:#A8A49C;font-size:12px;line-height:1.7;font-family:sans-serif;">
      Jos tämä et ollut sinä, ota <strong style="color:#F0EEE8;">heti</strong> yhteyttä Apex-tukeen:<br>
      <a href="https://apexsite.fi/yhteystiedot" style="color:#2ABFBF;text-decoration:none;">apexsite.fi/yhteystiedot</a>
      &nbsp;·&nbsp;
      <a href="mailto:info@apexsite.fi" style="color:#2ABFBF;text-decoration:none;">info@apexsite.fi</a>
    </p>
  </td></tr>`);
}

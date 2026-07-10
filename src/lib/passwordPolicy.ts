/**
 * Server-side password policy — mirrors the client-side strength meter in
 * /asetukset/turvallisuus so the API enforces what the UI shows (score ≥ 3/5,
 * minimum 8 characters).
 */
export function passwordStrengthScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

export function passwordPolicyError(pw: string): string | null {
  if (pw.length < 8) return "Salasanan on oltava vähintään 8 merkkiä.";
  if (pw.length > 128) return "Salasana on liian pitkä.";
  if (passwordStrengthScore(pw) < 3) return "Salasana on liian heikko.";
  return null;
}

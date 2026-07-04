# Landing Page Template

Read `.claude/templates/_foundations.md` first — this file covers a marketing/conversion-focused landing page. This is the lightest archetype: most of the foundations baseline (Supabase, auth, RLS, migrations) may not apply at all if the page has no backend beyond a contact form.

## Recommended architecture

- Static/server-rendered marketing page — no client-side auth, no dashboard. If the only backend need is "receive a form submission," a single `/api/contact` route handler is likely the entire server-side surface.
- Content lives in Sanity (if it changes often — copy, testimonials, pricing) or directly in code (if it's genuinely static and changes rarely) — don't wire up a CMS for content that changes once a quarter.
- Optimize for Core Web Vitals from the start: this archetype is judged heavily on load speed and conversion, more than any other in this set.

## Folder structure

```
src/app/(marketing)/
├── page.tsx                the landing page itself
├── hinnoittelu/ (pricing)   if applicable
├── ukk/ (FAQ)               if applicable
src/components/sections/     one component per page section (hero, features, testimonials, pricing, CTA, FAQ)
src/app/api/contact/          the one likely backend route: lead capture
```

## Tech stack additions

- None beyond baseline, typically. Framer Motion for scroll/entrance animation, `@vercel/og` for social-share preview images, Sanity only if content needs non-developer editing.

## Database design

- Often none at all. If lead capture persists submissions (rather than just emailing them via Resend), a single `leads`/`contact_submissions` table suffices — see the `crm.md` template if this page is meant to feed a real pipeline rather than just notify someone by email.

## Authentication

- None, typically. If the page has any authenticated area at all (e.g., a client login), that's a strong signal this is actually a `saas.md`/`dashboard.md` project with a landing page attached, not a landing-page project — don't force this template past its scope.

## API structure

- `POST /api/contact` — validate input (Zod), send via Resend and/or persist to a `leads` table, rate-limit to prevent spam submission floods. That's typically the entire API surface.

## UI components

- Hero, feature/benefit sections, social proof (testimonials/logos), pricing (if applicable), FAQ, footer with contact/CTA.
- A single, consistent primary call-to-action repeated at natural scroll points — not a different CTA per section.
- Every image optimized (`next/image`), especially the hero image/video, since it's the largest asset on the page users wait for.
- Mobile-first responsive layout — landing page traffic is disproportionately mobile.

## Security checklist

- [ ] Contact form input is validated server-side (Zod) and rate-limited — this is the one write path an anonymous visitor can hit.
- [ ] No secrets (API keys, Resend/Sanity tokens) are exposed in client-side bundles or public env vars.
- [ ] Any embedded third-party script (analytics, chat widget) is reviewed for what data it collects before adding it.

## Performance checklist

- [ ] Largest Contentful Paint element (usually the hero image/video) is optimized and preloaded if above the fold.
- [ ] No render-blocking third-party scripts loaded synchronously in `<head>` — defer/async or load after interaction.
- [ ] Fonts are optimized (`next/font`), not loaded via a render-blocking external `<link>`.
- [ ] Lighthouse/PageSpeed score checked before launch, not assumed.

## Deployment checklist

Run `/deploy` (build/lint/typecheck still apply even without a backend), plus:
- [ ] Contact form actually delivers a real email/Slack notification/lead row in production, tested end-to-end, not just in dev.
- [ ] OG/social-share preview image renders correctly when the URL is shared (test in an actual link-preview tool, not just visually).
- [ ] Analytics/conversion tracking (if used) fires correctly in production.

## Development phases

1. **Structure & copy**: section layout, real copy (not lorem ipsum — conversion copy is most of this archetype's value). → `/frontend`
2. **Visual polish**: imagery, animation, responsive refinement across breakpoints.
3. **Conversion path**: contact form / CTA wiring, email delivery, analytics.
4. **Performance pass**: Core Web Vitals, image/font optimization, third-party script audit.
5. **Hardening**: `/security` (form validation/rate-limiting), `/deploy`.

## Best practices

- Don't add a database, auth, or dashboard scaffolding "just in case" — if this page grows into a full product, migrate to `saas.md`/`dashboard.md` deliberately at that point, don't pre-build for it now.
- Treat load performance as a first-class requirement, not a final polish step — it directly affects conversion.
- Keep the CTA singular and consistent; a landing page selling five different actions converts worse than one selling one clearly.

# Portfolio Template

Read `.claude/templates/_foundations.md` first. This archetype sits between `landing-page.md` (single conversion-focused page) and a full CMS-driven content site — a portfolio's core value is a browsable collection of work (case studies, projects) rather than a single pitch. This workspace's own marketing site already has a working example of this pattern: `(marketing)/portfolio` + `(marketing)/blogi`, backed by Sanity `caseStudy`/`blogPost` schemas.

## Recommended architecture

- Content-driven: case studies/projects/posts live in Sanity (this workspace's existing CMS choice) as structured documents, not hardcoded in JSX — the whole point is that new work gets added without a code change.
- Listing page + detail page pattern: `/portfolio` (or `/work`) lists items with filtering (by category/tag/service), `/portfolio/[slug]` renders one case study in full.
- No auth, no dashboard — same as `landing-page.md`, this is a public content site.

## Folder structure

```
src/app/(marketing)/
├── portfolio/page.tsx           listing, with category/tag filters
├── portfolio/[slug]/page.tsx     case study detail
├── blogi/[slug]/page.tsx         if a blog/writing section is included
sanity/schemas/
├── caseStudy.ts                  title, client, category, cover image, body (rich text/blocks), results/metrics
├── teamMember.ts                 if an "about"/team section is included
```

## Tech stack additions

- Sanity Studio (already the project's CMS choice) mounted at `/studio` — reuse existing schema conventions (`blogPost`, `caseStudy`, `teamMember`, `siteSettings`) rather than inventing a parallel content model.
- `next-sanity`/`@sanity/image-url` for querying and rendering optimized images from Sanity's CDN.

## Database design

- Typically none in Postgres — content lives entirely in Sanity, not Supabase. Only introduce a Postgres table if the portfolio needs something Sanity doesn't model well (e.g., a contact-form lead table — see `landing-page.md`'s API structure for that piece).

## Authentication

- None for the public site. If Sanity Studio access needs restricting beyond Sanity's own project-member permissions, that's configured in Sanity's own access control, not this app's auth system.

## API structure

- None typically required beyond a contact endpoint (per `landing-page.md`) — content is fetched server-side directly from Sanity in the page's Server Component, not through an intermediate API route.

## UI components

- Case-study/project card (thumbnail, title, category tag) for the listing grid.
- Case-study detail template: cover image, client/context, the work itself (images/video), results/metrics, next-project navigation.
- Category/tag filter control on the listing page.
- "About"/team section if the portfolio represents a studio/agency rather than an individual.

## Security checklist

- [ ] Sanity API tokens (if server-side mutations are used, e.g. a preview mode) are never exposed client-side; read-only public content uses the public/unauthenticated Sanity client.
- [ ] Any contact form follows the same validation/rate-limiting as `landing-page.md`.
- [ ] Draft/unpublished Sanity content is not queryable by the public client (use the published dataset, not a preview token, for the public site).

## Performance checklist

- [ ] Case-study images are served through Sanity's image CDN with explicit sizing (`@sanity/image-url` + `next/image`), not full-resolution originals.
- [ ] Listing page paginates or lazy-loads if the number of case studies grows large.
- [ ] Rich-text/portable-text content renders without layout shift (reserve space for embedded images).

## Deployment checklist

Run `/deploy`, plus:
- [ ] Sanity production dataset is the one the deployed site actually queries (not a dev/staging dataset).
- [ ] Sanity webhook-triggered revalidation (if using ISR/on-demand revalidation) is configured so new content appears without a full redeploy.

## Development phases

1. **Content model**: define the Sanity schema for case studies (and posts/team, if included). → `database-engineer`-equivalent thinking applied to Sanity schema design, or just `software-architect` for the content model
2. **Listing & detail pages**: build the two core templates against the schema. → `/frontend`
3. **Filtering & navigation**: category/tag filters, next-project navigation, related-work suggestions.
4. **Performance pass**: image optimization, pagination/lazy-loading.
5. **Hardening**: `/security` (Sanity token handling, draft-content exposure), `/deploy`.

## Best practices

- Model content in the CMS, not in code — a portfolio's value compounds by how easy it is to add new work, not by how polished the first three entries are.
- Reuse this workspace's existing Sanity schema conventions rather than starting a parallel content model if this portfolio lives alongside the existing marketing site.
- Keep the detail-page template consistent across all case studies; visual consistency matters more here than per-project customization.

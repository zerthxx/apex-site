import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getCaseStudyBySlug, getCaseStudySlugs } from "@/lib/sanity/fetch";
import { ContactCtaSection } from "@/components/sections/ContactCtaSection";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) return {};
  return {
    title: `${study.title} — Referenssi`,
    description: study.seo?.description ?? study.brief?.slice(0, 160),
    alternates: { canonical: `https://apexsite.fi/portfolio/${slug}` },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = await getCaseStudyBySlug(slug);
  if (!study) notFound();

  return (
    <>
      <div className="pt-28 pb-8 bg-surface/30 border-b border-wire">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink transition-colors mb-6">
            <ArrowLeft size={14} /> Takaisin portfolioon
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-copper">{study.service}</span>
              <h1 className="font-display font-bold text-ink text-4xl sm:text-5xl mt-2 mb-3">{study.title}</h1>
              <p className="text-ink-dim">{study.client}</p>
            </div>
            {study.projectUrl && (
              <a href={study.projectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-copper/10 text-copper text-sm font-medium hover:bg-copper/20 transition-colors">
                Katso projekti <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              {study.brief && (
                <div>
                  <h2 className="font-display font-bold text-ink text-2xl mb-4">Toimeksianto</h2>
                  <p className="text-ink-dim leading-relaxed">{study.brief}</p>
                </div>
              )}

              {study.results && study.results.length > 0 && (
                <div>
                  <h2 className="font-display font-bold text-ink text-2xl mb-6">Tulokset</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {study.results.map((r: { label: string; value: string; description?: string }) => (
                      <div key={r.label} className="p-4 rounded-xl bg-elevated border border-wire text-center">
                        <div className="font-display font-bold text-copper text-2xl mb-1">{r.value}</div>
                        <div className="text-ink text-sm font-medium">{r.label}</div>
                        {r.description && <div className="text-ink-ghost text-xs mt-1">{r.description}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {study.technologies && study.technologies.length > 0 && (
                <div className="p-5 rounded-xl bg-elevated border border-wire">
                  <h3 className="font-heading font-semibold text-ink mb-3 text-sm">Teknologiat</h3>
                  <div className="flex flex-wrap gap-2">
                    {study.technologies.map((t: string) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-subtle border border-wire text-ink-dim">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {study.testimonial?.quote && (
                <div className="p-5 rounded-xl bg-copper/5 border border-copper/20">
                  <p className="text-ink-dim text-sm italic leading-relaxed mb-3">"{study.testimonial.quote}"</p>
                  <div className="text-sm">
                    <span className="text-ink font-medium">{study.testimonial.author}</span>
                    {study.testimonial.role && <span className="text-ink-ghost"> · {study.testimonial.role}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ContactCtaSection />
    </>
  );
}

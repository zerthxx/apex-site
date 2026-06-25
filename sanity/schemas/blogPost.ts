import { defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons";

export default defineType({
  name: "blogPost",
  title: "Blogiartikkeli",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: "title", title: "Otsikko", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Tiivistelmä",
      type: "text",
      rows: 3,
      description: "Max 200 merkkiä",
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "coverImage",
      title: "Kansi kuva",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt-teksti", type: "string", validation: (Rule) => Rule.required() })],
    }),
    defineField({
      name: "body",
      title: "Sisältö",
      type: "array",
      of: [
        { type: "block", styles: [
          { title: "Normal", value: "normal" },
          { title: "H2", value: "h2" },
          { title: "H3", value: "h3" },
          { title: "H4", value: "h4" },
          { title: "Quote", value: "blockquote" },
        ]},
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt-teksti", type: "string" })],
        },
        {
          type: "code",
          options: { language: "javascript", languageAlternatives: [
            { title: "JavaScript", value: "javascript" },
            { title: "TypeScript", value: "typescript" },
            { title: "Python", value: "python" },
            { title: "Bash", value: "bash" },
          ]},
        },
      ],
    }),
    defineField({
      name: "author",
      title: "Kirjoittaja",
      type: "reference",
      to: [{ type: "teamMember" }],
    }),
    defineField({ name: "publishedAt", title: "Julkaisupäivä", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({
      name: "categories",
      title: "Kategoriat",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({ name: "featured", title: "Nosta etusivulle", type: "boolean", initialValue: false }),
    defineField({ name: "seo", title: "SEO", type: "seoFields" }),
  ],
  orderings: [{ title: "Julkaisupäivä (uusin ensin)", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? new Date(subtitle).toLocaleDateString("fi-FI") : "Ei julkaisupäivää", media };
    },
  },
});

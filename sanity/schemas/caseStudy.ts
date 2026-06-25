import { defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons";

export default defineType({
  name: "caseStudy",
  title: "Referenssi",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({ name: "title", title: "Otsikko", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "client", title: "Asiakas", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "service",
      title: "Palvelu",
      type: "string",
      options: {
        list: [
          { title: "Verkkosivut", value: "Verkkosivut" },
          { title: "Verkkokauppa", value: "Verkkokauppa" },
          { title: "Mobiilisovellus", value: "Mobiilisovellus" },
          { title: "AI-ratkaisu", value: "AI-ratkaisu" },
          { title: "Ohjelmisto", value: "Ohjelmisto" },
          { title: "Digitaalinen tuote", value: "Digitaalinen tuote" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Kansikuva",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt-teksti", type: "string", validation: (Rule) => Rule.required() })],
    }),
    defineField({
      name: "gallery",
      title: "Kuvagalleria",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alt-teksti", type: "string" })] }],
    }),
    defineField({ name: "brief", title: "Toimeksianto", type: "text", rows: 4 }),
    defineField({
      name: "solution",
      title: "Ratkaisu",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "results",
      title: "Tulokset",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Selite", type: "string" }),
            defineField({ name: "value", title: "Arvo", type: "string" }),
            defineField({ name: "description", title: "Kuvaus", type: "string" }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
    }),
    defineField({
      name: "technologies",
      title: "Teknologiat",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "testimonial",
      title: "Asiakaspalaute",
      type: "object",
      fields: [
        defineField({ name: "quote", title: "Lainaus", type: "text", rows: 3 }),
        defineField({ name: "author", title: "Henkilö", type: "string" }),
        defineField({ name: "role", title: "Rooli", type: "string" }),
      ],
    }),
    defineField({ name: "projectUrl", title: "Projektin URL", type: "url" }),
    defineField({ name: "completedAt", title: "Valmistunut", type: "date" }),
    defineField({ name: "featured", title: "Nosta etusivulle", type: "boolean", initialValue: false }),
    defineField({ name: "seo", title: "SEO", type: "seoFields" }),
  ],
  orderings: [{ title: "Valmistunut (uusin ensin)", name: "completedAtDesc", by: [{ field: "completedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "client", media: "coverImage" },
  },
});

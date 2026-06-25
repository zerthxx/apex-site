import { defineField, defineType } from "sanity";

export default defineType({
  name: "seoFields",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Meta-otsikko",
      type: "string",
      description: "Max 60 merkkiä",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "description",
      title: "Meta-kuvaus",
      type: "text",
      rows: 3,
      description: "Max 160 merkkiä",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "ogImage",
      title: "OG-kuva",
      type: "image",
      description: "Suositeltu koko: 1200×630 px",
    }),
    defineField({
      name: "noIndex",
      title: "Estä hakukoneet",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons";

export default defineType({
  name: "category",
  title: "Kategoria",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({ name: "title", title: "Nimi", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "color",
      title: "Väri",
      type: "string",
      description: "Tailwind-väriluokka esim. 'teal' tai 'copper'",
      options: { list: ["copper", "teal", "success", "error", "default"] },
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "color" },
  },
});

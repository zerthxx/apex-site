import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export default defineType({
  name: "teamMember",
  title: "Tiimin jäsen",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({ name: "name", title: "Nimi", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "role", title: "Rooli", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "photo", title: "Kuva", type: "image", options: { hotspot: true } }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 3 }),
    defineField({ name: "linkedIn", title: "LinkedIn URL", type: "url" }),
    defineField({
      name: "order",
      title: "Järjestys",
      type: "number",
      description: "Pienin numero = ensimmäinen",
    }),
  ],
  orderings: [{ title: "Järjestys", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});

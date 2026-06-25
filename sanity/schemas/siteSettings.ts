import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

export default defineType({
  name: "siteSettings",
  title: "Sivuston asetukset",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({ name: "phone", title: "Puhelinnumero", type: "string" }),
    defineField({ name: "email", title: "Sähköposti", type: "string" }),
    defineField({ name: "address", title: "Osoite", type: "string" }),
    defineField({ name: "businessId", title: "Y-tunnus", type: "string" }),
    defineField({
      name: "socialLinks",
      title: "Somelinkit",
      type: "object",
      fields: [
        defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
        defineField({ name: "github", title: "GitHub", type: "url" }),
        defineField({ name: "twitter", title: "Twitter/X", type: "url" }),
      ],
    }),
    defineField({
      name: "defaultSeo",
      title: "Oletusseo",
      type: "seoFields",
    }),
    defineField({ name: "googleMapsEmbed", title: "Google Maps Embed URL", type: "url" }),
  ],
  preview: {
    prepare: () => ({ title: "Sivuston asetukset" }),
  },
});

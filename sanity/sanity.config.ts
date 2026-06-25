import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { codeInput } from "@sanity/code-input";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "apex-site",
  title: "Apex Site Studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Sisältö")
          .items([
            S.listItem()
              .title("Sivuston asetukset")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            S.documentTypeListItem("blogPost").title("Blogiartikkelit"),
            S.documentTypeListItem("caseStudy").title("Referenssit"),
            S.documentTypeListItem("teamMember").title("Tiimi"),
            S.documentTypeListItem("category").title("Kategoriat"),
          ]),
    }),
    visionTool(),
    codeInput(),
  ],
  schema: {
    types: schemaTypes,
  },
});

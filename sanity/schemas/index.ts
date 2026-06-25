import blogPost from "./blogPost";
import caseStudy from "./caseStudy";
import teamMember from "./teamMember";
import siteSettings from "./siteSettings";
import category from "./category";
import seoFields from "./objects/seo";

export const schemaTypes = [
  // Singletons
  siteSettings,
  // Documents
  blogPost,
  caseStudy,
  teamMember,
  category,
  // Objects
  seoFields,
];

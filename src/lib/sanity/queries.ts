import { groq } from "next-sanity";

export const blogPostsQuery = groq`
  *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    coverImage { asset->{url}, alt },
    publishedAt,
    "author": author->{ name, role, photo { asset->{url} } },
    "categories": categories[]->{ title, slug, color },
    featured
  }
`;

export const featuredBlogPostsQuery = groq`
  *[_type == "blogPost" && featured == true && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    excerpt,
    coverImage { asset->{url}, alt },
    publishedAt,
    "author": author->{ name, role, photo { asset->{url} } },
    "categories": categories[]->{ title, slug, color }
  }
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    excerpt,
    coverImage { asset->{url}, alt },
    body,
    publishedAt,
    "author": author->{ name, role, bio, photo { asset->{url} }, linkedIn },
    "categories": categories[]->{ title, slug, color },
    seo
  }
`;

export const blogPostSlugsQuery = groq`
  *[_type == "blogPost" && !(_id in path("drafts.**"))].slug.current
`;

export const caseStudiesQuery = groq`
  *[_type == "caseStudy" && !(_id in path("drafts.**"))] | order(completedAt desc) {
    _id,
    title,
    slug,
    client,
    service,
    coverImage { asset->{url}, alt },
    "outcomeLabel": results[0].label,
    "outcomeValue": results[0].value,
    technologies,
    featured
  }
`;

export const caseStudyBySlugQuery = groq`
  *[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    client,
    service,
    coverImage { asset->{url}, alt },
    gallery[] { asset->{url}, alt },
    brief,
    solution,
    results,
    technologies,
    testimonial,
    projectUrl,
    completedAt,
    seo
  }
`;

export const caseStudySlugsQuery = groq`
  *[_type == "caseStudy" && !(_id in path("drafts.**"))].slug.current
`;

export const teamMembersQuery = groq`
  *[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    role,
    bio,
    photo { asset->{url} },
    linkedIn
  }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    phone,
    email,
    address,
    businessId,
    socialLinks,
    defaultSeo,
    googleMapsEmbed
  }
`;

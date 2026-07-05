import type { SeoContext } from "./seoContext";
import { DEFAULT_SEO_CONTEXT } from "./seoContext";

export type { SeoContext } from "./seoContext";
export {
  buildSeoContextFromPublicSettings,
  DEFAULT_SEO_CONTEXT,
  DEFAULT_OG_IMAGE,
  interpolateCompanyName,
  SITE_NAME,
  SITE_URL,
} from "./seoContext";

// TODO: Future improvement: generate dynamic Open Graph images for project pages.

type BuildMetaOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  seo?: SeoContext;
};

type SchemaProject = {
  slug: string;
  title: string;
  description?: string | null;
  tags?: string[] | null;
};

function resolveSeo(seo?: SeoContext): SeoContext {
  return seo ?? DEFAULT_SEO_CONTEXT;
}

export function absoluteUrl(path = "/", seo?: SeoContext) {
  const ctx = resolveSeo(seo);
  return `${ctx.siteUrl}${path === "/" ? "/" : path}`;
}

export function buildMeta({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
  seo,
}: BuildMetaOptions) {
  const ctx = resolveSeo(seo);
  const url = absoluteUrl(path, ctx);
  const ogImage = image ?? ctx.defaultOgImage;

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: ctx.siteName },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
  ];
}

export const servicesOffered = [
  "Web Design",
  "Web Development",
  "Brand Identity",
  "Conversion Strategy",
  "Maintenance & Support",
];

export function organizationSchema(seo?: SeoContext) {
  const ctx = resolveSeo(seo);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ctx.siteName,
    url: ctx.siteUrl,
    email: ctx.contactEmail,
    founder: {
      "@type": "Person",
      name: "Kim",
    },
    logo: ctx.defaultOgImage,
  };
}

export function professionalServiceSchema(seo?: SeoContext) {
  const ctx = resolveSeo(seo);
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: ctx.siteName,
    url: ctx.siteUrl,
    email: ctx.contactEmail,
    founder: {
      "@type": "Person",
      name: "Kim",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Stockholm",
      addressCountry: "SE",
    },
    areaServed: "Sweden",
    serviceType: servicesOffered,
  };
}

export function websiteSchema(seo?: SeoContext) {
  const ctx = resolveSeo(seo);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ctx.siteName,
    url: ctx.siteUrl,
  };
}

export function webPageSchema({
  path,
  title,
  description,
  seo,
}: {
  path: string;
  title: string;
  description: string;
  seo?: SeoContext;
}) {
  const ctx = resolveSeo(seo);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path, ctx),
    isPartOf: {
      "@type": "WebSite",
      name: ctx.siteName,
      url: ctx.siteUrl,
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>, seo?: SeoContext) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, seo),
    })),
  };
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function projectSchema(project: SchemaProject, seo?: SeoContext) {
  const ctx = resolveSeo(seo);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.title} Website Concept`,
    description: project.description ?? "",
    url: absoluteUrl(`/work/${project.slug}`, ctx),
    creator: {
      "@type": "Organization",
      name: ctx.siteName,
      url: ctx.siteUrl,
    },
    about: project.tags ?? [],
  };
}

export const SITE_URL = "https://kwstudio.se";
export const SITE_NAME = "KWStudio";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

// TODO: Future improvement: generate dynamic Open Graph images for project pages.

type BuildMetaOptions = {
    title: string;
    description: string;
    path: string;
    image?: string;
    type?: "website" | "article";
    noindex?: boolean;
};

type SchemaProject = {
    slug: string;
    title: string;
    description?: string | null;
    tags?: string[] | null;
};

export function absoluteUrl(path = "/") {
    return `${SITE_URL}${path === "/" ? "/" : path}`;
}

export function buildMeta({ title, description, path, image = DEFAULT_OG_IMAGE, type = "website", noindex = false }: BuildMetaOptions) {
    const url = absoluteUrl(path);

    return [
        { title },
        { name: "description", content: description },
        { tagName: "link", rel: "canonical", href: url },
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:type", content: type },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
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

export function organizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        email: "hello@kwstudio.se",
        founder: {
            "@type": "Person",
            name: "Kim",
        },
        logo: `${SITE_URL}/og-image.svg`,
    };
}

export function professionalServiceSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        name: SITE_NAME,
        url: SITE_URL,
        email: "hello@kwstudio.se",
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

export function websiteSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
    };
}

export function webPageSchema({ path, title, description }: { path: string; title: string; description: string }) {
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: absoluteUrl(path),
        isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
        },
    };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
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

export function projectSchema(project: SchemaProject) {
    return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: `${project.title} Website Concept`,
        description: project.description ?? "",
        url: absoluteUrl(`/work/${project.slug}`),
        creator: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
        },
        about: project.tags ?? [],
    };
}

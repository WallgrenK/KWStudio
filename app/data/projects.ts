export const projects = [
    {
        slug: "palo-house",
        title: "Palo House",
        category: "Website Concept",
        description: "Brand refresh and editorial website concept for a boutique interiors brand.",
        tags: ["Concept", "Website Design", "Brand Direction"],
        featuredImage: "https://images.unsplash.com/photo-1618220252344-8ec99ec624b1?auto=format&fit=crop&w=1200&q=80",
        heroImage: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80",
        overview: "A calm editorial website direction for a interiors brand that needs to communicate taste, quality and trust from the first screen.",
        challenge: "The brand needed a digital presence that felt high-end without becoming cold or overly decorative.",
        approach: "The concept uses generous whitespace, refined typography and product-led imagery to create a slower, more considered browsing experience.",
        solution: "A modular editorial layout with clear service paths, subtle brand details and conversion points that feel natural rather than forced.",
        result: "A premium concept system that would help a boutique brand appear established and enquiry-ready.",
        gallery: [
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
        ],
    },
    {
        slug: "northbound",
        title: "Northbound",
        category: "Strategy Website",
        description: "Modern dashboard-inspired website for a strategy and consulting firm.",
        tags: ["Concept", "Website Design", "Conversion Flow"],
        featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
        overview: "A structured concept for a consulting firm that needs to make complex expertise feel sharp, credible and actionable.",
        challenge: "The site had to avoid generic corporate language while still feeling serious enough for high-value business decisions.",
        approach: "The design borrows from dashboard interfaces, using measured grids, proof points and clear content pathways.",
        solution: "A confidence-building site structure with insight-led sections, strong hierarchy and a conversion path for consultation requests.",
        result: "A modern business website concept that presents strategic expertise with clarity and momentum.",
        gallery: [
            "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
        ],
    },
    {
        slug: "maison-vala",
        title: "Maison Vala",
        category: "Ecommerce Concept",
        description: "Minimal ecommerce concept for a refined lifestyle brand.",
        tags: ["Concept", "Ecommerce", "Brand Direction"],
        featuredImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
        heroImage: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80",
        overview: "A refined ecommerce direction for a lifestyle brand that wants the online shop to feel as considered as the product itself.",
        challenge: "The concept needed to balance minimal styling with enough warmth and clarity to encourage exploration.",
        approach: "The structure uses quiet product presentation, simple navigation and conversion moments that do not interrupt the brand experience.",
        solution: "A clean product-led system with editorial landing pages, strong mobile layouts and a checkout path designed around trust.",
        result: "A premium commerce concept that feels elegant, practical and ready for growth.",
        gallery: [
            "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        ],
    },
];

export function getProjectBySlug(slug: string | undefined) {
    return projects.find((project) => project.slug === slug);
}

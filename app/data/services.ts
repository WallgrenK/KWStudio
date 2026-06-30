import { Box, Code, Diamond, Rocket, Settings } from "lucide-react";
import type { Dictionary } from "~/i18n/types";

const serviceBase = [
    {
        slug: "web-design",
        icon: Rocket,
        number: "01",
    },
    {
        slug: "web-development",
        icon: Code,
        number: "02",
    },
    {
        slug: "brand-identity",
        icon: Diamond,
        number: "03",
    },
    {
        slug: "conversion-strategy",
        icon: Box,
        number: "04",
    },
    {
        slug: "maintenance-support",
        icon: Settings,
        number: "05",
    },
];

export function getServices(dictionary: Dictionary) {
    const translatedServices = dictionary.serviceData as Array<{
        title: string;
        shortDescription: string;
        benefits: string[];
        features: string[];
    }>;

    return serviceBase.map((service, index) => ({
        ...service,
        ...translatedServices[index],
    }));
}

export const services = getServices({
    serviceData: [
        {
            title: "Web Design",
            shortDescription: "Premium website design that helps visitors understand your business and feel confident taking the next step.",
            benefits: [
                "A stronger first impression for potential customers",
                "Clearer communication around what you offer",
                "A website experience that feels professional on every screen",
            ],
            features: ["Homepage direction", "Core page layouts", "Mobile-first structure", "Trust-focused hierarchy"],
        },
        {
            title: "Web Development",
            shortDescription: "A fast, reliable website build that feels polished for visitors and manageable for your business.",
            benefits: [
                "A smoother experience for visitors on every device",
                "A dependable site that is easier to update over time",
                "A technical foundation that can support future growth",
            ],
            features: ["Responsive development", "Performance-minded build", "Clean structure", "Launch preparation"],
        },
        {
            title: "Brand Identity",
            shortDescription: "A focused visual identity that helps your business look more established and easier to remember.",
            benefits: [
                "A more consistent and professional brand presence",
                "Clearer positioning around what makes you different",
                "A visual direction that avoids generic template sameness",
            ],
            features: ["Logo guidance", "Color direction", "Typography system", "Digital brand rules"],
        },
        {
            title: "Conversion Strategy",
            shortDescription: "Messaging and page flow designed to turn interest into clear, confident enquiries.",
            benefits: [
                "Clearer reasons for visitors to take action",
                "Less friction between interest and enquiry",
                "A website that supports business goals, not just presentation",
            ],
            features: ["Page flow", "CTA strategy", "Trust signals", "Messaging structure"],
        },
        {
            title: "Maintenance & Support",
            shortDescription: "Ongoing support that keeps your website current, credible and useful after launch.",
            benefits: [
                "Less stress when your website needs changes",
                "A site that stays polished as your business evolves",
                "A reliable partner for small improvements over time",
            ],
            features: ["Content updates", "Small improvements", "Technical checks", "Ongoing guidance"],
        },
    ],
});

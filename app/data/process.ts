import type { Dictionary } from "~/i18n/types";

export function getProcessSteps(dictionary: Dictionary) {
    return (dictionary.processData as Array<{ title: string; description: string; deliverables: string[] }>).map((step, index) => ({
        number: String(index + 1).padStart(2, "0"),
        ...step,
    }));
}

export const processSteps = getProcessSteps({
    processData: [
        {
            title: "Discovery",
            description: "We clarify your goals, audience, offer and the role your website needs to play in the business.",
            deliverables: ["Goal definition", "Audience notes", "Page priorities"],
        },
        {
            title: "Design",
            description: "We create a focused visual direction and page structure that builds trust and guides visitors.",
            deliverables: ["Visual direction", "Key layouts", "Conversion flow"],
        },
        {
            title: "Development",
            description: "We turn the design into a responsive, maintainable website with clean implementation.",
            deliverables: ["Responsive build", "Performance basics", "Content integration"],
        },
        {
            title: "Launch",
            description: "We prepare the site for release, check the details and make sure the experience is ready.",
            deliverables: ["Final QA", "Launch support", "Handover"],
        },
        {
            title: "Support",
            description: "We keep the site polished and provide a clear path for future improvements.",
            deliverables: ["Updates", "Guidance", "Ongoing refinements"],
        },
    ],
});

import type { Dictionary } from "~/i18n/types";

export function getServiceFaqs(dictionary: Dictionary) {
    return dictionary.faqs.services as Array<{ question: string; answer: string }>;
}

export function getContactFaqs(dictionary: Dictionary) {
    return dictionary.faqs.contact as Array<{ question: string; answer: string }>;
}

export const serviceFaqs = [
    {
        question: "What kind of businesses does KWStudio work with?",
        answer: "KWStudio is best suited for small businesses that want a polished, professional website and value clear communication.",
    },
    {
        question: "Can you help if I do not have a finished brand identity?",
        answer: "Yes. Brand direction can be included so the website feels cohesive, credible and ready to launch.",
    },
    {
        question: "Do you only design, or do you also build?",
        answer: "KWStudio handles both design and development, which keeps the final website aligned with the original direction.",
    },
    {
        question: "Do you offer ongoing support?",
        answer: "Yes. Maintenance and support can be added after launch for updates, small improvements and technical care.",
    },
];

export const contactFaqs = [
    {
        question: "What happens after I send an enquiry?",
        answer: "You will get a reply with a few follow-up questions and a recommendation for the next step.",
    },
    {
        question: "Do I need to know exactly what I want?",
        answer: "No. A clear business goal is enough to start. The website structure can be shaped during discovery.",
    },
    {
        question: "Can KWStudio work with an existing website?",
        answer: "Yes. Existing websites can be refined, redesigned or rebuilt depending on what your business needs.",
    },
    {
        question: "How much does a website project typically cost?",
        answer: "Project scope varies, so most projects begin with a conversation to understand your goals, requirements and budget before recommending the right direction.",
    },
];

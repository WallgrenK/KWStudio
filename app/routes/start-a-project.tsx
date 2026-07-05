import { useState } from "react";
import { ArrowUpRight, CheckCircle2, ClipboardList, Layers3, MessageSquare } from "lucide-react";
import { FaqList } from "~/components/faqlist";
import { Footer } from "~/components/footer";
import { JsonLd } from "~/components/jsonld";
import { Navigation } from "~/components/navigation";
import { SectionHeader } from "~/components/sectionheader";
import { getContactFaqs } from "~/data/faqs";
import { useI18n } from "~/i18n";
import { breadcrumbSchema, buildMeta, faqPageSchema, interpolateCompanyName, webPageSchema } from "~/lib/seo";
import { interpolateBusinessIdentity } from "~/settings/interpolateBusinessIdentity";
import { getPortalBrandInitials } from "~/settings/portalHelpers";
import { usePublicWebsiteSettings } from "~/settings/usePublicWebsiteSettings";
import { notifyEnquiryEmail } from "~/utils/enquiry-email";
import { supabase } from "~/utils/supabase";

const pageTitle = "Start a Website Project | KWStudio";
const pageDescription =
    "Send a website project enquiry to KWStudio and start a web design consultation about your goals, budget and next steps.";

export function meta() {
    // TODO: Future locale-aware metadata generation.
    // TODO: Future localized routing support. Example: /en/start-a-project and /sv/starta-projekt.
    return buildMeta({
        title: pageTitle,
        description: pageDescription,
        path: "/start-a-project",
    });
}

export default function StartAProjectPage() {
    const { t, dictionary } = useI18n();
    const website = usePublicWebsiteSettings();
    const companyName = website.companyName;
    const contactEmail = website.contactEmail;
    const identity = { companyName, contactEmail };
    const localize = (text: string) => interpolateBusinessIdentity(text, identity);
    const brandInitials = getPortalBrandInitials(companyName);
    const pageTitleResolved = interpolateCompanyName(pageTitle, companyName);
    const pageDescriptionResolved = interpolateCompanyName(pageDescription, companyName);
    const budgetOptions = dictionary.startProject.budgetOptions as string[];
    const nextSteps = dictionary.startProject.nextSteps.items as string[];
    const contactFaqs = getContactFaqs(dictionary);
    const founderLines = dictionary.startProject.founder.lines as string[];
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const formData = new FormData(event.currentTarget);
        const enquiry = {
            name: String(formData.get("name") ?? "").trim(),
            company: String(formData.get("company") ?? "").trim() || null,
            email: String(formData.get("email") ?? "").trim(),
            budget: String(formData.get("budget") ?? "").trim() || null,
            message: String(formData.get("details") ?? "").trim(),
            recipient: contactEmail,
            subject: `${companyName} Project Inquiry`,
        };

        const { error } = await supabase.from("enquiries").insert(enquiry);

        if (error) {
            console.error("Could not save project enquiry.", error);
            setSubmitError(localize(t("startProject.error")));
            setIsSubmitting(false);
            return;
        }

        void notifyEnquiryEmail({
            name: enquiry.name,
            email: enquiry.email,
            company: enquiry.company,
            budget: enquiry.budget,
            message: enquiry.message,
            source: "start-a-project",
            recipient: contactEmail,
            subject: enquiry.subject,
            companyName,
        });
        setSubmitted(true);
        setIsSubmitting(false);
    }

    return (
        <>
            <JsonLd
                data={[
                    webPageSchema({ path: "/start-a-project", title: pageTitleResolved, description: pageDescriptionResolved }),
                    breadcrumbSchema([
                        { name: t("nav.home"), path: "/" },
                        { name: t("nav.startProject"), path: "/start-a-project" },
                    ]),
                    faqPageSchema(contactFaqs),
                ]}
            />
            <Navigation />
            <main className="project-start-redesign">
                <section className="project-brief-hero">
                    <div className="container project-brief-hero-inner">
                        <div>
                            <p className="eyebrow">{t("startProject.hero.eyebrow")}</p>
                            <h1>{t("startProject.hero.title")}</h1>
                            <p>{t("startProject.hero.text")}</p>
                            <div className="project-brief-actions">
                                <a className="btn btn-primary" href="#project-brief-form">
                                    {t("startProject.submit")} <ArrowUpRight size={18} aria-hidden="true" />
                                </a>
                                <a className="btn btn-outline" href="/process">
                                    {t("common.seeProcess")}
                                </a>
                            </div>
                        </div>

                        <aside className="project-brief-snapshot">
                            <span>{t("startProject.founder.eyebrow")}</span>
                            <strong>{t("startProject.founder.reply")}</strong>
                            <p>{t("startProject.reassurance")}</p>
                        </aside>
                    </div>
                </section>

                <section className="project-brief-shell-section">
                    <div className="container project-brief-shell">
                        <aside className="project-brief-sidebar">
                            <div className="project-brief-founder">
                                <p className="eyebrow">{t("startProject.founder.eyebrow")}</p>
                                <h2>{t("startProject.founder.name")}</h2>
                                <p>{t("startProject.founder.role")}</p>
                                {founderLines.map((line) => <span key={line}>{line}</span>)}
                            </div>

                            <div className="project-brief-step-list">
                                {nextSteps.map((step, index) => {
                                    const Icon = [ClipboardList, MessageSquare, Layers3, CheckCircle2][index] ?? CheckCircle2;

                                    return (
                                        <article key={step}>
                                            <Icon size={20} aria-hidden="true" />
                                            <span>{String(index + 1).padStart(2, "0")}</span>
                                            <p>{step}</p>
                                        </article>
                                    );
                                })}
                            </div>
                        </aside>

                        <form id="project-brief-form" className="project-brief-form" onSubmit={handleSubmit}>
                            {submitted ? (
                                <div className="contact-success" role="status" aria-live="polite">
                                    <h2>{t("startProject.successTitle")}</h2>
                                    <p>{localize(t("startProject.successText"))}</p>
                                    <span>{localize(t("startProject.successNote"))}</span>
                                    <div>
                                        <a href="/work">{t("common.viewWork")}</a>
                                        <a href="/process">{t("common.seeProcess")}</a>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="project-brief-form-heading">
                                        <span>{t("startProject.nextSteps.eyebrow")}</span>
                                        <h2>{t("startProject.nextSteps.title")}</h2>
                                    </div>

                                    <div className="project-brief-field-grid">
                                        <label>{t("startProject.labels.name")}<input required name="name" autoComplete="name" /></label>
                                        <label>{t("startProject.labels.company")}<input name="company" autoComplete="organization" /></label>
                                        <label>{t("startProject.labels.email")}<input required type="email" name="email" autoComplete="email" /></label>
                                        <label>{t("startProject.labels.budget")}<select required name="budget" defaultValue="">
                                            <option value="" disabled>{t("startProject.budgetPlaceholder")}</option>
                                            {budgetOptions.map((option) => <option key={option}>{option}</option>)}
                                        </select></label>
                                    </div>

                                    <label>{t("startProject.labels.details")}<textarea required name="details" placeholder={t("startProject.detailsPlaceholder")} /></label>
                                    <p className="contact-reassurance">{t("startProject.reassurance")}</p>
                                    {submitError ? <p className="contact-error" role="alert">{submitError}</p> : null}
                                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? t("startProject.sending") : t("startProject.submit")}
                                    </button>
                                    <div className="contact-email-option">
                                        <p>{t("common.preferEmail")}</p>
                                        <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`${companyName} Project Inquiry`)}`}>{contactEmail}</a>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </section>

                <section className="page-section">
                <div className="container split-section">
                    <SectionHeader eyebrow={t("startProject.faq.eyebrow")} title={t("startProject.faq.title")} />
                    <FaqList items={contactFaqs} />
                </div>
                </section>

            </main>
            <Footer hideCta />
        </>
    );
}

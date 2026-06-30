import { Check } from "lucide-react";
import { CtaSection } from "~/components/ctasection";
import { FaqList } from "~/components/faqlist";
import { Footer } from "~/components/footer";
import { JsonLd } from "~/components/jsonld";
import { Navigation } from "~/components/navigation";
import { PageHero } from "~/components/pagehero";
import { SectionHeader } from "~/components/sectionheader";
import { getServiceFaqs } from "~/data/faqs";
import { getServices } from "~/data/services";
import { useI18n } from "~/i18n";
import { breadcrumbSchema, buildMeta, faqPageSchema, webPageSchema } from "~/lib/seo";

const pageTitle = "Web Design, Development & Brand Identity Services | KWStudio";
const pageDescription =
    "Explore KWStudio web design services, website development services, brand identity, conversion strategy and support for conversion-focused websites.";

export function meta() {
    // TODO: Future locale-aware metadata generation.
    // TODO: Future localized routing support. Example: /en/services and /sv/tjanster.
    return buildMeta({
        title: pageTitle,
        description: pageDescription,
        path: "/services",
    });
}

export default function ServicesPage() {
    const { t, dictionary } = useI18n();
    const services = getServices(dictionary);
    const outcomes = dictionary.servicesPage.outcomes.items as string[];
    const serviceFaqs = getServiceFaqs(dictionary);

    return (
        <>
            <JsonLd
                data={[
                    webPageSchema({ path: "/services", title: pageTitle, description: pageDescription }),
                    breadcrumbSchema([
                        { name: t("nav.home"), path: "/" },
                        { name: t("nav.services"), path: "/services" },
                    ]),
                    faqPageSchema(serviceFaqs),
                ]}
            />
            <Navigation />
            <main>
                <PageHero
                    eyebrow={t("servicesPage.hero.eyebrow")}
                    title={t("servicesPage.hero.title")}
                    text={t("servicesPage.hero.text")}
                />

                <section className="page-section service-outcomes">
                <div className="container service-outcomes-inner">
                    <SectionHeader
                        eyebrow={t("servicesPage.outcomes.eyebrow")}
                        title={t("servicesPage.outcomes.title")}
                    />
                    <div className="outcome-grid">
                        {outcomes.map((outcome, index) => (
                            <article key={outcome} className="outcome-card">
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h3>{outcome}</h3>
                            </article>
                        ))}
                    </div>
                </div>
                </section>

                <section className="page-section services-overview">
                <div className="container">
                    <SectionHeader
                        eyebrow={t("servicesPage.overview.eyebrow")}
                        title={t("servicesPage.overview.title")}
                        text={t("servicesPage.overview.text")}
                    />
                    <div className="service-overview-grid">
                        {services.map((service) => {
                            const Icon = service.icon;
                            return (
                                <article className="service-overview-card" key={service.slug}>
                                    <span>{service.number}</span>
                                    <Icon size={30} strokeWidth={1.8} />
                                    <h3>{service.title}</h3>
                                    <p>{service.shortDescription}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
                </section>

                <section className="page-section service-detail-section">
                <div className="container service-detail-list">
                    {services.map((service) => (
                        <article className="service-detail-block" key={service.slug}>
                            <div>
                                <p className="eyebrow">{service.number}</p>
                                <h2>{service.title}</h2>
                                <p>{service.shortDescription}</p>
                            </div>
                            <div className="service-benefits">
                                {service.benefits.map((benefit) => (
                                    <p key={benefit}><Check size={18} />{benefit}</p>
                                ))}
                            </div>
                            <ul>
                                {service.features.map((feature) => (
                                    <li key={feature}>{feature}</li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
                </section>

                <section className="page-section why-kw">
                <div className="container why-kw-inner">
                    <SectionHeader
                        eyebrow={t("servicesPage.why.eyebrow")}
                        title={t("servicesPage.why.title")}
                        text={t("servicesPage.why.text")}
                    />
                    <div className="why-kw-points">
                        {(dictionary.servicesPage.why.points as string[]).map((point) => <span key={point}>{point}</span>)}
                    </div>
                </div>
                </section>

                <section className="page-section">
                <div className="container split-section">
                    <SectionHeader eyebrow={t("servicesPage.faq.eyebrow")} title={t("servicesPage.faq.title")} />
                    <FaqList items={serviceFaqs} />
                </div>
                </section>

                <CtaSection />
            </main>
            <Footer hideCta />
        </>
    );
}

import { CtaSection } from "~/components/ctasection";
import { Footer } from "~/components/footer";
import { JsonLd } from "~/components/jsonld";
import { Navigation } from "~/components/navigation";
import { SectionHeader } from "~/components/sectionheader";
import { getProcessSteps } from "~/data/process";
import { useI18n } from "~/i18n";
import { breadcrumbSchema, buildMeta, webPageSchema } from "~/lib/seo";

const pageTitle = "A Clear Website Design Process | KWStudio";
const pageDescription =
    "See the KWStudio website design process and web development process, built around a clear project workflow from discovery to launch.";

export function meta() {
    // TODO: Future locale-aware metadata generation.
    // TODO: Future localized routing support. Example: /en/process and /sv/process.
    return buildMeta({
        title: pageTitle,
        description: pageDescription,
        path: "/process",
    });
}

export default function ProcessPage() {
    const { t, dictionary } = useI18n();
    const processBenefits = dictionary.processPage.benefits.items as string[];
    const processSteps = getProcessSteps(dictionary);
    const typicalTimeline = dictionary.processPage.timeline.items as string[][];

    return (
        <>
            <JsonLd
                data={[
                    webPageSchema({ path: "/process", title: pageTitle, description: pageDescription }),
                    breadcrumbSchema([
                        { name: t("nav.home"), path: "/" },
                        { name: t("nav.process"), path: "/process" },
                    ]),
                ]}
            />
            <Navigation />
            <main className="process-redesign">
                <section className="process-blueprint-hero">
                    <div className="container process-blueprint-hero-inner">
                        <div className="process-blueprint-copy">
                            <p className="eyebrow">{t("processPage.hero.eyebrow")}</p>
                            <h1>{t("processPage.hero.title")}</h1>
                            <p>{t("processPage.hero.text")}</p>
                        </div>

                        <div className="process-blueprint-card" aria-label={t("processPage.timeline.eyebrow")}>
                            <span>{t("processPage.timeline.eyebrow")}</span>
                            <strong>{t("processPage.timeline.title")}</strong>
                            <p>{t("processPage.timeline.text")}</p>
                        </div>
                    </div>
                </section>

                <section className="process-principles-section">
                    <div className="container process-principles">
                        {processBenefits.map((benefit, index) => (
                            <article key={benefit}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h2>{benefit}</h2>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="process-blueprint-section">
                    <div className="container process-blueprint-layout">
                        <aside className="process-blueprint-aside">
                            <SectionHeader
                                eyebrow={t("processPage.benefits.eyebrow")}
                                title={t("processPage.benefits.title")}
                                text={t("processPage.benefits.text")}
                            />
                        </aside>

                        <div className="process-blueprint-steps">
                            {processSteps.map((step) => (
                                <article key={step.number}>
                                    <span>{step.number}</span>
                                    <div>
                                        <h2>{step.title}</h2>
                                        <p>{step.description}</p>
                                    </div>
                                    <ul>
                                        {step.deliverables.map((deliverable) => (
                                            <li key={deliverable}>{deliverable}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="process-calendar-section">
                    <div className="container process-calendar-layout">
                        <SectionHeader
                            eyebrow={t("processPage.timeline.eyebrow")}
                            title={t("processPage.timeline.title")}
                            text={t("processPage.timeline.text")}
                        />
                        <div className="process-calendar">
                            {typicalTimeline.map(([week, label]) => (
                                <article key={week}>
                                    <span>{week}</span>
                                    <h3>{label}</h3>
                                </article>
                            ))}
                        </div>
                        <p className="process-reassurance">{t("processPage.timeline.reassurance")}</p>
                    </div>
                </section>

                <CtaSection />
            </main>
            <Footer hideCta />
        </>
    );
}
